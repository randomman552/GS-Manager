import os
import signal
import time
from subprocess import Popen, PIPE, STDOUT, TimeoutExpired

from .models import GameServer
from .socketIO import socketIO

__running = dict()


def __on_server_exit(server_id: str):
    process: Popen = __running.pop(server_id)
    GameServer.objects(id=server_id).update(
        set__status="stopped",
        push__output=f"Exited with code '{process.returncode}'"
    )
    socketIO.emit(
        "output",
        {"server_id": server_id, "output": f"Exited with code '{process.returncode}'"},
        namespace="/servers"
    )
    socketIO.emit("status", {"server_id": server_id, "status": "stopped"}, namespace="/servers")


def __read_stdout(server_id: str) -> None:
    """
    Internal helper function called on a separate thread to read from the STDOUT
    of the server with the given id to prevent pipes becoming saturated.
    Automatically exits when the process ends.
    :param server_id: The id of the server to read from
    """
    try:
        while __running.get(server_id) is not None:
            server = GameServer.objects(id=server_id).first()
            process = __running.get(server_id)
            line = process.stdout.readline().decode("utf-8")
            if line:
                socketIO.emit("output", {"server_id": server_id, "output": line}, namespace="/servers")
                GameServer.objects(id=server_id).update(push__output=line)
            server.save()
    except (ValueError, AttributeError):
        # Catch value error raised when stdout pipe is broken
        pass


def __poll_process(server_id: str) -> None:
    """
    Internal helper function to continually poll the process for the server with the given id.
    :param server_id: The ID of the server to poll.
    """
    process: Popen = __running.get(server_id)
    process.wait()
    # Inform of server closure if process was not killed by us
    if process.returncode >= 0:
        __on_server_exit(server_id)


def __create_process(working_directory: str, command: str) -> Popen:
    """
    Helper function wrapping the Popen interface to launch server commands.
    :param working_directory: The directory to execute the command in.
    :param command: The command to execute.
    """
    return Popen(
        command,
        stdin=PIPE,
        stdout=PIPE,
        stderr=STDOUT,
        shell=True,
        start_new_session=True,
        cwd=working_directory
    )


def __start_watcher_threads(server_id: str) -> None:
    """
    Helper function to start threads to watch the server process with the given id.
    :param server_id: The id of the server to watch.
    """
    socketIO.start_background_task(__read_stdout, server_id)
    socketIO.start_background_task(__poll_process, server_id)


def start_server(server: GameServer) -> bool:
    """
    Utility method to start the given server.
    :return: True if the server was started, false otherwise.
    """
    server_id = str(server.id)
    if not __running.get(server_id) or not server.is_running:
        process = __create_process(server.working_directory, server.current_start_cmd)
        __running[server_id] = process

        __start_watcher_threads(server_id)

        server.status = "started"
        server.output = [server.current_start_cmd]
        socketIO.emit("output", {"server_id": server_id, "output": server.current_start_cmd}, namespace="/servers")
        socketIO.emit("status", {"server_id": server_id, "status": "started"}, namespace="/servers")
        server.save()
        return True
    return False


def update_server(server: GameServer) -> bool:
    """
    Utility method to update the given server.
    :return: True if update was started, false otherwise.
    """
    server_id = str(server.id)
    if not __running.get(server_id) or not server.is_running:
        process = __create_process(server.working_directory, server.update_cmd)
        __running[server_id] = process

        __start_watcher_threads(server_id)

        server.status = "updating"
        server.output = [server.update_cmd]
        socketIO.emit("output", {"server_id": server_id, "output": server.update_cmd}, namespace="/servers")
        socketIO.emit("status", {"server_id": server_id, "status": "updating"}, namespace="/servers")
        server.save()
        return True
    return False


def stop_server(server: GameServer) -> bool:
    """
    Utility method to stop the given server.
    :return: True if the server was stopped, false otherwise.
    """
    server_id = str(server.id)
    if __running.get(server_id):
        process: Popen = __running.get(server_id)
        pgid = os.getpgid(process.pid)

        try:
            # Attempt to kill the process with SIGINT, if this fails try SIGKILL
            try:
                os.killpg(pgid, signal.SIGINT)
                process.wait(server.kill_delay)
            except TimeoutExpired:
                # If SIGKILL fails, try SIGTERM
                try:
                    os.killpg(pgid, signal.SIGKILL)
                    process.wait(5)
                except TimeoutExpired:
                    # Finally try SIGTERM
                    os.killpg(pgid, signal.SIGTERM)
                    process.wait()
        except ProcessLookupError:
            # If process lookup error occurs, the process is no longer running.
            # So we can return true
            pass
        __on_server_exit(server_id)
        return True
    return False


def run_command(cmd: str, server: GameServer) -> bool:
    """
    Utility method to run a command on a given server.
    :return: True if the command was run, false otherwise.
    """
    server_id = str(server.id)
    process = __running.get(server_id)
    if process:
        if not cmd.endswith("\n"):
            cmd = f"{cmd}\n"
        process.stdin.write(cmd.encode("utf-8"))
        process.stdin.flush()
        server.output.append(cmd)
        socketIO.emit("output", {"server_id": server_id, "output": cmd}, namespace="/servers")
        server.save()
        return True
    return False

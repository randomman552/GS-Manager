import shlex
import threading
import time

from subprocess import Popen, PIPE, STDOUT

from .models import GameServer

__running = dict()


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
    process = __running.get(server_id)
    while process is not None and process.returncode is None:
        process.poll()
        time.sleep(0.1)

    if __running.get(server_id):
        __running.pop(server_id)
    GameServer.objects(id=server_id).update(
        set__status="stopped",
        push__output=f"Exited with code '{process.returncode}'"
    )


def __create_process(working_directory: str, command: str) -> Popen:
    """
    Helper function wrapping the Popen interface to launch server commands.
    :param working_directory: The directory to execute the command in.
    :param command: The command to execute.
    """
    return Popen(
        shlex.split(command),
        stdin=PIPE,
        stdout=PIPE,
        stderr=STDOUT,
        cwd=working_directory
    )


def __start_watcher_threads(server_id: str) -> None:
    """
    Helper function to start threads to watch the server process with the given id.
    :param server_id: The id of the server to watch.
    """
    out_watcher = threading.Thread(name=f"{server_id} stdout watcher", target=__read_stdout, args=(server_id,))
    poll_watcher = threading.Thread(name=f"{server_id} process watcher", target=__poll_process, args=(server_id,))

    out_watcher.start()
    poll_watcher.start()


def start_server(server: GameServer) -> bool:
    """
    Utility method to start the given server.
    :return: True if the server was started, false otherwise.
    """
    server_id = str(server.id)
    if not __running.get(server_id) or server.status == "stopped":
        process = __create_process(server.working_directory, server.start_cmd)
        __running[server_id] = process

        __start_watcher_threads(server_id)

        server.status = "started"
        server.output = []
        server.save()
        return True
    return False


def update_server(server: GameServer) -> bool:
    """
    Utility method to update the given server.
    :return: True if update was started, false otherwise.
    """
    server_id = str(server.id)
    if not __running.get(server_id) or server.status == "stopped":
        process = __create_process(server.working_directory, server.update_cmd)
        __running[server_id] = process

        __start_watcher_threads(server_id)

        server.status = "updating"
        server.output = []
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
        process = __running.pop(server_id)
        process.kill()
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
        if not cmd.endswith("\r\n"):
            cmd = f"{cmd}\r\n"
        process.stdin.write(cmd.encode("utf-8"))
        process.stdin.flush()
        server.output.append(cmd)
        server.save()
        return True
    return False
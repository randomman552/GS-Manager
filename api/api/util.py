import os
import subprocess
import threading
import time


class ProcessWatchdog(threading.Thread):
    def __init__(self, server, proc: subprocess.Popen):
        super().__init__(name=f"ServerWatchdog:{server.name}")
        self.process = proc
        self.server = server
        print(f"{self.name} started...")

    def run(self) -> None:
        while self.process.returncode is None:
            self.process.poll()
            time.sleep(0.5)
        self.server.status = "stopped"
        self.server.save()
        print(f"{self.name} stopped...")

    def stop(self):
        self.process.kill()


def run_server(server) -> ProcessWatchdog:
    proc = run_command(server.working_directory, server.start_cmd)
    watchdog = ProcessWatchdog(server, proc)
    watchdog.start()
    return watchdog


def run_update(server) -> ProcessWatchdog:
    proc = run_command(server.working_directory, server.update_cmd)
    watchdog = ProcessWatchdog(server, proc)
    watchdog.start()
    return watchdog


def run_command(working_directory: str, command: str) -> subprocess.Popen:
    old_wd = os.getcwd()
    os.chdir(working_directory)

    # Reset in.pipe
    try:
        f = open("in.pipe", "x")
        f.close()
    except FileExistsError:
        os.unlink("in.pipe")
        f = open("in.pipe", "x")
        f.close()

    in_pipe = open("in.pipe", "r")
    out_pipe = open("out.pipe", "w")
    proc = subprocess.Popen(command.split(" "), stdin=in_pipe, stdout=out_pipe, stderr=out_pipe, shell=True)
    os.chdir(old_wd)
    return proc

import os
import subprocess
import threading
import time


class ServerCommandExecutor(threading.Thread):
    """
    Class used to execute a command in a given working directory on another process.
    This class implements threading.Thread.
    """

    def __init__(self, working_dir: str, command: str, on_start=None, on_stop=None):
        """
        :param working_dir: Working directory to move the process to.
        :param command: Command to execute.
        :param on_start: Function to call on start, takes no parameters.
        :param on_stop: Function to call on stop, takes no parameters.
        """
        super().__init__(name=f"Command executor: {command}")
        old_wd = os.getcwd()
        os.chdir(working_dir)

        # Reset in.pipe
        try:
            f = open("in.pipe", "x")
            f.close()
        except FileExistsError:
            os.unlink("in.pipe")
            f = open("in.pipe", "x")
            f.close()

        self.in_pipe = open("in.pipe", "r")
        self.out_pipe = open("out.pipe", "w")
        self.working_dir = working_dir
        self.command = command
        self.process = None
        self.on_start = on_start
        self.on_stop = on_stop
        os.chdir(old_wd)

    @property
    def returncode(self):
        if self.process is not None:
            return self.process.returncode
        return None

    def start(self) -> None:
        old_wd = os.getcwd()
        os.chdir(self.working_dir)

        self.process = subprocess.Popen(
            self.command.split(" "),
            stdin=self.in_pipe,
            stdout=self.out_pipe,
            stderr=self.out_pipe
        )
        os.chdir(old_wd)

        super().start()
        if self.on_start:
            self.on_start()

    def run(self) -> None:
        while self.returncode is None:
            self.process.poll()
            time.sleep(0.5)

        self.in_pipe.close()
        self.out_pipe.close()
        if self.on_stop:
            self.on_stop()

    def kill(self):
        self.process.kill()

import subprocess
import threading
import time
import shlex


class ServerCommandExecutor(threading.Thread):
    """
    Class used to execute a command in a given working directory on another worker.
    This class implements threading.Thread.
    """

    def __init__(self, server, command: str, on_start=None, on_stop=None):
        """
        :param working_dir: Working directory to move the worker to.
        :param command: Command to execute.
        :param on_start: Function to call on start, takes no parameters.
        :param on_stop: Function to call on stop, takes no parameters.
        """
        super().__init__(name=f"Command executor: {command}")
        self.server = server
        self.command = command
        self.process = None
        self.on_start = on_start
        self.on_stop = on_stop

    @property
    def returncode(self):
        if self.process is not None:
            return self.process.returncode
        return None

    @property
    def pid(self):
        return self.process.pid

    def start(self) -> None:
        self.process = subprocess.Popen(
            shlex.split(self.command),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=self.server.working_directory
        )

        super().start()
        if self.on_start:
            self.on_start()

        # Start stdout watcher
        threading.Thread(name=f"{self.server.name} out watcher", target=self.__add_output).start()

    def run(self) -> None:
        while self.returncode is None:
            self.process.poll()
            time.sleep(0.25)

        if self.on_stop:
            self.on_stop()

    def write_to_stdin(self, text: str):
        self.server.output.append(text)
        # We expect this to timeout as this should NOT terminate any worker we are running
        try:
            self.process.communicate(text.encode(), timeout=0.5)
        except subprocess.TimeoutExpired:
            pass
        self.server.save()

    def __add_output(self):
        try:
            while self.server.status != "stopped":
                line = self.process.stdout.readline()
                if isinstance(line, bytes):
                    line = line.decode("utf-8")
                self.server.output.append(line)
                self.server.save()
        # ValueError is raised when stdout pipe is broken on worker stop, so catch it here.
        except ValueError:
            pass

    def kill(self):
        self.process.kill()

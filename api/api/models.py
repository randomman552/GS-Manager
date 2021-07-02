import os
import signal
import uuid
from typing import Optional

from flask_login import UserMixin
from flask_mongoengine import Document
from mongoengine import StringField, DictField, ListField, IntField
from werkzeug.security import check_password_hash, generate_password_hash

from .util import ServerCommandExecutor


class User(Document, UserMixin):
    name = StringField(required=True, unique=True)
    __password_hash = StringField(required=True, db_field="password")
    api_key = StringField()

    def get_id(self):
        if self.api_key is None:
            self.api_key = str(uuid.uuid4())
            self.save()
        return self.api_key

    @property
    def password(self):
        raise AttributeError("Password cannot be read")

    @password.setter
    def password(self, new_pass: str):
        self.__password_hash = generate_password_hash(new_pass)
        self.api_key = str(uuid.uuid4())

    def check_password(self, password: str) -> bool:
        return not self.is_anonymous and check_password_hash(self.__password_hash, password)


class GameServer(Document):
    __running = dict()

    name = StringField(required=True, unique=True)
    status = StringField(default="stopped")
    output = ListField(StringField())

    default_args = StringField()
    """
    Arguments to be provided to start command, regardless of mode.
    """

    unspecified_args = StringField()
    """
    Arguments to be provided to start command when no mode is specified.
    """

    mode = StringField()
    """
    Mode specifies the arguments to get from the `mode_map` when starting.
    """

    mode_map = DictField()
    """
    Map of modes to arguments to supply when running in that mode.
    """

    update_cmd = StringField()
    """
    Command to run when update requested.
    """

    start_cmd = StringField()
    """
    Command to run when start requested, arguments are provided according to the set mode
    """

    working_directory = StringField()
    """
    Working directory of the server.
    """

    @property
    def worker(self):
        return self.__running.get(str(self.id))

    @worker.setter
    def worker(self, val):
        self.__running[str(self.id)] = val

    def __init__(self, *args, **values):
        super().__init__(*args, **values)

    def create_command_executor(self, cmd: str) -> Optional[ServerCommandExecutor]:
        if cmd == self.start_cmd:
            return ServerCommandExecutor(
                self, cmd,
                self.on_start, self.on_stop
            )
        elif cmd == self.update_cmd:
            return ServerCommandExecutor(
                self, cmd,
                self.on_update, self.on_stop
            )
        return None

    def on_start(self):
        self.status = "started"
        self.save()
        print(f"Server {self.name} starting...")

    def on_update(self):
        self.status = "updating"
        self.save()
        print(f"Server {self.name} updating...")

    def on_stop(self):
        self.status = "stopped"
        self.save()
        print(f"Server {self.name} stopped with exit code {self.worker.returncode}")
        self.__running.pop(str(self.id))

    def run_start(self) -> bool:
        """
        Run the server start command.
        :return: True if server started, False if server is already running and wasn't started.
        """
        if not self.worker or self.status == "stopped":
            self.worker = self.create_command_executor(self.start_cmd)
            self.worker.start()
            return True
        return False

    def run_update(self) -> bool:
        """
        Start the server update worker.
        :return: True of the update was started, False otherwise.
        """
        if not self.worker:
            self.worker = self.create_command_executor(self.update_cmd)
            self.worker.start()
            return True
        return False

    def run_command(self, cmd) -> bool:
        """
        Execute a command to the currently running servers stdin
        :param cmd: The command to execute
        :returns: True if command was executed, False otherwise
        """
        if self.worker:
            if not cmd.endswith("\r\n"):
                cmd += "\r\n"
            self.worker.write_to_stdin(cmd)
            return True
        return False

    def stop(self) -> bool:
        """
        Stop server or update execution.
        :return: True if execution was stopped, False otherwise
        """
        self.status = "stopped"
        self.save()
        if self.worker:
            self.worker.kill()
            return True
        return False

import os
import uuid
import subprocess
from typing import Union, Optional

from flask import current_app
from flask_login import UserMixin
from flask_mongoengine import Document
from mongoengine import StringField, DictField
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

    def __init__(self, *args, **values):
        super().__init__(*args, **values)
        self.process = None

    def create_command_executor(self, cmd: str) -> Optional[ServerCommandExecutor]:
        if cmd == self.start_cmd:
            return ServerCommandExecutor(
                self.working_directory, cmd,
                self.on_start, self.on_stop
            )
        elif cmd == self.update_cmd:
            return ServerCommandExecutor(
                self.working_directory, cmd,
                self.on_update, self.on_stop
            )
        return None

    def on_start(self):
        self.status = "started"
        self.save()
        self.__running[str(self.id)] = self
        print(f"Server {self.name} starting...")

    def on_update(self):
        self.status = "updating"
        self.save()
        self.__running[str(self.id)] = self
        print(f"Server {self.name} updating...")

    def on_stop(self):
        self.status = "stopped"
        self.save()
        self.__running.pop(str(self.id))
        print(f"Server {self.name} stopped with exit code {self.process.returncode}")

    def run_start(self):
        """
        Run the server start command.
        :return: True if server started, False if server is already running and wasn't started.
        """
        if self.process is None and self.status == "stopped":
            self.process = self.create_command_executor(self.start_cmd)
            self.process.start()
            return True
        return False

    def run_update(self):
        """
        Start the server update process.
        :return: True of the update was started, False otherwise.
        """
        if self.process is None and self.status == "stopped":
            self.process = self.create_command_executor(self.update_cmd)
            self.process.start()
            return True
        return False

    def stop(self):
        """
        Stop server or update execution.
        :return: True if execution was stopped, False otherwise
        """
        id = str(self.id)
        if self.process:
            self.process.kill()
            return True
        elif id in self.__running:
            return self.__running.get(id).stop()
        return False

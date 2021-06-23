import os
import uuid
import subprocess
from typing import Union

from flask import current_app
from flask_login import UserMixin
from flask_mongoengine import Document
from mongoengine import StringField, DictField
from werkzeug.security import check_password_hash, generate_password_hash

from .util import run_server, run_update


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

    def start(self):
        if self.status == "stopped":
            watchdog = run_server(self)
            if not current_app.config.get("worker_processes"):
                current_app.config["worker_processes"] = dict()
            current_app.config["worker_processes"][str(self.id)] = watchdog
            self.status = "running"
            self.save()

    def stop(self):
        watchdog = current_app.config.get("worker_processes", dict()).get(str(self.id))
        if watchdog:
            watchdog.stop()
        self.status = "stopped"
        self.save()

    def run_update(self):
        if self.status == "stopped":
            watchdog = run_update(self)
            if not current_app.config.get("worker_processes"):
                current_app.config["worker_processes"] = dict()
            current_app.config["worker_processes"][str(self.id)] = watchdog
            self.status = "updating"
            self.save()

import os
import shutil
import uuid

from flask_login import UserMixin
from flask_mongoengine import Document
from mongoengine import StringField, DictField, ListField, IntField
from werkzeug.security import check_password_hash, generate_password_hash


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
    STORAGE_PATH = os.path.join(os.getcwd(), "storage")

    name = StringField(required=True, unique=True, min_length=3)
    status = StringField(default="stopped")
    output = ListField(StringField())

    default_args = StringField()
    """
    Arguments to be provided to start cmd, regardless of mode.
    """

    unspecified_args = StringField()
    """
    Arguments to be provided to start cmd when no mode is specified.
    """

    mode = StringField()
    """
    Mode specifies the arguments to get from the `mode_map` when starting.
    """

    mode_map = DictField()
    """
    Map of modes to arguments to supply when running in that mode.
    """

    start_cmd = StringField(required=True)
    """
    Command to run when start requested, arguments are provided according to the set mode
    """

    update_cmd = StringField()
    """
    Command to run when update requested.
    """

    @property
    def is_running(self) -> bool:
        return self.status != "stopped"

    @property
    def current_start_cmd(self) -> str:
        command = self.start_cmd
        if self.default_args:
            command += " " + self.default_args
        if self.mode_map and self.mode:
            command += " " + self.mode_map.get(self.mode, self.unspecified_args)
        return command

    @property
    def working_directory(self) -> str:
        path = os.path.join(self.STORAGE_PATH, str(self.id))
        try:
            os.makedirs(path)
        except FileExistsError:
            pass
        return path

    def delete(self, signal_kwargs=None, **write_concern):
        shutil.rmtree(self.working_directory)
        super().delete(signal_kwargs, **write_concern)

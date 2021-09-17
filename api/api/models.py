import os
import shutil
import uuid

from flask_login import UserMixin, AnonymousUserMixin
from flask_mongoengine import Document
from mongoengine import StringField, DictField, ListField, BooleanField
from werkzeug.security import check_password_hash, generate_password_hash


def _convert_to_dict(document: Document) -> dict:
    """
    Function used to convert a mongodb document to a compatible JSON dict.
    This is used in all the data models contained in this file.
    """
    as_dict = document.to_mongo().to_dict()
    as_dict["id"] = str(as_dict["_id"])
    as_dict.pop("_id")

    return as_dict


class User(Document, UserMixin):
    name = StringField(required=True, unique=True)
    is_admin = BooleanField(default=False)
    __password_hash = StringField(required=True, db_field="password")
    api_key = StringField()

    def __init__(self, **kwargs):
        if "password" in kwargs:
            password = kwargs.pop("password")
            super().__init__(**kwargs)
            self.password = password
            return
        super().__init__(**kwargs)

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

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """
        Convert this user to a dict for JSON transfer.
        :param include_sensitive: If True, will include fields containing sensitive data.
        :return: dict representing the user.
        """
        as_dict = _convert_to_dict(self)
        if not include_sensitive:
            as_dict.pop("password", "")
            as_dict.pop("api_key", "")
        return as_dict

    def update(self, **kwargs):
        if "password" in kwargs:
            self.password = kwargs.pop("password")
            self.save()
            if len(kwargs) == 0:
                return
        super().update(**kwargs)

    @property
    def is_only_admin(self):
        return self.is_admin and len(User.objects(is_admin=True)) == 1


class AnonymousUser(AnonymousUserMixin):
    @property
    def is_admin(self):
        return False


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
        elif self.unspecified_args:
            command += " " + self.unspecified_args
        return command

    @property
    def working_directory(self) -> str:
        return os.path.join(self.STORAGE_PATH, str(self.id))

    def create_working_directory(self):
        try:
            os.makedirs(self.working_directory)
        except FileExistsError:
            pass

    def delete(self, signal_kwargs=None, **write_concern):
        shutil.rmtree(self.working_directory)
        super().delete(signal_kwargs, **write_concern)

    def to_dict(self):
        return _convert_to_dict(self)

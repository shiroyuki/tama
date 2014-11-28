import logging
import os
from tama.model import FSNode

logging.basicConfig(level = logging.WARN)

class NotFoundError(IOError):
    """ Not Found Error """

class Finder(object):
    logger = logging.getLogger('tama.service.Finder')
    logger.setLevel(logging.DEBUG)

    def __init__(self, base_path=None):
        self.__base_path = base_path or ''

        Finder.logger.debug('Start with location: {}'.format(base_path))

    @property
    def base_path(self):
        return self.__base_path

    def set_base_path(self, base_path):
        self.__base_path = base_path

        Finder.logger.debug('Change to location: {}'.format(base_path))

    def get(self, path):
        actual_path = self._resolve_path(path)
        fs_node     = FSNode(path, actual_path)

        if not fs_node.exists:
            raise NotFoundError(path)

        return fs_node

    def put(self, path, content):
        fs_node = self.get(path)

        # Update the content
        fs_node.content = content
        fs_node.save()

    def find(self, path):
        actual_iterating_path = self._resolve_path(path)

        fs_nodes = []

        for fs_node_name in os.listdir(actual_iterating_path):
            next_path   = os.path.join(path, fs_node_name)
            actual_path = self._resolve_path(next_path)
            fs_node     = FSNode(next_path, actual_path)

            fs_nodes.append(fs_node)

        return fs_nodes

    def _is_abspath(self, path):
        return '/' == path[0] if path else False

    def _resolve_path(self, path):
        if self._is_abspath(path):
            return path

        return os.path.join(self.base_path, path)
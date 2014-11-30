import logging
import os
import re
from tama.model import FSNode

logging.basicConfig(level = logging.WARN)

class NotFoundError(IOError):
    """ Not Found Error """

class Finder(object):
    logger = logging.getLogger('tama.service.Finder')
    logger.setLevel(logging.DEBUG)

    def __init__(self, base_path=None):
        self.__base_path = base_path or ''
        self.__illegal_pattern = re.compile('(\.\.)')

        Finder.logger.debug('Start with location: {}'.format(base_path))

    @property
    def base_path(self):
        return self.__base_path

    def set_base_path(self, base_path):
        self.__base_path = base_path

        Finder.logger.debug('Change to location: {}'.format(base_path))

    def get(self, path):
        path        = self._sanitize_path(path)
        actual_path = self._resolve_path(path)
        fs_node     = FSNode(path, actual_path)

        if not fs_node.exists:
            raise NotFoundError(path)

        return fs_node

    def put(self, path, content):
        path    = self._sanitize_path(path)
        fs_node = self.get(path)

        # Update the content
        fs_node.content = content
        fs_node.save()

    def find(self, path):
        """ Find FS nodes. """
        path                  = self._sanitize_path(path)
        actual_iterating_path = self._resolve_path(path)

        fs_nodes = []

        for fs_node_name in os.listdir(actual_iterating_path):
            next_path   = os.path.join(path, fs_node_name)
            actual_path = self._resolve_path(next_path)
            fs_node     = FSNode(next_path, actual_path)

            fs_nodes.append(fs_node)

        return fs_nodes

    def create_folder(self, path, name):
        """ Create a blank folder. """
        referred_path = os.path.join(path, name)
        actual_path   = self._resolve_path(referred_path)

        if os.path.exists(actual_path):
            return False

        os.makedirs(actual_path)

        return True
    
    def create_file(self, path, name):
        """ Create a blank file. """
        referred_path = os.path.join(path, name)
        actual_path   = self._resolve_path(referred_path)

        if os.path.exists(actual_path):
            return False

        with open(actual_path, 'w') as f:
            f.write('')

        return True

    def _is_abspath(self, path):
        return '/' == path[0] if path else False

    def _resolve_path(self, path):
        if self._is_abspath(path):
            return path

        return os.path.join(self.base_path, path)

    def _sanitize_path(self, path):
        return self.__illegal_pattern.sub('', path)
import re
from tori.centre import settings as app_settings
from tama.service import NotFoundError

class GhostCensor(object):
    def __init__(self, broadcaster):
        self.broadcaster = broadcaster

    def notify(self, message):
        self.broadcaster.broadcast(message)

class Finder(object):
    def __init__(self, finder):
        self.finder = finder
        self.cachedIgnorePatterns = {}

    def find(self, path):
        fs_nodes = self.finder.find(path)

        simplified_nodes = []

        for fs_node in fs_nodes:
            if self._is_ignored(fs_node):
                continue

            simplified_nodes.append({
                'name':      fs_node.name,
                'path':      fs_node.referred_path,
                'type':      fs_node.mimetype,
                'is_dir':    fs_node.is_dir,
                'is_file':   fs_node.is_file,
                'is_binary': fs_node.is_binary,
                'is_link':   fs_node.is_link
            })

        return {
            'path':  path,
            'nodes': simplified_nodes
        }

    def get(self, path):
        try:
            fs_node = self.finder.get(path)
        except NotFoundError as e:
            return self._make_response(False, e)

        return self._simplify_content(fs_node)

    def put(self, path, content):
        if app_settings['read_only']:
            return self._make_response(False, 'app.ReadOnlyMode')

        try:
            self.finder.put(path, content)
        except NotFoundError as e:
            return self._make_response(False, e)

        return self._make_response(True)

    def delete(self, path):
        if app_settings['read_only']:
            return self._make_response(False, 'app.ReadOnlyMode')

        try:
            self.finder.delete(path)
        except NotFoundError as e:
            return self._make_response(False, e)

        return self._make_response(True)

    def create_folder(self, path, name):
        if app_settings['read_only']:
            return self._make_response(False, 'app.ReadOnlyMode')

        is_succeeded = self.finder.create_folder(path, name)
        error_code   = None

        if not is_succeeded:
            error_code = 'app.OverwriteNotAllowed'

        return self._make_response(is_succeeded)

    def create_file(self, path, name):
        if app_settings['read_only']:
            return self._make_response(False, 'app.ReadOnlyMode')

        is_succeeded = self.finder.create_file(path, name)
        error_code   = None

        if not is_succeeded:
            error_code = 'tama.rpc.finder.FSNodeOverwriteNotAllowed'

        return self._make_response(is_succeeded)

    def _make_response(self, is_success, error_code=None):
        if isinstance(error_code, Exception):
            error_class = type(error_code)
            module_name = error_class.__module__
            error_code  = error_class.__name__

            if module_name:
                error_code = module_name + '.' + error_code

        return {
            'is_success': is_success,
            'error_code': error_code
        }

    def _simplify_content(self, fs_node):
        response = self._make_response(True, None)

        response.update({
            'error':     False,
            'name':      fs_node.name,
            'path':      fs_node.referred_path,
            'type':      fs_node.mimetype,
            'data':      fs_node.content,
            'is_dir':    fs_node.is_dir,
            'is_file':   fs_node.is_file,
            'is_binary': fs_node.is_binary
        })

        return response

    def _is_ignored(self, fs_node):
        for pattern in app_settings['ignored_list']:
            if self._is_ignored_by_pattern(pattern, fs_node):
                return True

        return False

    def _is_ignored_by_pattern(self, pattern, fs_node):
        if pattern not in self.cachedIgnorePatterns:
            self.cachedIgnorePatterns[pattern] = re.compile(pattern)

        return bool(self.cachedIgnorePatterns[pattern].search(fs_node.name))

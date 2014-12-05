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

    def get(self, path):
        try:
            fs_node = self.finder.get(path)
        except NotFoundError as e:
            return self._make_response(False, 'tama.rpc.finder.FSNodeNotFoundError')

        return self._simplify_content(fs_node)

    def put(self, path, content):
        if app_settings['read_only']:
            return self._make_response(False, 'tama.app.ReadOnlyMode')

        try:
            self.finder.put(path, content)
        except NotFoundError as e:
            return self._make_response(False, 'tama.rpc.finder.FSNodeNotFoundError')

        return self._make_response(True)

    def create_folder(self, path, name):
        if app_settings['read_only']:
            return self._make_response(False, 'tama.app.ReadOnlyMode')

        is_succeeded = self.finder.create_folder(path, name)
        error_code   = None

        if not is_succeeded:
            error_code = 'tama.rpc.finder.FSNodeOverwriteNotAllowed'

        return self._make_response(is_succeeded)

    def create_file(self, path, name):
        if app_settings['read_only']:
            return self._make_response(False, 'tama.app.ReadOnlyMode')

        is_succeeded = self.finder.create_file(path, name)
        error_code   = None

        if not is_succeeded:
            error_code = 'tama.rpc.finder.FSNodeOverwriteNotAllowed'

        return self._make_response(is_succeeded)

    def _make_response(self, is_success, error_code=None):
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

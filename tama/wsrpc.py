from tama.service import NotFoundError

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
        try:
            self.finder.put(path, content)
        except NotFoundError as e:
            return self._make_response(False, 'tama.rpc.finder.FSNodeNotFoundError')

        return self._make_response(True)

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
import json
import os
import re
from tornado.web     import HTTPError
from tori.controller import Controller
from tori.socket.rpc import Interface
from tori.socket.websocket import WebSocket

class UIBrowser(Controller):
    def get(self, path=''):
        menu_config         = self.settings['menus']['browser']
        request_location    = re.sub('/$', '', path)
        request_path_blocks = re.split('/', request_location)
        parent_path         = os.path.join(*request_path_blocks[:-1]) \
                                if len(request_path_blocks) > 1\
                                else ''

        self.render(
            'browser.html',
            menu             = menu_config,
            menu_in_json     = json.dumps(menu_config),
            request_location = request_location,
            parent_path      = parent_path,
            fs_nodes         = self.component('internal.finder').find(path)
        )

class UIFileEditor(Controller):
    def get(self, path=''):
        parent_path = os.path.dirname(path)
        file_name   = os.path.split(path)[1]

        self.render(
            'editor.html',
            file_name        = file_name,
            parent_path      = parent_path,
            request_location = path
        )

class APIFile(Controller):
    def get(self, path=''):
        fs_node = self.component('internal.finder').get(path)

        if fs_node.is_dir:
            raise HTTPError(403)

        self.finish(fs_node.content)

class SyncService(Interface): pass

import json
import os
import re
from tornado.web     import HTTPError
from tori.controller import Controller as BaseController
from tori.socket.rpc import Interface
from tori.socket.websocket import WebSocket
from tama.service import *

class Controller(BaseController):
    RE_MOBILE_UA = re.compile('(Android|iPad|iPhone|Mobile)')
    RE_PHONE_UA  = re.compile('(Mobile)')

    @property
    def is_mobile(self):
        return bool(
            'User-Agent' in self.request.headers\
            and Controller.RE_MOBILE_UA.search(self.request.headers['User-Agent'])
        )

    @property
    def device_form_factor(self):
        if not self.is_mobile:
            return 'computer'

        if Controller.RE_PHONE_UA.search(self.request.headers['User-Agent']):
            return 'phone'

        return 'tablet'

    def render_template(self, template_name, **contexts):
        contexts.update({
            'static_path':        self.resolve_static_path,
            'json':               json.dumps,
            'is_mobile':          self.is_mobile,
            'device_form_factor': self.device_form_factor
        })

        return super(Controller, self).render_template(template_name, **contexts)

    def resolve_static_path(self, key):
        router   = self.component('routing_map')
        settings = self.settings['asset_manager']

        local_path  = settings['local'][key]  if key in settings['local']  else None
        remote_path = settings['remote'][key] if key in settings['remote'] else None

        if local_path:
            local_path = router.resolve('static', path = local_path)

        if not settings['enabled']:
            return local_path or '/e404/' + key

        return remote_path or local_path or '/e404/' + key

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
            menu_in_json     = json.dumps(menu_config, indent = 4),
            request_location = request_location,
            parent_path      = parent_path,
            fs_nodes         = self.component('internal.finder').find(path)
        )

class UIFileEditor(Controller):
    def get(self, path=''):
        parent_path = os.path.dirname(path)
        file_name   = os.path.split(path)[1]

        fs_node = None

        try:
            fs_node = self.component('internal.finder').get(path)
        except NotFoundError as e:
            raise HTTPError(404)

        if not fs_node.is_file:
            raise HTTPError(403)

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

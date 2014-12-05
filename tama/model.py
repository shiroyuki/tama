import logging
import mimetypes
import os

logging.basicConfig(level = logging.WARN)

class FSNodeNotFoundError(IOError):
    """ File-system Node Not Found """

class FSNodeType(object):
    FILE = 'file'
    DIR  = 'dir'

class FSNode(object):
    logger = logging.getLogger('tama.model.FSNode')
    logger.setLevel(logging.DEBUG)

    EXTRA_TEXT_TYPES = [
        'application/json',
        'application/javascript',
        'application/xml',
        'application/x-sh',
        'application/x-sql'
    ]

    def __init__(self, referred_path, real_path, name = None, content = None):
        FSNode.logger.debug('FSNode({}, {})'.format(referred_path, real_path))
        self.referred_path = referred_path
        self.real_path     = real_path
        self.name          = name or os.path.split(real_path)[1]
        self._content      = None

    @property
    def content(self):
        if self.is_dir:
            raise AttributeError('Directory Node does not have content.')

        if self._content:
            return self._content

        self.load()

        return self._content

    @content.setter
    def content(self, content):
        if self.is_dir:
            raise AttributeError('Directory Node does not have content.')

        self._content = content

    @property
    def exists(self):
        return os.path.exists(self.real_path)

    @property
    def mimetype(self):
        return mimetypes.guess_type(self.name, False)[0]

    @property
    def is_link(self):
        return os.path.islink(self.real_path)

    @property
    def is_file(self):
        return os.path.isfile(self.real_path)

    @property
    def is_dir(self):
        return os.path.isdir(self.real_path)

    @property
    def is_binary(self):
        mimetype = self.mimetype

        if mimetype in FSNode.EXTRA_TEXT_TYPES:
            return False

        # need file peek
        return 'text' not in mimetype if mimetype else None

    def load(self):
        if not self.exists:
            raise FSNodeNotFoundError('Unable to load.')
        
        with open(self.real_path, 'r') as f:
            self._content = f.read()

        FSNode.logger.debug('Loaded {}'.format(self.real_path))

    def save(self):
        with open(self.real_path, 'w') as f:
            f.write(self.content)

        FSNode.logger.debug('Saved {}'.format(self.real_path))

    def delete(self, path):
        if not self.exists:
            raise FSNodeNotFoundError('Unable to locate the node.')
        
        if self.is_file:
            os.unlink(self.real_path)
            return

        os.removedirs(self.real_path)

import codecs
import logging
import mimetypes
import os
import shutil

try:
    import codecs
except ImportError as e:
    print('Cannot import codecs. Unicode handling is disabled.')

logging.basicConfig(level = logging.WARN)

class FSNodeNotFoundError(IOError):
    """ File-system Node Not Found """

class FSNodeType(object):
    FILE = 'file'
    DIR  = 'dir'

class FSNode(object):
    logger = logging.getLogger('tama.model.FSNode')
    logger.setLevel(logging.WARNING)

    EXTRA_TEXT_TYPES = [
        'application/json',
        'application/javascript',
        'application/xml',
        'application/x-sh',
        'application/x-sql'
    ]

    TRASH_PREFIX = '_tmtrash_'

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
        tmp_file = self.real_path + '.tmp'

        try:
            with open(tmp_file, 'w') as f:
                f.write(self.content)
        except UnicodeEncodeError as e:
            with codecs.open(tmp_file, 'w', 'utf8') as f:
                f.write(self.content)

        os.rename(tmp_file, self.real_path)

        FSNode.logger.debug('Saved {}'.format(self.real_path))

    def delete(self):
        if not self.exists:
            raise FSNodeNotFoundError('Unable to locate the node.')

        try:
            os.unlink(self.real_path)
        except OSError as e:
            shutil.rmtree(self.real_path)

    def mark_to_delete(self):
        os.renames(self.real_path, TRASH_PREFIX + self.real_path)

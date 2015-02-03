#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Compilation Prerequisite
import distutils.version
import encodings.idna
import encodings.unicode_escape
import tornado.websocket
import tori.db.driver.mongodriver

# Runtime Requirements
import sys

from tori.application import Application
from tori.centre import services

def main(name, args):
    application = Application('config/dev.xml')

    if not args:
        print('USAGE: python {} <base_path>[ <port:8000>]'.format(name))

        sys.exit(255)

    base_path = args[0]

    services.get('internal.finder').set_base_path(base_path)

    if len(args) > 1:
        port = args[1]

        application.listen(port)

    application.start()

if __name__ == '__main__':
    main(sys.argv[0], sys.argv[1:])

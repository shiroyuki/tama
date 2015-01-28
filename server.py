#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
from tori.application import Application
from tori.centre import services

application = Application('config/dev.xml')

if len(sys.argv) < 2:
    print('USAGE: python {} <base_path>'.format(sys.argv[0]))
    sys.exit(255)

base_path = sys.argv[1]

services.get('internal.finder').set_base_path(base_path)
application.start()

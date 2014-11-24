# -*- coding: utf-8 -*-
import sys
from tori.application import Application
from tori.centre import services

application = Application('config/dev.xml')

if len(sys.argv) > 1:
    services.get('finder').set_base_path(sys.argv[1])

application.start()

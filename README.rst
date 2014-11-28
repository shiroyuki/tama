Tama Simple Web-based Text Editor
#################################

:Development Status: Active
:Release Status: Testing/Stable

Requirements
============

- Python 2.7 or Python 3.3+
- Latest version of tori, tornado, redis, jinja2, imagination, kotoba

Installation
============

1. Clone this repository or download and unpack the snapshot.
2. Run ``pip install -r requirements.txt``.

Configuration
=============

You can change **the listening port** in ``application/server/port`` from ``config/dev.xml``.

By default, the session storage is a JSON file. See `Tori's Predefined Configuration <http://tori.readthedocs.org/en/latest/manual/configuration/predefined-config.html>`_,
especially the section **Session Configuration** to use a different adapter.

How to Start
============

Just run ``python server.py <base_dir>`` and go to http://localhost:8000/.

Features
========

Supported
---------

Browser
~~~~~~~

- Browse the working directory.
- Open editable files in an editor window.

Editor
~~~~~~

- Open editable files.
- Save editable files.

Editable File
~~~~~~~~~~~~~

- All text mimetypes.
- application/json
- application/javascript
- application/xml
- application/x-sh
- application/x-sql
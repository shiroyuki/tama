define(
    'common/editor',
    [
        'jquery',
        'common/event_base_class'
    ],
    function ($, EventBaseClass) {
        var modelist = ace.require('ace/ext/modelist');

        function Editor(id, socket, options) {
            this.EventBaseClass();

            this.id          = id;
            this.socket      = socket;
            this.editor      = null;
            this.theme       = this.themes[this.defaultTheme];
            this.modes       = [];
            this.mode        = null;
            this.defaultMode = null;
            this.node        = null;
            this.filename    = null;
            this.options     = options || {};

            this.activate();
        };

        $.extend(Editor.prototype, EventBaseClass.prototype, {
            defaultTheme: 'Default',
            themes: {
                'Default':         'monokai',
                'Clouds':          'clouds',
                'Cobalt':          'cobalt',
                'Mono Industrial': 'mono_industrial',
                'Monokai':         'monokai',
                'Solarized Dark':  'solarized_dark',
                'Solarized Light': 'solarized_light',
                'Terminal':        'terminal',
                'Twilight':        'twilight'
            },
            modes: null,

            activate: function () {
                var k, mode;

                this.editor = ace.edit(this.id);
                //this.editor.setTheme('ace/theme/' + this.theme);
                this.editor.setOptions({
                    minLines: 10,
                    maxLines: 999999, // for tablets
                    useSoftTabs: true,
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    autoScrollEditorIntoView: true
                });

                if (this.modes.length === 0) {
                    if (this.options.only_enabled_modes !== undefined) {
                        for (k in modelist.modes) {
                            mode = modelist.modes[k];

                            if (this.options.only_enabled_modes.indexOf(mode.name) > -1) {
                                this.modes.push(mode);

                                continue;
                            }
                        }

                        modelist.modes = this.modes;
                    }
                }

                this.socket.on('rpc.finder.get',    $.proxy(this.onFinderGet,    this));
                this.socket.on('rpc.finder.put',    $.proxy(this.onFinderPut,    this));
                this.socket.on('rpc.finder.delete', $.proxy(this.onFinderDelete, this));
            },

            setMode: function (mode) {
                var aceMode = modelist.getModeForPath(filename);

                if (this.mode === null) {
                    this.defaultMode = aceMode.name;
                }

                this.mode = mode
                    || aceMode.name
                    || this.getModeByContent(this.editor.getValue())
                ;

                this.editor.getSession().setMode('ace/mode/' + this.mode);

                this.dispatch('mode.change', { mode: this.mode });
            },

            setContent: function (content) {
                this.editor.setValue(content);
            },

            enableKeyBinding: function () {
                this.editor.commands.addCommand({
                    name:     'Save files',
                    bindKey:  {win: 'Ctrl-S',  mac: 'Command-S'},
                    exec:     $.proxy(this.onShortCutSave, this),
                    readOnly: false
                });
            },

            open: function (filename, readOnly) {
                this.filename = filename;
                readOnly = readOnly || false;

                this.socket.request('rpc.finder', 'get', {path: filename});

                // Fallback AJAX version (reaod-only mode).

                if (!readOnly) {
                    return;
                }

                request_option = {
                    url: '/api/file/' + filename,
                    success: $.proxy(this.load, this)
                };

                $.ajax(request_option);
            },

            save: function () {
                this.dispatch('save.in_progress', this.node);

                this.socket.request('rpc.finder', 'put', {
                    path:    this.node.path,
                    content: this.editor.getValue()
                });
            },

            remove: function () {
                this.dispatch('delete.in_progress', this.node);

                this.socket.request('rpc.finder', 'delete', {
                    paths: [this.node.path]
                });
            },

            load: function (content) {
                this.setContent(content);
                this.setMode();
                this.editor.gotoLine(0);
            },

            getModeByExtension: function (filename) {
                for (mode in this.modeToExtensionMap) {
                    pattern = this.modeToExtensionMap[mode];

                    if (filename.match(pattern)) {
                        return mode;
                    }
                }

                return null;
            },

            getModeByContent: function (content) {
                switch (true) {
                    case content.match(/^#!\/[^\n\r]+python/):
                        return 'python';
                    case content.match(/^#!\/[^\n\r]+ruby/):
                        return 'python';
                }

                return 'text';
            },

            onFinderGet: function (response) {
                var result = response.result;

                if (!result.is_success) {
                    this.node = null;
                    this.filename = null;

                    return;
                }

                this.node = result;
                this.load(response.result.data);
            },

            onFinderPut: function (response) {
                var result = response.result;

                if (!result.is_success) {
                    console.error(result.error_code);

                    this.dispatch('save.failed', result);

                    return;
                }

                this.dispatch('save.ok', result);
            },

            onFinderDelete: function (response) {
                var result = response.result;

                if (!result[this.filename]) {
                    console.error(result.error_code);

                    this.dispatch('delete.failed');

                    return;
                }

                this.dispatch('delete.ok');
            },

            onShortCutSave: function (editor) {
                this.save();
            }
        });

        return Editor;
    }
);

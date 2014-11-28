Editor = function (id, socket) {
    this.id     = id;
    this.socket = socket;
    this.editor = null;
    this.theme  = 'monokai';
    this.mode   = 'text';

    this.activate();
};

$.extend(Editor.prototype, {
    modeToExtensionMap: {
        python: /\.py$/i,
        sh: /\.sh$/i,
        django: /\.(django|twig|jinja)$/i,
        php: /\.(php|phtml)$/i,
        perl: /\.pl$/i,
        markdown: /\.md$/i,
        javascript: /\.js$/i,
        json: /\.json$/i,
        makefile: /Makefile/,
        html: /\.(html|htm|xhtml)$/i,
        xml: /\.xml$/i,
        css: /\.css$/i,
        scss: /\.scss$/i,
        sql: /\.sql$/i,
        csv: /\.csv$/i,
        c: /\.c$/i
    },

    activate: function () {
        this.editor = ace.edit(this.id);
        this.editor.setTheme('ace/theme/' + this.theme);

        this.socket.on('finder.get', $.proxy(this.onFinderGet, this));
    },

    setMode: function (mode) {
        this.mode = mode
            || this.getModeByExtension(filename)
            || this.getModeByContent(this.editor.getValue())
        ;

        this.editor.getSession().setMode('ace/mode/' + this.mode);
    },

    setContent: function (content) {
        this.editor.setValue(content);
    },

    enableKeyBinding: function () {
        this.editor.commands.addCommand({
            name: 'Mock Save',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(editor) {
                alert('save');
            },
            readOnly: false
        });
    },

    open: function (filename, readOnly) {
        this.filename = filename;
        readOnly = readOnly || false;

        this.socket.request('finder', 'get', {path: filename});

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

    load: function (content) {
        console.log('Load content:', content);

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

    onFinderGet: function (data) {
        this.load(data.result);
    }
});

var editor;
var socket;

function main() {
    socket = new WebSocketClient(rpcSocketUrl);
    editor = new Editor('editor', socket);
    editor.open(filename);
    editor.enableKeyBinding();
}

$(document).ready(main);

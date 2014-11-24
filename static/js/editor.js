Editor = function (id) {
    this.id     = id;
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
        csv: /\.csv$/i
    },

    activate: function () {
        this.editor = ace.edit(this.id);
        this.editor.setTheme('ace/theme/' + this.theme);
    },

    setMode: function (mode) {
        this.mode = mode
            || this.getModeByExtension(filename)
            || this.getModeByContent(this.editor.getValue())
        ;

        console.log('Mode:', this.mode);

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

    open: function (filename) {
        this.filename = filename;

        request_option = {
            url: '/api/file/' + filename,
            success: $.proxy(this.load, this)
        };

        $.ajax(request_option);
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
        if (content.match(/^#!\/[^\n\r]+python/)) {
            return 'python';
        }
        return 'text';
    }
});

var editor;

function main() {
    editor = new Editor('editor');
    editor.open(filename);
    editor.enableKeyBinding();
}

$(document).ready(main);
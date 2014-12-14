define(
    [
        'jquery',
        'handlebars'
    ],
    function ($, hb) {
        function TemplateManager() {
            this.repo = {};
        }

        $.extend(TemplateManager.prototype, {
            render: function(name, contexts) {
                return (this.get(name))(contexts);
            },

            get: function (name) {
                this.loadOne(name);

                if (this.repo[name] === undefined) {
                    throw 'js.template.NotFound: ' + name;
                }

                return this.repo[name];
            },

            getSelector: function (name) {
                if (name === undefined) {
                    throw 'tama.common.DialogManager.UndefinedTemplateName';
                }

                return 'script[type="text/x-handlebars-template"][data-name="' + name + '"]';
            },

            loadOne: function (name) {
                var source,
                    selector = this.getSelector(name)
                ;

                if (this.repo[name] !== undefined) {
                    return;
                }

                source = $(selector).html();

                if (source === undefined) {
                    console.warn('Cannot find source. (' + selector + ')');
                    return;
                }

                this.repo[name] = hb.compile(source, {noEscape: true});
            },

            load: function (names) {
                var i;

                for (i in names) {
                    this.loadOne(names[i]);
                }
            }
        });

        return TemplateManager;
    }
)
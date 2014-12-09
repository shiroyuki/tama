define(
    [
        'jquery',
        'handlebars'
    ],
    function ($, hb) {
        function Template() {
            this.repo = {};
        }

        $.extend(Template.prototype, {
            render: function(name, contexts) {
                this.loadOne(name);

                if (this.repo[name] === undefined) {
                    throw 'js.template.NotFound: ' + node;
                }

                return this.repo[name](contexts);
            },

            loadOne: function (name) {
                var source,
                    selector = 'script[data-name="' + name + '"]';

                if (this.repo[name] !== undefined) {
                    return;
                }

                source = $(selector).html();
                
                if (source === undefined) {
                    console.warn('Cannot find source. (' + selector + ')');
                    return;
                }

                this.repo[name] = hb.compile(source);
            },

            load: function (names) {
                var i;

                for (i in names) {
                    this.loadOne(names[i]);
                }
            }
        });

        return Template;
    }
)
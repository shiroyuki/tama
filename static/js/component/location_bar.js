define(
    [
        'jquery',
        'common/misc',
        'common/event_base_class'
    ],
    function ($, misc, EventBaseClass) {
        function LocationBar(context, templateManager, options) {
            this.EventBaseClass();

            this.templateManager = templateManager;

            this.context = context;
            this.options = {
                enablePJAX: false
            };

            if (options !== undefined) {
                $.extend(this.options, options);
            }
        }

        $.extend(LocationBar.prototype, EventBaseClass.prototype, {
            set: function (path) {
                var steps = path.split(/\//g),
                    i
                ;

                this.context.empty();

                if (misc.isStringEmpty(path)) {
                    return false;
                }

                for (i in steps) {
                    var step_name = steps[i],
                        step_path = steps.slice(0, i + 1).join('/')
                        contexts = {
                            name: step_name,
                            path: step_path,
                            url:  url_prefix_dir + step_path
                        },
                        $output = $(this.templateManager.render('explorer/step', contexts));
                    ;

                    if (!this.options.enablePJAX) {
                        $output.removeAttr('data-pjax');
                    }

                    this.context.append($output);
                }
            }
        });

        return LocationBar;
    }
)
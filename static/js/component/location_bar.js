define(
    [
        'jquery',
        'common/helper',
        'common/event_base_class'
    ],
    function ($, helper, EventBaseClass) {
        function LocationBar(context, templateManager, options) {
            this.EventBaseClass();

            this.templateManager = templateManager;

            this.context = context;
            this.options = {
                enablePJAX:       false,
                stepTemplateName: null
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

                if (helper.isStringEmpty(path)) {
                    return false;
                }

                for (i in steps) {
                    var index = parseInt(i, 10),
                        step_name = steps[index],
                        step_path = steps.slice(0, index + 1).join('/'),
                        contexts = {
                            name: step_name,
                            path: step_path,
                            url:  url_prefix_dir + step_path
                        },
                        $output = $(this.templateManager.render(this.options.stepTemplateName, contexts));
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
define(
    ['jquery'],
    function ($) {
        function DialogManager(context, templateManager) {
            this.dropZone        = context;
            this.templateManager = templateManager;
            this.nameToEventMap  = {};

            this.dropZone.on('click', $.proxy(this.onClickCancelLastDialog, this));
        }

        $.extend(DialogManager.prototype, {
            loadBaseTemplate: function () {
                this.templateManager.get(this.baseTemplateName);
            },

            on: function (name, type, selector, handler) {
                if (this.nameToEventMap[name] === undefined) {
                    this.nameToEventMap[name] = [];
                }

                this.nameToEventMap[name].push({
                    type:     type,
                    selector: selector,
                    handler:  handler
                });
            },

            use: function (name, context) {
                var renderedDialog,
                    $renderedDialog,
                    $dialogs,
                    events,
                    i
                ;

                context        = context || {};
                renderedDialog = this.templateManager.render(name, context);

                this.dropZone.append(renderedDialog);

                $dialogs = this.getDialogs();
                $dialogs.addClass('inactive');

                $renderedDialog = $dialogs.last();
                $renderedDialog.removeClass('inactive');
                $renderedDialog.on('click', this.disableEventBubbling);
                $renderedDialog.on('click', 'button.close', $.proxy(this.onClickCancelLastDialog, this));

                if (this.nameToEventMap[name] !== undefined) {
                    var i;
                    
                    events = this.nameToEventMap[name];

                    for (i in events) {
                        var event = events[i];

                        $renderedDialog.on(event.type, event.selector, event.handler);
                    }
                }

                this.dropZone.addClass('active');

                return $renderedDialog;
            },

            getDialogs: function () {
                return this.dropZone.children('div');
            },

            cancelLastDialog: function () {
                // Remove the last one.
                this.getDialogs().last().remove();

                // Re-enable the second last one.
                this.getDialogs().last().removeClass('inactive');

                if (this.getDialogs().length === 0) {
                    this.dropZone.removeClass('active');
                }
            },

            disableEventBubbling: function (e) {
                e.stopPropagation();
            },

            onClickCancelLastDialog: function (e) {
                e.preventDefault();

                this.cancelLastDialog();
            }
        });

        return DialogManager;
    }
)
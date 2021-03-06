define(
    [
        'jquery',
        'common/helper'
    ],
    function ($, helper) {
        function DialogManager(context, templateManager) {
            this.dropZone        = context;
            this.templateManager = templateManager;
            this.nameToEventMap  = {};
            this.lastId          = 0;

            this.dropZone.on('click', $.proxy(this.onBackdropClickCancelLastDialog, this));

            this.dropZone.on('mouseup',   this.eventHandlerDisableDragging);
            this.dropZone.on('mousedown', this.eventHandlerDisableDragging);
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
                $renderedDialog.attr('data-id', ++this.lastId);
                $renderedDialog.removeClass('inactive');
                $renderedDialog.on('click', this.disableEventBubbling);
                $renderedDialog.on('click', '.close', $.proxy(this.onClickCancelLastDialog, this));

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

            useAlert: function (message) {
                this.use(
                    'dialog/base',
                    {
                        content: message.replace(/\n/g, '<br/>')
                    }
                );
            },

            useHPrompt: function (message, options) {
                this.useXPrompt('h', message, options);
            },

            useVPrompt: function (message, options) {
                this.useXPrompt('v', message, options);
            },

            useXPrompt: function (type, message, options) {
                var optionIndex,
                    $dialog = this.use(
                        'dialog/' + type + '-prompt',
                        {
                            message: message,
                            options: options
                        }
                    )
                ;

                for (optionIndex in options) {
                    var option   = options[optionIndex],
                        selector = '.options [data-option="' + option.id + '"]',
                        $anchor  = $dialog.find(selector)
                    ;

                    $anchor.on('click', option.action);
                }
            },

            getDialogs: function () {
                return this.dropZone.children('div.dialog');
            },

            cancelLastDialog: function () {
                this.cancelDialog();
            },

            cancelDialog: function (id) {
                var $target = (id === undefined) ? this.getDialogs().last() : this.getDialogs().filter('[data-id=' + id + ']');

                // Re-enable the second last one.
                $target.prev().removeClass('inactive');

                // Remove the last one.
                $target.remove();

                this.cancelBackdrop();
            },

            cancelBackdrop: function () {
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
            },

            onBackdropClickCancelLastDialog: function (e) {
                var $reference = this.getDialogs().last();

                e.preventDefault();

                if ($reference.hasClass('option-disabled-close-button')) {
                    $reference.animate({zoom: 1.1}, 50, function () {
                        $reference.animate({zoom: 1.0}, 50);
                    });

                    return;
                }

                this.cancelLastDialog();
            },

            eventHandlerDisableDragging: function (e) {
                e.preventDefault();
            },
        });

        return DialogManager;
    }
)
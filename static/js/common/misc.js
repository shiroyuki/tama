define(
    [
        'common/template_manager',
        'common/dialog_manager',
        'common/helper'
    ],
    function (TemplateManager, DialogManager, helper) {
        var templateManager = new TemplateManager(),
            dialogManager   = new DialogManager($('.dialog-backdrop'), templateManager)
        ;

        window.alert = function (message) {
            dialogManager.useAlert(message.replace(/\n/g, '<br/>'));
        };

        return {
            templateManager: templateManager,
            dialogManager:   dialogManager,

            /**
             * An event handler to cancel dragging/highlighting.
             *
             * Applicable events: mousedown mouseup
             */
            eventHandlerDisableDragging: function (e) {
                e.preventDefault();
            },

            eventHandlerNoPropagation: function (e) {
                e.stopPropagation();
            },
            
            disableHighlighting: function ($selector) {
                $selector.on('mouseup', this.eventHandlerDisableDragging);
                $selector.on('mousedown', this.eventHandlerDisableDragging);
            }
        };
    }
);
define(
    [
        'common/template_manager',
        'common/dialog_manager'
    ],
    function (TemplateManager, DialogManager) {
        var templateManager = new TemplateManager(),
            dialogManager   = new DialogManager($('.dialog-backdrop'), templateManager)
        ;

        window.alert = function (message) {
            dialogManager.useAlert(message.replace(/\n/g, '<br/>'));
        };

        return {
            templateManager: templateManager,
            dialogManager:   dialogManager,
            
            isStringEmpty: function (sample) {
                return sample === undefined || sample === null || sample.length === 0;
            },

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
            }
        };
    }
)
define(
    function () {
        return {
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
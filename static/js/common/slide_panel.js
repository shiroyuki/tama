define(
    [
        'jquery',
        'common/helper'
    ],
    function ($, helper) {
        function SlidePanel($context) {
            this.active  = false;
            this.context = $context;
            this.$upper  = $context.find('.inner-upper');
            this.$middle = $context.find('.inner-middle');
        }

        $.extend(SlidePanel.prototype, {
            states: {
                inactive: 1,
                active:   2,
                shown:    3,
                done:     4
            },

            set: function (nodes, message) {
                var self = this,
                    useUpperPart       = message && String(message).length > 0,
                    lowerPartTopOffset = 0;
                ;

                if (useUpperPart) {
                    this.$upper.html(message);
                }

                this.$middle.css('top', lowerPartTopOffset);

                // TODO reset the form.

                if (nodes.length > 0) {
                    // TODO render the entries in the form.
                    //this.$middle.html(nodes); // experimental
                }

                setTimeout(function () {
                    lowerPartTopOffset = useUpperPart ? self.$upper.outerHeight() : 0;
                    self.$middle.css('top', lowerPartTopOffset);
                }, 100);
            },

            activate: function () {
                this.active = true;
                this.context.addClass('active');
            },

            deactivate: function () {
                this.active = false;
                this.context.removeClass('active');
            },

            show: function () {
                if (!this.active) {
                    throw 'tama.component.Mover.InactiveState';
                }

                this.context.addClass('visible');
            },

            hide: function () {
                if (!this.active) {
                    throw 'tama.component.Mover.InactiveState';
                }

                this.context.removeClass('visible');
            }
        });

        return SlidePanel;
    }
);
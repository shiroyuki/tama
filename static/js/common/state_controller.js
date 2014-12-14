define(
    [
        'jquery',
        'common/event_base_class'
    ],
    function ($, EventBaseClass) {
        function StateController() {
            this.popStateCount = 0;

            this.EventBaseClass();
        }

        $.extend(StateController.prototype, EventBaseClass.prototype, {
            enable: function () {
                $(document).on('click', '[data-pjax]', $.proxy(this.onPjaxElementClick, this));
                window.onpopstate = $.proxy(this.onPopState, this);
            },

            push: function (url, state) {
                if (url === undefined) {
                    url = document.location;
                }

                if (--this.popStateCount) {
                    this.popStateCount = 0;
                }

                if (this.popStateCount === 0) {
                    window.history.pushState(state || null, null, url);

                    this.dispatch('push', {
                        url:   url,
                        state: state
                    });

                    return true;
                }

                return false;
            },

            onPjaxElementClick: function (e) {
                e.preventDefault();

                this.push($(e.currentTarget).attr('data-pjax'));
            },

            onPopState: function (event) {
                this.dispatch('pop', event);
            }
        });

        return StateController;
    }
);
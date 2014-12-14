define(
    ['jquery'],
    function () {
        function EventBaseClass() {
            this.EventBaseClass();
        }

        $.extend(EventBaseClass.prototype, {
            EventBaseClass: function (defaultHandlerMap) {
                defaultHandlerMap = defaultHandlerMap || {};
                this.handlerMap   = defaultHandlerMap;
            },

            on: function (eventType, eventHandler) {
                if (this.handlerMap[eventType] === undefined) {
                    this.handlerMap[eventType] = [];
                }

                this.handlerMap[eventType].push(eventHandler);

                return this;
            },

            dispatch: function (type, data) {
                var handlers,
                    i
                ;

                handlers = this.handlerMap[type];

                for (i in handlers) {
                    handlers[i](data);
                }

                return this;
            },
        });

        return EventBaseClass;
    }
)
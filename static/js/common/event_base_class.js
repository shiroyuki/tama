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
                this.debugMode    = false;
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

                this.inspectActivity('EBC/' + type, data);

                handlers = this.handlerMap[type];

                for (i in handlers) {
                    handlers[i](data);
                }

                return this;
            },

            inspectActivity: function (type, data) {
                if (!this.debugMode) {
                    return;
                }

                if (console) {
                    console.log(new Date(), type, data);
                }
            }
        });

        return EventBaseClass;
    }
)
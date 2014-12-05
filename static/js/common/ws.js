define(
    'common/ws',
    ['jquery'],
    function ($) {
        function WebSocketClient(url) {
            this.WebSocketClient(url);
        };

        $.extend(WebSocketClient.prototype, {
            WebSocketClient: function (url, reconnectOnDemand) {
                this._connected = false;
                this.url    = url;
                this.client = null;
                this.handlerMap = {
                    open:    [],
                    message: [],
                    close:   []
                };
            },

            connected: function () {
                return this._connected;
            },

            reset: function () {
                this.client = null;
            },

            init: function () {
                this.client = new WebSocket(this.url);
                this.client.addEventListener('open', $.proxy(this.onOpen, this));
                this.client.addEventListener('close', $.proxy(this.onClose, this));
                this.client.addEventListener('message', $.proxy(this.onMessage, this));
            },

            connect: function () {
                if (this.client !== null) {
                    return;
                }

                this.init();
            },

            on: function (eventType, eventHandler) {
                if (this.handlerMap[eventType] === undefined) {
                    this.handlerMap[eventType] = [];
                }

                this.handlerMap[eventType].push(eventHandler);
            },

            send: function (message, resendIfFail) {
                this.client.send(JSON.stringify(message));
            },

            handleEvent: function (type, data) {
                var handlers,
                    i
                ;

                handlers = this.handlerMap[type];

                for (i in handlers) {
                    handlers[i](data);
                }
            },

            extractDataFromEvent: function (event) {
                return event.data !== undefined ? JSON.parse(event.data) : null;
            },

            onMessage: function (event) {
                var data = this.extractDataFromEvent(event);
                this.handleEvent('message', data);
            },

            onOpen: function (event) {
                var i;

                this._connected = true;
                this.handleEvent('open', event);
            },

            onClose: function (event) {
                this._connected = false;
                this.handleEvent('close', event);
            }
        });

        return WebSocketClient;
    }
);

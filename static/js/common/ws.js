define(
    'common/ws',
    ['jquery', 'common/event_base_class'],
    function ($, EventBaseClass) {
        function WebSocketClient(url) {
            this.WebSocketClient(url);
        };

        $.extend(WebSocketClient.prototype, EventBaseClass.prototype, {
            WebSocketClient: function (url) {
                this.EventBaseClass({
                    open:  [],
                    close: [],
                    message:    [],
                    connecting: []
                });

                this._connected = false;
                this.url    = url;
                this.client = null;
            },

            isConnected: function () {
                return this._connected;
            },

            isConnecting: function () {
                return !this._connected && this.client !== null;
            },

            reset: function () {
                this.client = null;
            },

            init: function () {
                this.dispatch('connecting');

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

            send: function (message, resendIfFail) {
                this.client.send(JSON.stringify(message));
            },

            extractDataFromEvent: function (event) {
                return event.data !== undefined ? JSON.parse(event.data) : null;
            },

            onMessage: function (event) {
                var data = this.extractDataFromEvent(event);

                this.inspectActivity('ws.message', data);
                this.dispatch('message', data);
            },

            onOpen: function (event) {
                this._connected = true;

                this.inspectActivity('ws.open', event);
                this.dispatch('open', event);
            },

            onClose: function (event) {
                this.client     = null;
                this._connected = false;

                this.inspectActivity('ws.close', event);
                this.dispatch('close', event);
            }
        });

        return WebSocketClient;
    }
);

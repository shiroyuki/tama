define(
    'common/ws',
    ['jquery', 'common/event_base_class'],
    function ($, EventBaseClass) {
        function WebSocketClient(url) {
            this.WebSocketClient(url);
        };

        $.extend(WebSocketClient.prototype, EventBaseClass.prototype, {
            _maxReconnections: 6,

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

                this._autoReconnect     = false;
                this._reconnectionTries = 0;
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
                    this.inspectActivity('ws.connect', 'warning.connected');

                    return;
                }

                if (this.isConnecting() || this.isConnected()) {
                    this.inspectActivity('ws.connect', 'warning.connecting');

                    return;
                }

                this.init();
            },

            send: function (message) {
                this.inspectActivity('send', message)
                this.client.send(JSON.stringify(message));
            },

            extractDataFromEvent: function (event) {
                return event.data !== undefined ? JSON.parse(event.data) : null;
            },

            setAutoReconnect: function (enabled) {
                this._autoReconnect = enabled;
            },

            onMessage: function (event) {
                var data = this.extractDataFromEvent(event);

                this.inspectActivity('ws.message', data);
                this.dispatch('message', data);
            },

            onOpen: function (event) {
                this._connected         = true;
                this._reconnectionTries = 0;

                this.inspectActivity('ws.open', event);
                this.dispatch('open', event);
            },

            onClose: function (event) {
                var delay;

                this.client     = null;
                this._connected = false;

                if (this._autoReconnect && this._reconnectionTries < this._maxReconnections) {
                    delay = Math.pow(2, this._reconnectionTries++);

                    setTimeout($.proxy(this.connect, this), delay * 1000);

                    this.inspectActivity('ws.reconnecting', {delay: delay});
                    this.dispatch('reconnecting', {delay: delay});

                    return;
                }

                this.inspectActivity('ws.close', event);
                this.dispatch('close', event);
            }
        });

        return WebSocketClient;
    }
);

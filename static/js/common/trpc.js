define(
    ['jquery', 'common/ws'],
    function ($, WebSocketClient) {
        function ToriRpcClient(url) {
            this.WebSocketClient(url);

            this.debugMode = true;
        };

        $.extend(ToriRpcClient.prototype, WebSocketClient.prototype, {
            request: function (service, method, data) {
                this.send({
                    id: this.getRequestType(service, method),
                    service: service,
                    method: method,
                    data: data
                });
            },

            onMessage: function (event) {
                var data = this.extractDataFromEvent(event),
                    type = 'message'
                ;

                if (data !== null) {
                    type = this.getRequestType(data.service, data.method);
                }

                this.inspectActivity(type, data);
                this.dispatch(type, data);
            },

            getRequestType: function (service, method) {
                if (service) {
                    return [service, method].join('.');
                } else if (method) {
                    return method;
                }

                return 'message';
            }
        });

        return ToriRpcClient;
    }
);
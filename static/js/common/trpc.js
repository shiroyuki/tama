function ToriRpcClient(url) {
    this.WebSocketClient(url);
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

        console.log('On Message:', type, ':', data);

        this.handleEvent(type, data);
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

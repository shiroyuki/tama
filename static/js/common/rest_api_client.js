define(
    ['jquery', 'common/event_base_class'],
    function ($, EventBaseClass) {
        function RestApiClient(url) {
            this.RestApiClient(url);
        };

        $.extend(RestApiClient.prototype, EventBaseClass.prototype, {
            RestApiClient: function (url) {
                this.EventBaseClass();

                this.url = url.replace(/\/+$/, '/');
            },

            request: function (method, key, message, okCallback, errorCallback) {
                var entryPoint = key ? this.url + key : this.url;

                $.ajax({
                    url:     entryPoint,
                    method:  method,
                    data:    message,
                    success: okCallback,
                    error:   errorCallback
                });
            },

            list: function (message, okCallback, errorCallback) {
                this.request('GET', null, message, okCallback, errorCallback);
            }
        });

        return RestApiClient;
    }
);

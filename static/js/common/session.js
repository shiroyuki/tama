define(
    ['jquery'],
    function ($) {
        function Session() {};

        $.extend(Session.prototype, {
            get: function (key) {
                var actualkey = this._constructLSKey(key),
                    rawValue  = localStorage.get(actualkey)
                ;

                return JSON.parse(rawValue);
            },

            set: function (key, value) {
                var actualkey = this._constructLSKey(key);

                localStorage.set(actualkey, JSON.stringify(value));
            },

            _constructLSKey: function (key) {
                return 'session.' + key;
            }
        })

        return Session;
    }
);
define(
    function () {
        return {
            isDefined: function (sample) {
                return sample !== undefined && sample !== null;
            },

            isStringEmpty: function (sample) {
                return sample === undefined || sample === null || sample.length === 0;
            }
        };
    }
)
define(
    [
        'jquery',
        'common/misc',
        'common/trpc',
        'common/event_base_class'
    ],
    function ($, misc, RpcSocket, EventBaseClass) {
        function Core(rpcSocketUrl) {
            this.EventBaseClass();

            this.rpcSocketUrl = rpcSocketUrl;
            this.rpc = new RpcSocket(this.rpcSocketUrl);

            this.$header     = $('.app-header');
            this.$syncStatus = $('.sync-status');

            this.$header.on('click', misc.eventHandlerNoPropagation);
            this.$syncStatus.on('click', $.proxy(this.onSyncStatusClickReconnect, this));

            this.rpc.on('open',  $.proxy(this.onConnected, this));
            this.rpc.on('close', $.proxy(this.onDisconnected, this));
        }

        $.extend(Core.prototype, EventBaseClass.prototype, {
            onSyncStatusClickReconnect: function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (this.$syncStatus.hasClass('socket-connected')) {
                    alert('Already connected. What else do you want?');

                    return;
                }

                this.rpc.connect();
            },

            onConnected: function (e) {
                this.$syncStatus.addClass('socket-connected');
                this.dispatch('connected');
            },

            onDisconnected: function (e) {
                this.$syncStatus.removeClass('socket-connected');
            }
        });

        return Core;
    }
)
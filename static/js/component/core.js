define(
    [
        'jquery',
        'common/misc',
        'common/trpc',
        'common/event_base_class'
    ],
    function ($, misc, RpcSocket, EventBaseClass) {
        function Core(rpcSocketUrl, options) {
            this.EventBaseClass();

            options = options || {};

            this.reconnectionCount      = 0;
            this.reconnectionCountLimit = options.reconnectionCountLimit || 10;

            this.rpcSocketUrl = rpcSocketUrl;
            this.rpc          = new RpcSocket(this.rpcSocketUrl);

            this.$header     = $('.app-header');
            this.$syncStatus = $('.sync-status');

            this.$header.on('click', misc.eventHandlerNoPropagation);
            this.$syncStatus.on('click', $.proxy(this.onSyncStatusClickReconnect, this));

            this.rpc.on('open',  $.proxy(this.onConnected, this));
            this.rpc.on('close', $.proxy(this.onDisconnected, this));

            misc.dialogManager.on('dialog/reconnection', 'click', '.reconnect', $.proxy(this.onAlertReconnectButtonClickReconnect, this));
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

            onAlertReconnectButtonClickReconnect: function (e) {
                e.preventDefault();
                e.stopPropagation();

                misc.dialogManager.cancelLastDialog();

                if (this.$syncStatus.hasClass('socket-connected')) {
                    return;
                }

                this.rpc.connect();
            },

            onConnected: function (e) {
                this.reconnectionCount = 0;

                this.$syncStatus.addClass('socket-connected');
                this.dispatch('connected');
            },

            onDisconnected: function (e) {
                this.reconnectionCount++;

                if (this.reconnectionCount >= this.reconnectionCountLimit) {
                    misc.dialogManager.use('dialog/reconnection');

                    this.$syncStatus.removeClass('socket-connected');
                    this.dispatch('disconnected');

                    return;
                }

                misc.dialogManager.use('dialog/reconnecting', {
                    reconnectionCount:      this.reconnectionCount,
                    reconnectionCountLimit: this.reconnectionCountLimit
                });

                this.$syncStatus.removeClass('socket-connected');
                this.dispatch('reconnecting');
            }
        });

        return Core;
    }
)
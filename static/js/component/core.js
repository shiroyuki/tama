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

            this.reconnectionDialogId   = null;
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
            this.rpc.on('reconnecting', $.proxy(this.onReconnecting, this));

            this.rpc.setAutoReconnect(true);

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
                console.log(this.reconnectionDialogId);

                if (this.reconnectionDialogId !== null) {
                    console.log('Reconnected.');

                    misc.dialogManager.cancelDialog(this.reconnectionDialogId);

                    this.reconnectionDialogId = null;
                }

                this.$syncStatus.addClass('socket-connected');
                this.dispatch('connected');
            },

            onReconnecting: function (e) {
                var $dialog;

                if (this.reconnectionDialogId !== null) {
                    return;
                }

                $dialog = misc.dialogManager.use('dialog/reconnecting', {
                    reconnectionCount:      this.rpc._reconnectionTries,
                    reconnectionCountLimit: this.rpc._maxReconnections
                });

                this.reconnectionDialogId = $dialog.attr('data-id');

                this.$syncStatus.removeClass('socket-connected');
                this.dispatch('reconnecting');
            },

            onDisconnected: function (e) {
                misc.dialogManager.use('dialog/reconnection');

                this.$syncStatus.removeClass('socket-connected');
                this.dispatch('disconnected');
            }
        });

        return Core;
    }
)
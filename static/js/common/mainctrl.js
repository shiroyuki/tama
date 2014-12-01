define(
    'common/mainctrl',
    ['jquery'],
    function ($) {
        function MainController(selector) {
            this.context = $(selector);
            this._stack  = [];
            this.$backButton = this.context.find('.prev-group');
        }

        function disableDefault(e) {
            e.preventDefault();
        }

        $.extend(MainController.prototype, {
            enable: function () {
                var defaultGroupName = $.trim(this.context.attr('data-default'));

                if (defaultGroupName === '') {
                    defaultGroupName = this.context.children('[data-group]').eq(0).attr('data-group');
                }

                // Disable highlighting.
                this.context.on('click', 'a', disableDefault);
                this.context.on('mousedown', 'a', disableDefault);
                this.context.on('mouseup', 'a', disableDefault);

                // Bind generic events.
                this.context.on('click', 'a.prev-group', $.proxy(this.onReturningTriggerClick, this));
                this.context.on('click', 'a[data-next]', $.proxy(this.onNavigatingItemClick, this));

                this.context.attr('data-default', defaultGroupName);
                this._showGroup(defaultGroupName);
            },
            
            getTrigger: function (id) {
                return this.context.find('a[data-id="' + id + '"]');
            },
            
            toggleTriggerActive: function (id) {
                this.getTrigger(id).toggleClass('active');
            },

            setTriggerActive: function (id, isActive) {
                this.getTrigger(id)[isActive ? 'addClass' : 'removeClass']('active');
            },

            on: function (triggerId, handler) {
                this.context.on('click', 'a[data-id="' + triggerId + '"]', handler);
            },

            onReturningTriggerClick: function (e) {
                var destination = this._stack.pop();

                this._showGroup(destination);
            },

            onNavigatingItemClick: function (e) {
                var currentGroup = this._currentGroup().attr('data-group'),
                    destination  = $(e.currentTarget).attr('data-next')
                ;

                this._stack.push(currentGroup);
                this._showGroup(destination);
            },

            _showGroup: function (groupName) {
                var defaultGroupName = this.context.attr('data-default'),
                    isBackToDefault  = defaultGroupName === groupName
                ;

                $controlGroups = this.context.children('[data-group]');

                $controlGroups.removeClass('active');
                $controlGroups.filter('[data-group="' + groupName + '"]').addClass('active');

                this.context.attr('data-current', groupName);

                this.$backButton[isBackToDefault ? 'removeClass' : 'addClass']('enabled');
            },

            _currentGroup: function () {
                return this.context.children('[data-group].active');
            }
        });

        return MainController;
    }
);
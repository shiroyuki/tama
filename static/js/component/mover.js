define(
    [
        'jquery',
        'common/misc',
        'common/event_base_class'
    ],
    function ($, misc, EventBaseClass) {
        function Mover(fileRestAPI) {
            this.EventBaseClass();

            this.context     = null;
            this.fileRestAPI = fileRestAPI;
        };

        $.extend(Mover.prototype, EventBaseClass.prototype, {
            enable: function (nodeCount) {
                this.context = misc.dialogManager.use(
                    'dialog/mover-target',
                    {
                        count: nodeCount,
                        unit:  nodeCount === 1 ? 'node' : 'nodes'
                    }
                );

                this.context.on('click', '.mover-iterator, .node .next-button', $.proxy(this.onClickGoNext, this));

                this.context.on('click', 'a.ok-button', $.proxy(this.onClickConfirmMoving, this));
            },

            go: function (path) {
                var self = this,
                    parent_path,
                    $dropzone = this.context.find('.mover-browser')
                ;

                this.context.attr('data-location', path);

                this.fileRestAPI.list(
                    { path: path },
                    function (response) {
                        var i, node;

                        parent_path_label = response.parent_path === '' ? 'Root Directory' : response.parent_path

                        self.context
                            .find('.mover-iterator')
                                .attr('data-path', response.parent_path)
                            .find('.text')
                                .text(parent_path_label);

                        $dropzone.empty();

                        for (i in response.nodes) {
                            node = response.nodes[i];

                            if (!node.is_dir) {
                                continue;
                            }

                            $dropzone.append(misc.templateManager.render('dialog/mover-target/iterating-node', node));
                        }
                    }
                );
            },

            onClickGoNext: function (e) {
                e.preventDefault();

                this.go($(e.currentTarget).attr('data-path'));
            },

            onClickConfirmMoving: function (e) {
                e.preventDefault();

                alert('Functionality not ready for use. (In development)');

                this.dispatch('confirm');
            }
        });

        return Mover;
    }
);
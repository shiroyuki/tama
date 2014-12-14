define(
    [
        'jquery',
        'common/event_base_class'
    ],
    function ($, EventBaseClass) {
        function NodeGrid(context, templateManager, options) {
            this.EventBaseClass();

            this.templateManager = templateManager;

            this.nodes   = {}
            this.context = context;
            this.options = {
                nodeTemplateName: null,
                keyExtractor: null,
                enablePJAX: false
            };

            if (options !== undefined) {
                $.extend(this.options, options);
            }
        }

        $.extend(NodeGrid.prototype, EventBaseClass.prototype, {
            update: function (nodes) {
                this.context.empty();

                $.each(nodes, $.proxy(function (index, node) {
                    var renderedNode = this.renderNode(node),
                        $node = $(renderedNode)
                    ;

                    $node.appendTo(this.context);
                }, this));
            },

            renderNode: function (node) {
                var output;

                node.mtype = node.type || 'unknown';
                node.url   = url_prefix_file + node.path;
                node.icon  = 'cube';
                node.title = node.name + ' (' + node.mtype + ')';

                if (node.is_dir) {
                    node.mtype = 'directory';
                    node.url   = url_prefix_dir + node.path;
                    node.icon  = 'cubes';
                    node.title = node.name;
                } else if (node.is_binary) {
                    node.url  = url_prefix_dl + node.path;
                    node.icon = 'cloud-download';
                }

                this.nodes[this.options.keyExtractor(node)] = node;

                return this.templateManager.render(this.options.nodeTemplateName, node);
            }
        });

        return NodeGrid;
    }
)
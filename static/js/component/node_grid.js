define(
    [
        'jquery',
        'common/misc',
        'common/event_base_class'
    ],
    function ($, misc, EventBaseClass) {
        function NodeGrid(context, templateManager, options) {
            this.EventBaseClass();
            this.NodeGrid(context, templateManager, options);
        }

        $.extend(NodeGrid.prototype, EventBaseClass.prototype, {
            NodeGrid: function (context, templateManager, options) {
                this.templateManager = templateManager;

                this.nodes   = {}
                this.context = context;
                this.options = {
                    nodeTemplateName:     null,
                    keyExtractor:         null,
                    nodeTemplateContexts: null,
                    enablePJAX:           false
                };

                if (options !== undefined) {
                    $.extend(this.options, options);
                }

                this.context.on('click', misc.eventHandlerNoPropagation);

                this.context.on('click',             '.node a', $.proxy(this.onNodeClick, this));
                this.context.on('click',             '.node a .node-marker', $.proxy(this.onNodeMarkerClick, this));
                this.context.on('mousedown mouseup', '.node a', misc.eventHandlerDisableDragging);
            },

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
                var contexts = this.options.nodeTemplateContexts(node);

                this.nodes[this.options.keyExtractor(node)] = contexts;

                return this.templateManager.render(this.options.nodeTemplateName, contexts);
            },

            onNodeClick: function (e) {
                this.dispatch('node.click', e);
            },

            onNodeMarkerClick: function (e) {
                e.stopPropagation();

                this.dispatch('node.marker.click', e);
            }
        });

        return NodeGrid;
    }
)
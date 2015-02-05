define(
    [
        'jquery',
        'common/misc',
        'common/event_base_class'
    ],
    function ($, misc, EventBaseClass) {
        function FileBrowser(context, rpc, locationBar, fsNodeGrid) {
            this.EventBaseClass();

            this.rpc = rpc;

            this.context     = context;
            this.locationBar = locationBar;
            this.fsNodeGrid  = fsNodeGrid;

            this.features = {};

            this.rpc.on('rpc.finder.find',          $.proxy(this.onSocketRpcFind, this));
            this.rpc.on('rpc.finder.create_folder', $.proxy(this.onSocketRpcCreateFolder, this));
            this.rpc.on('rpc.finder.create_file',   $.proxy(this.onSocketRpcCreateFile, this));
            this.rpc.on('rpc.finder.delete',        $.proxy(this.onSocketRpcDelete, this));
            this.rpc.on('rpc.finder.move',          $.proxy(this.onSocketRpcMove, this));

            this.fsNodeGrid.on('node.click',        $.proxy(this.onNodeClickUpdate, this));
            this.fsNodeGrid.on('node.marker.click', $.proxy(this.onNodeMarkerClick, this));
        };

        $.extend(FileBrowser.prototype, EventBaseClass.prototype, {
            reBrowsingUrlPrefix: new RegExp('^\/tree\/'),

            open: function (path) {
                if (path === undefined) {
                    throw 'tama.component.FileBrowser.UndefinedPath';
                }

                this.rpc.request('rpc.finder', 'find', { path: path });
            },

            deleteSelections: function () {
                var $targets = this.context.find('li.node.selected'),
                    paths = []
                ;

                if ($targets.length === 0) {
                    return;
                }

                $targets.each(function () {
                    var $target = $(this);

                    paths.push($target.attr('data-path'));
                });

                $targets.addClass('deleting');
                $targets.removeClass('selected');

                this.rpc.request('rpc.finder', 'delete', { paths: paths });

                // Reset the selections
                this.dispatch('node.select', this.makeSelectionNotificationData());
            },

            moveSelections: function (destination) {
                var $targets = this.context.find('li.node.selected'),
                    paths = []
                ;

                if ($targets.length === 0) {
                    return;
                }

                $targets.each(function () {
                    var $target = $(this);

                    paths.push($target.attr('data-path'));
                });

                $targets.addClass('moving');
                $targets.removeClass('selected');

                this.rpc.request('rpc.finder', 'move', { paths: paths, destination: destination });

                // Reset the selections
                this.dispatch('node.select', this.makeSelectionNotificationData());
            },

            getFeature: function (k) {
                if (this.features[k] === undefined) {
                    throw 'tama.component.FileBrowser.UnknownFeature';
                }

                return this.features[k];
            },

            setFeature: function (k, v) {
                if (this.features[k] === undefined) {
                    throw 'tama.component.FileBrowser.UnknownFeature';
                }

                this.features[k] = v;

                this.dispatch('feature.' + k + '.change', v);
            },

            getNodePath: function (requestPath) {
                var requestPath = requestPath || String(document.location.pathname);

                if (!requestPath.match(this.reBrowsingUrlPrefix)) {
                    throw 'tama.component.FileBrowser.InvalidBrowsingUrl';
                }

                return requestPath.replace(this.reBrowsingUrlPrefix, '');
            },

            createFile: function (path, name) {
                this.rpc.request('rpc.finder', 'create_file', {path: path, name: name});
            },

            createFolder: function (path, name) {
                this.rpc.request('rpc.finder', 'create_folder', {path: path, name: name});
            },

            refresh: function () {
                this.open(this.getNodePath());
            },

            onSocketRpcFind: function (response) {
                this.locationBar.set(response.result.path);
                this.fsNodeGrid.update(response.result.nodes);

                this.dispatch('open', response.result);
            },

            onSocketRpcDelete: function (response) {
                this.updateNodesOnBatchOperation('moving', response.result);
            },

            onSocketRpcMove: function (response) {
                this.updateNodesOnBatchOperation('moving', response.result);
            },

            updateNodesOnBatchOperation: function (className, result) {
                var $targets = this.context.find('li.node.' + className);

                if ($targets.length === 0) {
                    return;
                }

                $targets.each(function () {
                    var $target = $(this),
                        path    = $target.attr('data-path')
                    ;

                    if (result[path]) {
                        $targets.remove();

                        return;
                    }

                    $targets.removeClass(className);
                });
            },

            onSocketRpcCreateFolder: function (response) {
                if (!response.result.is_success) {
                    alert('Failed to create a folder. (' + response.error_code + ')');

                    this.dispatch('create.folder.failed', response.result);

                    return;
                }

                this.refresh();
                this.dispatch('create.folder.success', response.result);
            },

            onSocketRpcCreateFile: function (response) {
                if (!response.result.is_success) {
                    alert('Failed to create a file. (' + response.error_code + ')');

                    this.dispatch('create.file.failed', response.result);

                    return;
                }

                this.refresh();
                this.dispatch('create.file.success', response.result);
            },

            onNodeClickUpdate: function (e) {
                var $anchor = $(e.currentTarget),
                    $node   = $anchor.closest('.node'),
                    path    = $node.attr('data-path'),
                    node    = this.fsNodeGrid.nodes[path],
                    eventData = {
                        anchor:  $anchor,
                        context: $node,
                        node:    node
                    }
                ;

                if ($node.hasClass('deleting')) {
                    e.preventDefault();

                    alert('Being removed. Not available.');

                    return;
                }

                if (node.is_link) {
                    e.preventDefault();

                    this.dispatch('node.drive.blocked', eventData);

                    return;
                }

                if (node.is_dir) {
                    e.preventDefault();

                    this.dispatch('node.drive', eventData);

                    return;
                } else if (node.is_binary) {
                    e.preventDefault();

                    this.dispatch('node.open.unknown', eventData);

                    return;
                }

                this.dispatch('node.open.editor', eventData);
            },

            onNodeMarkerClick: function (e) {
                var $anchor = $(e.currentTarget),
                    $node   = $anchor.closest('.node'),
                    path    = $node.attr('data-path'),
                    node    = this.fsNodeGrid.nodes[path],
                    eventData = this.makeSelectionNotificationData(
                        $anchor,
                        $node,
                        node
                    )
                ;

                e.preventDefault();

                if ($node.hasClass('deleting')) {
                    alert('Being removed. Not available.');

                    return;
                }

                $node.toggleClass('selected');

                eventData.selected = $node.hasClass('selected');
                eventData.count    = this.context.find('.node.selected').length;

                this.dispatch('node.select', eventData);
            },

            makeSelectionNotificationData: function ($anchor, $node, node) {
                return {
                    anchor:   $anchor || null,
                    context:  $node   || null,
                    node:     node    || null,
                    selected: false,
                    count:    0
                };
            }
        });

        return FileBrowser;
    }
)
require(
    [
        'jquery',
        'common/misc',
        'common/state_controller',
        'common/mainctrl',
        'component/core',
        'component/file_browser',
        'component/location_bar',
        'component/node_grid',
    ],
    function ($, misc, StateController, MainController, Core, FileBrowser, LocationBar, NodeGrid) {
        var features = {
                inEditMode: false
            },
            $chrome          = null,
            sctrl            = new StateController(),
            mctrl            = new MainController('.main-controller'),
            templateManager  = misc.templateManager,
            dialogManager    = misc.dialogManager,
            core             = new Core(rpcSocketUrl),
            trpc             = core.rpc,
            locationBar      = new LocationBar($('.explorer-chrome .current-location'), templateManager, {
                enablePJAX:       true,
                stepTemplateName: 'explorer/step'
            }),
            fsNodeGrid       = new NodeGrid($('.explorer-chrome .node-list'), templateManager, {
                keyExtractor: function (node) {
                    return node.path;
                },
                nodeTemplateContexts: function (node) {
                    var contexts = {};

                    $.extend(contexts, node);

                    contexts.mtype = contexts.type || 'unknown';
                    contexts.url   = url_prefix_file + contexts.path;
                    contexts.icon  = 'cube';
                    contexts.title = contexts.name + ' (' + contexts.mtype + ')';

                    if (contexts.is_dir) {
                        contexts.mtype = 'directory';
                        contexts.url   = url_prefix_dir + contexts.path;
                        contexts.icon  = 'cubes';
                        contexts.title = contexts.name;
                    } else if (contexts.is_binary) {
                        contexts.url  = url_prefix_dl + contexts.path;
                    }

                    return contexts;
                },
                nodeTemplateName: 'explorer/node'
            }),
            browser          = new FileBrowser($('.explorer-chrome'), trpc, locationBar, fsNodeGrid)
        ;

        function onMCtrlToggleEditMode() {
            var inEditMode     = !browser.getFeature('inEditMode'),
                selectionCount = browser.fsNodeGrid.context.children('.selected').length
            ;

            browser.setFeature('inEditMode', inEditMode);

            if (!inEditMode && selectionCount > 0) {
                dialogManager.use('dialog/batch-operation', {
                    selectionCount: selectionCount + ' node' + (selectionCount === 1 ? '' : 's')
                });
            }
        }

        function onMCtrlTriggerNewFolder() {
            var name = prompt('What is the name of the new folder?');

            if (name === null) {
                return;
            }

            if (name.match(/^\./)) {
                alert('Sorry. This kind of folder names are reserved for system uses only.');

                return;
            }

            browser.createFile(currentLocation, name);
        }

        function onMCtrlTriggerNewFilefunction() {
            var name = prompt('What is the name of the new file?');

            if (name === null) {
                return;
            }

            if (name.match(/^\./)) {
                alert('Sorry. This kind of folder names are reserved for system uses only.');

                return;
            }

            browser.createFile(currentLocation, name);
        }

        function onMCtrlOpenAbout(e) {
            dialogManager.use('dialog/about');
        }

        function onNextState(e) {
            var nextPath = browser.getNodePath(e.path);

            browser.open(nextPath);
        }

        function onPreviousState(e) {
            var previousPath = browser.getNodePath();

            browser.open(previousPath);
        }

        function onCoreConnected() {
            browser.open(currentLocation);
        }

        function onNodeDrive(e) {
            sctrl.push(e.node.path, e.anchor.attr('href'));
        }

        function onNodeOpenUnknown(e) {
            var path = e.node.path,
                contexts = {
                    node:       e.node,
                    url_dl:     url_prefix_dl + path,
                    url_editor: url_prefix_file + path
                }
            ;

            dialogManager.use('dialog/open-node', contexts);
        }

        function onSwitchToEditMode(enabled) {
            mctrl.setTriggerActive('manage-objects', enabled);
        }

        mctrl.on('manage-objects', onMCtrlToggleEditMode);
        mctrl.on('new-folder',     onMCtrlTriggerNewFolder);
        mctrl.on('new-file',       onMCtrlTriggerNewFilefunction);
        mctrl.on('app-about',      onMCtrlOpenAbout);

        sctrl.on('push', onNextState);
        sctrl.on('pop', onPreviousState);

        core.on('connected', onCoreConnected);

        browser.on('feature.inEditMode.change', onSwitchToEditMode);
        browser.on('node.drive',                onNodeDrive);
        browser.on('node.open.unknown',         onNodeOpenUnknown);

        // Initialization
        trpc.connect();
        mctrl.enable();
        sctrl.enable();
    }
);

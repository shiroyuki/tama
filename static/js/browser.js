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
            $body           = $('body'),
            $chrome         = null,
            sctrl           = new StateController(),
            mctrl           = new MainController('.main-controller'),
            templateManager = misc.templateManager,
            dialogManager   = misc.dialogManager,
            core            = new Core(rpcSocketUrl),
            trpc            = core.rpc,
            locationBar,
            fsNodeGrid,
            browser
        ;

        locationBar = new LocationBar($('.explorer-chrome .current-location'), templateManager, {
            enablePJAX:       true,
            stepTemplateName: 'explorer/step'
        });

        fsNodeGrid = new NodeGrid($('.explorer-chrome .node-list'), templateManager, {
            keyExtractor: function (node) {
                return node.path;
            },

            nodeTemplateContexts: function (fsNode) {
                var vnode = {};

                $.extend(vnode, fsNode);

                vnode.mtype = vnode.type || 'unknown';
                vnode.url   = url_prefix_file + vnode.path;
                vnode.icon  = 'cube';
                vnode.title = vnode.name + ' (' + vnode.mtype + ')';

                if (vnode.is_link) {
                    vnode.mtype = 'link';
                    vnode.url   = '#disabled'
                    vnode.icon  = 'link';
                    vnode.title = vnode.name;
                } else if (vnode.is_dir) {
                    vnode.mtype = 'directory';
                    vnode.url   = url_prefix_dir + vnode.path;
                    vnode.icon  = 'cubes';
                    vnode.title = vnode.name;
                } else if (vnode.is_binary) {
                    vnode.url  = url_prefix_dl + vnode.path;
                }

                return vnode;
            },

            nodeTemplateName: 'explorer/node'
        });

        browser = new FileBrowser($('.explorer-chrome'), trpc, locationBar, fsNodeGrid);

        function onMCtrlDeleteObjects(e) {
            //...
            alert('Deleting?');
        }

        function onMCtrlUpdateOnSelection(e) {
            console.log(e);
            $body.attr('data-selection-count', e.count);
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
            browser.open(e.url.replace(/^\/tree\//, '')); // temporary solution to why e.state return undefined.
        }

        function onPreviousState(e) {
            var previousPath = browser.getNodePath();

            browser.open(previousPath);
        }

        function onCoreConnected() {
            browser.open(currentLocation);
        }

        function onCoreDisconnected() {
            alert('Disconnected');
        }

        function onNodeDrive(e) {
            sctrl.push(e.anchor.attr('href'), e.node.path);
        }

        function onNodeDriveBlocked(e) {
            alert('Access to symbolic link denied!');
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

        mctrl.on('new-folder',     onMCtrlTriggerNewFolder);
        mctrl.on('new-file',       onMCtrlTriggerNewFilefunction);
        mctrl.on('app-about',      onMCtrlOpenAbout);
        mctrl.on('delete-objects', onMCtrlDeleteObjects);

        sctrl.on('push', onNextState);
        sctrl.on('pop', onPreviousState);

        core.on('connected', onCoreConnected);
        core.on('disconnected', onCoreDisconnected);

        browser.on('node.drive',         onNodeDrive);
        browser.on('node.drive.blocked', onNodeDriveBlocked);
        browser.on('node.open.unknown',  onNodeOpenUnknown);
        browser.on('node.select',        onMCtrlUpdateOnSelection);

        // Initialization
        trpc.connect();
        mctrl.enable();
        sctrl.enable();
        
        $body.attr('data-selection-count', 0);
    }
);

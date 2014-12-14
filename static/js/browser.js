require(
    [
        'jquery',
        'common/misc',
        'common/template_manager',
        'common/dialog_manager',
        'common/state_controller',
        'common/mainctrl',
        'component/core',
        'component/file_browser',
        'component/location_bar',
        'component/node_grid',
    ],
    function ($, misc, TemplateManager, DialogManager, StateController, MainController, Core, FileBrowser, LocationBar, NodeGrid) {
        var features = {
                inEditMode: false
            },
            $syncStatus      = $('.sync-status'),
            $chrome          = $('.explorer-chrome'),
            $currentLocation = $('.current-location'),
            $nodeList        = $chrome.find('.node-list'),
            $appHeader       = $('.app-header'),
            sctrl            = new StateController(),
            mctrl            = new MainController('.main-controller'),
            templateManager  = new TemplateManager(),
            dialogManager    = new DialogManager($('.dialog-backdrop'), templateManager),
            core             = new Core(rpcSocketUrl),
            trpc             = core.rpc,
            locationBar      = new LocationBar($('.explorer-chrome .current-location'), templateManager),
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
            browser          = new FileBrowser(trpc, locationBar, fsNodeGrid)
        ;

        window.alert = function (message) {
            dialogManager.use(
                'dialog/base',
                {
                    content: message.replace(/\n/g, '<br/>')
                }
            );
        }

        function onMCtrlToggleEditMode() {
            browser.setFeature('inEditMode', !browser.getFeature('inEditMode'));
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

        function onSwitchToEditMode(enabled) {
            mctrl.setTriggerActive('manage-objects', enabled);

            if (enabled) {
                $chrome.addClass('edit-mode');

                return;
            }

            $chrome.removeClass('edit-mode');
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

        browser.on('node.drive', onNodeDrive);
        browser.on('node.open.unknown', onNodeOpenUnknown);

        mctrl.on('manage-objects', onMCtrlToggleEditMode);
        mctrl.on('new-folder', onMCtrlTriggerNewFolder);
        mctrl.on('new-file', onMCtrlTriggerNewFilefunction);
        mctrl.on('app-about', function (e) {
            dialogManager.use('dialog/about');
        });

        sctrl.on('push', onNextState);
        sctrl.on('pop', onPreviousState);

        core.on('connected', onCoreConnected);

        // Initialization
        trpc.connect();
        mctrl.enable();
        sctrl.enable();
    }
);

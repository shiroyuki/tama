require(
    [
        'jquery',
        'common/misc',
        'common/template_manager',
        'common/dialog_manager',
        'common/state_controller',
        'common/mainctrl',
        'component/core',
        'component/file_browser'
    ],
    function ($, misc, TemplateManager, DialogManager, StateController, MainController, Core, FileBrowser) {
        var features = {
                inEditMode: false
            },
            nodes            = {},
            popStateCount    = 0, // deprecated
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
            browser          = new FileBrowser(trpc)
        ;

        window.alert = function (message) {
            dialogManager.use(
                'dialog/base',
                {
                    content: message.replace(/\n/g, '<br/>')
                }
            );
        }

        function onSocketRpcFind(response) {
            var output,
                path  = response.result.path,
                steps = path.split(/\//g),
                i
            ;

            $nodeList.empty();
            $currentLocation.empty();

            if (path.length > 0) {
                for (i in steps) {
                    var step_name = steps[i],
                        step_path = steps.slice(0, i + 1).join('/')
                        contexts = {
                            name: step_name,
                            path: step_path,
                            url:  url_prefix_dir + step_path
                        },
                        output = templateManager.render('explorer/step', contexts);
                    ;

                    $currentLocation.append(output);
                }
            }

            $.each(response.result.nodes, function () {
                var node = this,
                    $node;

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

                nodes[node.path] = node;

                output = templateManager.render('explorer/node', node);
                $node  = $(output);

                $node.appendTo($nodeList);
            });
        }

        function onSocketRpcCreateFolder(response) {
            if (!response.result.is_success) {
                alert('Failed to create a folder. (' + response.result.error_code + ')');

                return;
            }

            // Soft-reload
            browser.open(browser.getNodePath());
        }

        function onSocketRpcCreateFile(response) {
            if (!response.result.is_success) {
                alert('Failed to create a file. (' + response.result.error_code + ')');

                return;
            }

            // Soft-reload
            browser.open(browser.getNodePath());
        }

        function onMCtrlToggleEditMode() {
            features.inEditMode = !features.inEditMode;
            $chrome.toggleClass('edit-mode');
            mctrl.toggleTriggerActive('manage-objects');
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

        function onNodeClickUpdate(e) {
            var $anchor = $(this),
                $node = $anchor.closest('.node'),
                path = $node.attr('data-path'),
                type = $node.attr('data-type'),
                node = nodes[path];

            if (features.inEditMode) {
                e.preventDefault();

                $node.toggleClass('selected');

                return;
            }

            if (node.is_dir) {
                e.preventDefault();

                sctrl.push(node.path, $anchor.attr('href'));
            } else if (node.is_binary) {
                e.preventDefault();
            }
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

        trpc.on('rpc.finder.find', onSocketRpcFind);
        trpc.on('rpc.finder.create_folder', onSocketRpcCreateFolder);
        trpc.on('rpc.finder.create_file', onSocketRpcCreateFile);

        mctrl.on('manage-objects', onMCtrlToggleEditMode);
        mctrl.on('new-folder', onMCtrlTriggerNewFolder);
        mctrl.on('new-file', onMCtrlTriggerNewFilefunction);
        mctrl.on('app-about', function (e) {
            dialogManager.use('dialog/about');
        });

        sctrl.on('push', onNextState);
        sctrl.on('pop', onPreviousState);

        core.on('connected', onCoreConnected);

        $nodeList.on('click',             '.node a', onNodeClickUpdate);
        $nodeList.on('mousedown mouseup', '.node a', misc.eventHandlerDisableDragging);

        // Initialization
        trpc.connect();
        mctrl.enable();
        sctrl.enable();
    }
);

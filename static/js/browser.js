require(
    [
        'jquery',
        'common/template',
        'common/mainctrl',
        'common/trpc'
    ],
    function ($, Template, MainController, ToriSocket) {
        /*var */features = {
                inEditMode: false
            },
            nodes = {},
            popStateCount = 0,
            $syncStatus = $('.sync-status'),
            $chrome = $('.explorer-chrome'),
            $currentLocation = $('.current-location'),
            $nodeList = $chrome.find('.node-list'),
            mctrl = new MainController('.main-controller'),
            trpc  = new ToriSocket(rpcSocketUrl),
            tmpl  = new Template()
        ;

        function disableDragging(e) {
            e.preventDefault();
        }

        function onConnected(e) {
            console.log('Connected');
            $syncStatus.addClass('socket-connected');
            trpc.request('rpc.finder', 'find', { path: currentLocation });
        }

        function onDisconnected(e) {
            console.log('Disconnected');
            $syncStatus.removeClass('socket-connected');
        }

        function onSocketRpcFind(response) {
            var output,
                path = response.result.path;

            $nodeList.empty();

            $currentLocation.text(path.length === 0 ? '<home>' : path);

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

                output = tmpl.render('node', node);
                $node  = $(output);

                $node.appendTo($nodeList);
            });
        }

        function onSocketRpcCreateFolder(response) {
            if (!response.result.is_success) {
                alert('Failed to create a folder. (' + response.result.error_code + ')');

                return;
            }

            history.go(0);
        }

        function onSocketRpcCreateFile(response) {
            if (!response.result.is_success) {
                alert('Failed to create a file. (' + response.result.error_code + ')');

                return;
            }

            history.go(0);
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

            trpc.request('rpc.finder', 'create_folder', {path: currentLocation, name: name});
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

            trpc.request('rpc.finder', 'create_file', {path: currentLocation, name: name});
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

                if (--popStateCount) {
                    popStateCount = 0;
                }
                
                if (popStateCount === 0) {
                    window.history.pushState(node.path, null, $anchor.attr('href'));
                }
                
                trpc.request('rpc.finder', 'find', { path: node.path });
            } else if (node.is_binary) {
                e.preventDefault();
            }
        }

        trpc.on('rpc.finder.find', onSocketRpcFind);
        trpc.on('rpc.finder.create_folder', onSocketRpcCreateFolder);
        trpc.on('rpc.finder.create_file', onSocketRpcCreateFile);
        trpc.on('open', onConnected);
        trpc.on('close', onDisconnected);

        mctrl.on('manage-objects', onMCtrlToggleEditMode);
        mctrl.on('new-folder', onMCtrlTriggerNewFolder);
        mctrl.on('new-file', onMCtrlTriggerNewFilefunction);

        $nodeList.on('click',             '.node a', onNodeClickUpdate);
        $nodeList.on('mousedown mouseup', '.node a', disableDragging);

        trpc.connect();
        mctrl.enable();

        // Handle browser's navigation
        window.onpopstate = function(event) {
            var path = String(document.location.pathname).replace(/^\/tree\//, '');
            
            popStateCount++;
            
            trpc.request('rpc.finder', 'find', { path: path });
        };
    }
);

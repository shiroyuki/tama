require(
    [
        'jquery',
        'common/mainctrl',
        'common/trpc'
    ],
    function ($, MainController, ToriSocket) {
        var features = {
                inEditMode: false
            },
            $chrome = $('.explorer-chrome'),
            $nodeList = $chrome.find('.node-list');
            mctrl = new MainController('.main-controller'),
            trpc  = new ToriSocket(rpcSocketUrl)
        ;

        function disableDragging(e) {
            e.preventDefault();
        }

        function onNodeClickToggleMarker(e) {
            if (!features.inEditMode) {
                return;
            }

            e.preventDefault();

            $(this).parent().toggleClass('selected');
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

            trpc.request('finder', 'create_folder', {path: currentLocation, name: name});
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

            trpc.request('finder', 'create_file', {path: currentLocation, name: name});
        }

        trpc.on('finder.create_folder', onSocketRpcCreateFolder);
        trpc.on('finder.create_file', onSocketRpcCreateFile);
        mctrl.on('manage-objects', onMCtrlToggleEditMode);
        mctrl.on('new-folder', onMCtrlTriggerNewFolder);
        mctrl.on('new-file', onMCtrlTriggerNewFilefunction);

        $nodeList.on('click', '.node a', onNodeClickToggleMarker);
        $nodeList.on('mousedown', '.node a', disableDragging);
        $nodeList.on('mouseup', '.node a', disableDragging);

        trpc.connect();
        mctrl.enable();
    }
);
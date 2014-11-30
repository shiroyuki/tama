require(
    [
        'jquery',
        'common/mainctrl',
        'common/trpc'
    ],
    function ($, MainController, ToriSocket) {
        var mctrl = new MainController('.main-controller'),
            trpc  = new ToriSocket(rpcSocketUrl);

        trpc.on('finder.create_folder', function (response) {
            if (!response.result.is_success) {
                alert('Failed to create a folder. (' + response.result.error_code + ')');

                return;
            }

            history.go(0);
        });

        trpc.on('finder.create_file', function (response) {
            if (!response.result.is_success) {
                alert('Failed to create a file. (' + response.result.error_code + ')');

                return;
            }

            history.go(0);
        });

        mctrl.on('new-folder', function () {
            var name = prompt('What is the name of the new folder?');

            if (name === null) {
                return;
            }

            if (name.match(/^\./)) {
                alert('Sorry. This kind of folder names are reserved for system uses only.');

                return;
            }

            trpc.request('finder', 'create_folder', {path: currentLocation, name: name});
        });

        mctrl.on('new-file', function () {
            var name = prompt('What is the name of the new file?');

            if (name === null) {
                return;
            }

            if (name.match(/^\./)) {
                alert('Sorry. This kind of folder names are reserved for system uses only.');

                return;
            }

            trpc.request('finder', 'create_file', {path: currentLocation, name: name});
        });

        trpc.connect();
        mctrl.enable();
    }
);
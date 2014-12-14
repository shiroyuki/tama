define(
    ['jquery'],
    function ($) {
        function FileBrowser(rpc) {
            this.rpc = rpc;
        };

        $.extend(FileBrowser.prototype, {
            reBrowsingUrlPrefix: new RegExp('^\/tree\/'),

            open: function (path) {
                this.rpc.request('rpc.finder', 'find', { path: path });
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
            }
        });

        return FileBrowser;
    }
)
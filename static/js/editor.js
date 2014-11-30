var editor;
var socket;

require(
    [
        'common/trpc',
        'common/editor'
    ],
    function (ToriRpcClient, Editor) {
        socket = new ToriRpcClient(rpcSocketUrl);
        editor = new Editor('editor', socket);

        socket.on('open', function () {
            console.log('connected');
            editor.open(filename);
            editor.enableKeyBinding();
        });

        socket.on('close', function () {
            console.log('disconnected');
        });

        socket.on('finder.get', $.proxy(editor.onFinderGet, editor));
        socket.on('finder.put', $.proxy(editor.onFinderPut, editor));

        socket.connect();
    }
);

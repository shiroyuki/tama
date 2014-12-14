var editor;
var socket;

require(
    [
        'common/trpc',
        'common/editor'
    ],
    function (RpcInterface, Editor) {
        var socket = new RpcInterface(rpcSocketUrl),
            editor = new Editor('editor', socket)
        ;

        socket.on('open', function () {
            console.log('connected');
            editor.open(filename);
            editor.enableKeyBinding();
        });

        socket.on('close', function () {
            console.log('disconnected');
        });

        socket.on('rpc.finder.get', $.proxy(editor.onFinderGet, editor));
        socket.on('rpc.finder.put', $.proxy(editor.onFinderPut, editor));

        socket.connect();
    }
);

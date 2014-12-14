var editor;
var socket;

require(
    [
        'common/trpc',
        'common/editor',
        'common/misc',
        'component/core',
        'component/location_bar'
    ],
    function (RpcInterface, Editor, misc, Core, LocationBar) {
        var core        = new Core(rpcSocketUrl),
            editor      = new Editor('editor', core.rpc),
            locationBar = new LocationBar($('.location-bar .current-location'), misc.templateManager, {
                enablePJAX:       true,
                stepTemplateName: 'editor/step'
            })
        ;

        core.on('connected', function () {
            editor.open(filename);
            editor.enableKeyBinding();
        });

        core.rpc.on('rpc.finder.get', $.proxy(editor.onFinderGet, editor));
        core.rpc.on('rpc.finder.put', $.proxy(editor.onFinderPut, editor));

        core.rpc.connect();

        locationBar.set(parentPath);
        
        $('.app-container').css('top', $('.app-header').outerHeight());
    }
);

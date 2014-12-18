var editor;
var socket;

require(
    [
        'common/misc',
        'common/trpc',
        'common/editor',
        'common/misc',
        'component/core',
        'component/location_bar'
    ],
    function (misc, RpcInterface, Editor, misc, Core, LocationBar) {
        var core        = new Core(rpcSocketUrl),
            editor      = new Editor('editor', core.rpc),
            locationBar = new LocationBar($('.location-bar .current-location'), misc.templateManager, {
                enablePJAX:       true,
                stepTemplateName: 'editor/step'
            }),
            dialogManager = misc.dialogManager,
            $metadataMenu = $('.metadata .menu')
        ;

        function onCoreConnected() {
            editor.open(filename); // global
            editor.enableKeyBinding();
        }

        function onMoreOptionClick(e) {
            e.preventDefault();

            dialogManager.useVPrompt(
                'Options',
                [
                    {
                        id:    'save',
                        label: 'Save the changes.',
                        action: $.proxy(editor.onClickSave, editor)
                    },
                    {
                        id:    'delete',
                        label: 'Delete the file.'
                    },
                    {
                        id:    'revert',
                        label: 'Revert all changes.'
                    }
                ]
            );
        }

        function onEditorSaveInProgress(node) {
            alert('Saving...');
        }

        function onEditorSaveOk() {
            dialogManager.cancelLastDialog();
            alert('Saved');
        }

        function onEditorSaveFailed(result) {
            dialogManager.cancelLastDialog();
            alert('Failed to save (' + result.error_code + ')');
        }

        core.on('connected', onCoreConnected);
        editor.on('save.in_progress', onEditorSaveInProgress);
        editor.on('save.ok', onEditorSaveOk);
        editor.on('save.failed', onEditorSaveFailed);
        $metadataMenu.on('click', '.options', onMoreOptionClick);

        core.rpc.connect();

        locationBar.set(parentPath);

        $('.app-container').css('top', $('.app-header').outerHeight());
    }
);

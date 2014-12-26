dependencies = [
    'common/misc',
    'common/trpc',
    'common/editor',
    'common/misc',
    'component/core',
    'component/location_bar'
];

function main(misc, RpcInterface, Editor, misc, Core, LocationBar) {
    var isLoaded    = false,
        core        = new Core(rpcSocketUrl),
        editor      = new Editor('editor', core.rpc, editorOptions),
        locationBar = new LocationBar($('.location-bar .current-location'), misc.templateManager, {
            enablePJAX:       true,
            stepTemplateName: 'editor/step'
        }),
        dialogManager = misc.dialogManager,
        $metadataMenu = $('.metadata .menu'),
        $metadataFile = $('.metadata .file')
    ;

    function onCoreConnected() {
        if (isLoaded) {
            alert('Reconnected.');
        }

        editor.open(filename); // global
        editor.enableKeyBinding();

        isLoaded = true;
    }

    function onMoreOptionClick(e) {
        e.preventDefault();

        dialogManager.useVPrompt(
            'Options',
            [
                {
                    id:    'save',
                    label: 'Save the changes',
                    action: $.proxy(editor.onClickSave, editor)
                },
                {
                    id:    'delete',
                    label: 'Delete this file'
                },
                {
                    id:    'revert',
                    label: 'Revert the changes'
                },
                {
                    id:    'mode-switch',
                    label: 'Change the syntax highlighter',
                    action: onEditorModeSwitchPrompt
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

    function onEditorModeChange(event) {
        $metadataFile.children('.mode').html(event.mode);
    }

    function onEditorModeSwitchPrompt() {
        var $dialog = dialogManager.use('dialog/mode-selection', {
            modes: editor.modes
        });

        $dialog.find('[data-value="' + editor.mode + '"]').addClass('used');
        $dialog.find('[data-value="' + editor.defaultMode + '"]').addClass('default');
    }

    function onEditNewModeSelected(e) {
        var $anchor = $(this),
            mode = $anchor.attr('data-value');

        editor.setMode(mode);

        $anchor.parent().children('.used').removeClass('used');
        $anchor.addClass('used');
    }

    core.on('connected', onCoreConnected);

    editor.on('mode.change',      onEditorModeChange);
    editor.on('save.in_progress', onEditorSaveInProgress);
    editor.on('save.ok',          onEditorSaveOk);
    editor.on('save.failed',      onEditorSaveFailed);

    dialogManager.on('dialog/mode-selection', 'click', 'a[data-option="mode.change"]', onEditNewModeSelected);

    $metadataFile.on('click', '.mode',    onEditorModeSwitchPrompt);
    $metadataMenu.on('click', '.options', onMoreOptionClick);

    core.rpc.connect();

    locationBar.set(parentPath);

    $('.app-container').css('top', $('.app-header').outerHeight());
}

try {
    require(dependencies, main);
} catch (e) {
    alert('Failed to initialize the editor. (Reason: ' + e + ')');
}

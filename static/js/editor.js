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
        $appContainer = $('.app-container'),
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
                    action: onClickSave
                },
                {
                    id:    'delete',
                    label: 'Delete this file',
                    action: onClickDelete
                },
                {
                    id:    'revert',
                    label: 'Revert the unsaved changes',
                    action: onClickRevert
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
    }

    function onEditorSaveFailed(result) {
        dialogManager.cancelLastDialog();
        alert('Failed to save (' + result.error_code + ')');
    }

    function onEditorDeleteInProgress(node) {
        alert('Deleting...');
    }

    function onEditorDeleteOk() {
        dialogManager.cancelLastDialog();
        window.location = fullParentPath;
    }

    function onEditorDeleteFailed(result) {
        dialogManager.cancelLastDialog();
        alert('Failed to delete');
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

    function onClickRevert(e) {
        e.preventDefault();

        editor.open(filename);
        dialogManager.cancelLastDialog();
    }

    function onClickSave(e) {
        e.preventDefault();

        editor.save();
    }

    function onClickDelete(e) {
        e.preventDefault();

        editor.remove();
    }

    core.on('connected', onCoreConnected);

    editor.on('mode.change',      onEditorModeChange);
    editor.on('save.in_progress', onEditorSaveInProgress);
    editor.on('save.ok',          onEditorSaveOk);
    editor.on('save.failed',      onEditorSaveFailed);
    editor.on('delete.in_progress', onEditorDeleteInProgress);
    editor.on('delete.ok',          onEditorDeleteOk);
    editor.on('delete.failed',      onEditorDeleteFailed);

    dialogManager.on('dialog/mode-selection', 'click', 'a[data-option="mode.change"]', onEditNewModeSelected);

    $metadataFile.on('click', '.mode',    onEditorModeSwitchPrompt);
    $metadataMenu.on('click', '.options', onMoreOptionClick);

    core.rpc.connect();

    locationBar.set(parentPath);

    $appContainer.css('margin-top', $('.metadata').outerHeight());
    $appContainer.css('margin-bottom', $('.app-header').outerHeight());
}

try {
    require(dependencies, main);
} catch (e) {
    alert('Failed to initialize the editor. (Reason: ' + e + ')');
}

/*!
 * VisualEditor MediaWiki SequenceRegistry registrations.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextItalic', 'mwWikitextWarning', '\'\'' )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextNowiki', 'mwWikitextWarning', '<nowiki' )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextSig', 'mwWikitextWarning', '~~~' )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextHeading', 'heading2', [ { type: 'paragraph' }, '=', '=' ], 2 )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'numberHash', 'numberWrapOnce', [ { type: 'paragraph' }, '#', ' ' ], 2 )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextDefinition', 'mwWikitextWarning',  [ { type: 'paragraph' }, ';' ] )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextDescription', 'blockquote',  [ { type: 'paragraph' }, ':' ], 1 )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextTable', 'insertTable',  '{|', 2 )
);
ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextComment', 'comment',  '<!--', 4 )
);

/* Help registrations */

ve.ui.commandHelpRegistry.register( 'formatting', 'heading2', {
	sequence: [ 'wikitextHeading' ],
	msg: 'visualeditor-formatdropdown-format-heading2'
} );
ve.ui.commandHelpRegistry.register( 'formatting', 'listNumber', { sequence: [ 'numberHash' ] } );
ve.ui.commandHelpRegistry.register( 'formatting', 'blockquote', { sequence: [ 'wikitextDescription' ] } );
ve.ui.commandHelpRegistry.register( 'insert', 'table', {
	sequence: [ 'wikitextTable' ],
	msg: 'visualeditor-table-insert-table'
} );
ve.ui.commandHelpRegistry.register( 'insert', 'comment', {
	sequence: [ 'wikitextComment' ],
	msg: 'visualeditor-commentinspector-title'
} );

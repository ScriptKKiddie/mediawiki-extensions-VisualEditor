/**
 * VisualEditor user interface Context class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Context object.
 *
 * @class
 * @constructor
 * @param surface
 * @param {jQuery} $overlay DOM selection to add nodes to
 */
ve.ui.Context = function VeUiContext( surface, $overlay ) {
	if ( !surface ) {
		return;
	}

	// Properties
	this.surface = surface;
	this.surfaceModel = surface.getModel();

	this.inspectors = {};
	this.inspector = null;
	this.position = null;
	this.visible = false;

	// Base elements
	this.$ = $( '<div class="ve-ui-context"></div>' );
	this.$callout = $( '<div class="ve-ui-context-callout"></div>' );
	this.$inner = $( '<div class="ve-ui-context-inner"></div>' )
		.appendTo( this.$ );
	this.$menu = $( '<div class="ve-ui-context-menu"></div>' )
		.appendTo( this.$inner );

	// Inspectors
	this.$inspectors = $( '<div class="ve-ui-context-inspectors"></div>' )
		.appendTo ( this.$inner );
	this.$overlay = $( '<div class="ve-ui-context-frame-overlay"></div>' )
		.appendTo( this.$ );

	// Append base
	this.$.prepend( this.$callout );
	( $overlay || $( 'body' ) ).append( this.$ );

	// Create Frame for inspectors.
	this.frameView = new ve.ui.Frame( {
		'stylesheets': [
			ve.init.platform.getModulesUrl() + '/ve/ui/styles/ve.ui.Inspector.css',
			ve.init.platform.getModulesUrl() +
						( window.devicePixelRatio > 1 ?
							'/ve/ui/styles/ve.ui.Inspector.Icons-vector.css' :
							'/ve/ui/styles/ve.ui.Inspector.Icons-raster.css' )
		]
	}, this.$inspectors );

	this.surface.getView().getDocument().getDocumentNode().$.on( {
		'focus': ve.bind( this.onDocumentFocus, this ),
		'blur': ve.bind( this.onDocumentBlur, this )
	} );

	this.surfaceModel.on( 'change', ve.bind( this.onChange, this ) );
};

/* Static Members */

// Debounced onChange method bound to model change event triggers context update
ve.ui.Context.prototype.onChange = ve.debounce( function ( transaction, selection ) {
	if ( selection ) {
		ve.bind( ve.ui.Context.prototype.update.call( this ), this );
	}
}, 250 );

/**
 * Updates the context icon.
 *
 * @method
 */
ve.ui.Context.prototype.update = function () {
	var doc = this.surfaceModel.getDocument(),
		sel = this.surfaceModel.getSelection(),
		annotations = null,
		inspectors = [],
		name,
		i;

	if ( doc.getText( sel ).length > 0 ) {
		// Clearing out the toolbar & menu to rebuild.
		// TODO: Consider more efficient implementation.
		this.$menu.empty();
		// Get annotations.
		annotations = doc.getAnnotationsFromRange( sel ).get();
		// Look for inspectors that match annotations.
		for ( i = 0; i < annotations.length; i++ ) {
			name = annotations[i].name.split('/')[0];
			// Add inspector on demand.
			if ( this.initInspector( name ) ) {
				inspectors.push( name );
			}
		}
		if ( inspectors.length > 0 ) {
			// Toolbar
			this.$toolbar = $( '<div class="ve-ui-context-toolbar"></div>' );
			// Create inspector toolbar
			this.toolbarView = new ve.ui.Toolbar(
				this.$toolbar,
				this.surface,
				[{ 'name': 'inspectors', 'items' : inspectors }]
			);
			// Note: Menu attaches the provided $tool element to the container.
			this.menuView = new ve.ui.Menu(
				[ { 'name': 'tools', '$': this.$toolbar } ], // Tools
				null, // Callback
				this.$menu, // Container
				this.$inner // Parent
			);
			this.set();
		} else if ( !this.inspector ) {
			this.unset();
		}
	} else {
		this.unset();
	}
};

ve.ui.Context.prototype.unset = function () {
	if ( this.inspector ) {
		this.closeInspector( false );
		this.obscure( this.$inspectors );
		this.$overlay.hide();
	}
	if ( this.menuView ) {
		this.obscure( this.$menu );
	}
	this.close();
};

ve.ui.Context.prototype.obscure = function ( el ) {
	el.css( {
		'top': -5000
	} );
};

ve.ui.Context.prototype.reveal = function ( el ) {
	el.css( {
		'top': 0
	} );
};

ve.ui.Context.prototype.getSelectionPosition = function () {
	var selectionRect = this.surface.getView().getSelectionRect();
	return new ve.Position( selectionRect.end.x, selectionRect.end.y );
};

ve.ui.Context.prototype.open = function () {
	this.$.css( 'visibility', 'visible' );
};

ve.ui.Context.prototype.close = function () {
	this.$.css( 'visibility', 'hidden' );
};

ve.ui.Context.prototype.set = function () {
	this.position = this.getSelectionPosition();
	this.$.css( {
		'left': this.position.left,
		'top': this.position.top
	} );
	// Open context.
	this.open();

	function getDimensions () {
		var height, width;
		if ( this.inspector ) {
			height = this.$inspectors.outerHeight( true );
			width = this.$inspectors.outerWidth( true );
		} else {
			height = this.$menu.outerHeight( true );
			width = this.$menu.outerWidth( true );
		}
		return {
			'height': height,
			'width': width
		};
	}
	function getLeft () {
		var width = getDimensions.call( this ).width,
			left = -( width / 2 );
		// Boundary checking left.
		if ( this.position.left < width / 2 ) {
			left = -( this.$.children().outerWidth( true ) / 2 ) - ( this.position.left / 2 );
		// Checking right.
		} else if ( $( 'body' ).width() - this.position.left < width ) {
			left = -( width - ( ( $( 'body' ).width() - this.position.left ) / 2) );
		}
		return left;
	}

	if ( this.inspector ) {
		// Reveal inspector
		this.reveal( this.$inspectors );
	} else {
		if ( !this.visible ) {
			// Fade in the context.
			this.$.fadeIn( 'fast' );
			this.visible = true;
		}
		// Reveal menu
		this.reveal( this.$menu );
	}
	// Position inner context.
	this.$inner.css( {
		'left': getLeft.call( this ),
		'height': getDimensions.call( this ).height,
		'width': getDimensions.call( this ).width
	} );
};

// Method to position iframe overlay above or below an element.
ve.ui.Context.prototype.setOverlayPosition = function ( config ) {
	var left, top;
	if (
		config === undefined ||
		! ( 'overlay' in config )
	) {
		return;
	}
	// Set iframe overlay below element.
	left = -( this.$inner.width() / 2 ) + config.el.offset().left;
	top = config.el.offset().top + config.el.outerHeight( true );
	// Set position.
	config.overlay.css( {
		'left': left,
		'top': top,
		// RTL position fix.
		'width': config.overlay.children().outerWidth( true )
	} );
};

/* Inspector methods */


/* Lazy load inspectors on demand */
ve.ui.Context.prototype.initInspector = function ( name ) {
	// Add inspector on demand.
	if ( ve.ui.inspectorFactory.lookup( name ) ) {
		if ( !( name in this.inspectors ) ) {
			this.addInspector( name, ve.ui.inspectorFactory.create( name, this ) );
			this.obscure( this.$inspectors );
		}
		return true;
	}
	return false;
};

ve.ui.Context.prototype.addInspector = function ( name, inspector ) {
	if ( name in this.inspectors ) {
		throw new Error( 'Duplicate inspector error. Previous registration with the same name: ' + name );
	}
	inspector.$.hide();
	this.inspectors[name] = inspector;
	this.frameView.$.append( inspector.$ );
};

ve.ui.Context.prototype.openInspector = function ( name ) {
	if ( !this.initInspector( name ) ) {
		throw new Error( 'Missing inspector. Can not open nonexistent inspector: ' + name );
	}
	// Close menu
	if ( this.menuView ) {
		this.obscure( this.$menu );
	}
	// Fade in context if menu is closed.
	// At this point, menuView could be undefined or not open.
	if ( this.menuView === undefined || !this.menuView.isOpen() ) {
		this.$.fadeIn( 'fast' );
	}
	// Open the inspector by name.
	this.inspectors[name].open();
	// Resize frame to the size of the inspector.
	this.resizeFrame( this.inspectors[name] );
	// Save name of inspector open.
	this.inspector = name;
	// Set inspector
	this.set();
};

ve.ui.Context.prototype.closeInspector = function ( accept ) {
	if ( this.inspector ) {
		this.obscure( this.$inspectors );
		this.inspectors[this.inspector].close( accept );
		this.inspector = null;
		this.close();
	}
	this.update();
};

// Currently sizes to dimensions of specified inspector.
ve.ui.Context.prototype.resizeFrame = function ( inspector ) {
	var width = inspector.$.outerWidth(),
		height = inspector.$.outerHeight();
	this.frameView.$frame.css( {
		'width': width,
		'height': height
	} );
};

ve.ui.Context.prototype.getSurface = function () {
	return this.surface;
};

/* Events */

ve.ui.Context.prototype.onDocumentFocus = function () {
	$( window ).on( 'resize.ve-ui-context scroll.ve-ui-context',
		ve.bind( this.set, this ) );
};

ve.ui.Context.prototype.onDocumentBlur = function () {
	if ( !this.inspector ) {
		$( window ).off( 'resize.ve-ui-context scroll.ve-ui-context' );
	}
};

function LayerController(){

    var editor = null;

    var _view  = new LayerEditorView(this);

    var _pCtrl = null;
        
    Template.getInstanz().addObserver( this );

    this.setParent = function (parent) {
        _pCtrl = parent;
    }

    this.init = function(){
        /** 
         * wenn die Editor Display Fläche zuerst sichtbar gemacht wird 
         * bekommt er Probleme das kann aber daran liegen das er das 
         * die Flächen im Layout später hinzugefügt werden
         */ 
        var selected = Template.getInstanz().getSelected();
        
        if(selected >= 0) { 
            this.markElement( selected );
        }
        
        this.displayFrame();
    }
    
    /** 
     * Frame anzeigen
     */ 
    this.displayFrame = function () {    
        var frame = _view.getFrame();
        
        if( !frame.inDocument() ) {
            _pCtrl.addFrame( frame );
            frame.setVisible( true );
        }
    };

    this.handleEvent = function ( ae ){
        _pCtrl.handleEvent( ae );
    }

    /**
    * Ebene wurde modifiziert Callback von AbstractEditor
    * demnach wurde nur der Tree modifiziert und danach
    * wird es an das Template Controller weiter geleitet um
    * alle Änderungen am Template vorzunehmen
    * @access public
    */
    this.templateChanged = function( mod ){
        
        var ae = new ActionEvent( ActionEvent.TEMPLATE_EVENT );
            ae.setMessage('changed');
            ae.addParam( mod );
			
        _pCtrl.handleEvent(ae);
    };
	
    /**
     * ein neues Template wurde geladen
     * Observer Funktion wird aufgerufen von Template Model
     */
    this.update = function(){
        _view.reset();
    };

    /* an der View hat sich was geändert ein Update kommt hier rein
     * aufgerufen durch Template.class.js
     */
    this.updateView = function(){}

    /**
     * callBack funktion von der Template Klasse
     * wenn eine Fläche selektiert wurde
     */
    this.markElement = function ( selectedLayer ) {
        var node = Tree.getInstanz().getNode( selectedLayer );

        if( !node.isLeaf() ) {
        
            _view.clear();
            _view.setBaseLayer( node );

            editor = LayoutEditorFactory.createLayoutEditor( selectedLayer );

            if( editor ) {
                editor.getModel().addObserver( this );
                editor.getModel().setBaseLayer( node );
                _view.addEditor ( editor );
            }
        }
    }
	
    this.handleEvent = function ( ae ) {
        if(ae.isLayerEditorEvent()) {
        } else {
            _pCtrl.handleEvent( ae );
        }
		
    }

};
function TemplateController() {

    var self   = this;
    var _model = Template.getInstanz();
    var _pctrl = null;
    
    var _docView = null;
    var _layView = null;
    var _navView = null;
    
    function stopEvent(e) {
        if(e.stopPropagation) e.stopPropagation();
        else                  e.cancelBubble = true;
        
        if(e.preventDefault)  e.preventDefault();
        else                  e.returnValue = false;
    };
    
    function loadTemplate(template){
        _model.loadTemplate( template );
    };
	
    function templateLayerChanged(mod){
        _docView.updateView( _model.getSelected() , mod);
        _layView.updateView( _model.getSelected() , mod);
        _navView.updateView( _model.getSelected() , mod);
    };
    
    function selectElement(layerKey){
        _model.selectLayer(layerKey);
    };
        
    this.setParent = function(parentCtrl){
        _pctrl = parentCtrl;
    };
    
    this.init = function(){        
        _docView = new DocumentView(this,_model);
        _navView = new Navigator(this,_model);
        _layView = new LayerOverview(this,_model);
        
        _pctrl.addPanel( _docView.getPanel(), 'doc');
        _pctrl.addPanel( _navView.getPanel(), 'navigator');
        _pctrl.addFrame( _layView.getFrame() );
    };
    
    this.handleEvent = function(ae){
        if( ae.isTemplateEvent() ) {
            // template laden
            switch( ae.getMessage() ) {
                case 'loadtpl':
                    loadTemplate  ( ae.getParam()[0] );
                    break;
                case 'select':
                    selectElement ( ae.getParam()[0] );
                    break;
                case 'add_image':
                    _model.addImage(ae.getParam()[0],ae.getParam()[1],ae.getParam()[2]);

                    var _ae = new ActionEvent(ActionEvent.DRAGDROP_EVENT);
                    _ae.setMessage('update');
                    _ae.addParam( ae.getParam()[1].id );

                    if(ae.getParam()[2].getAttribute('pointer') )
                        _ae.addParam( ae.getParam()[2].id );

                    self.handleEvent(_ae);
                    break;
                /**
                 * Knoten wird gelöscht
                 */
                case 'delete':
                    _model.deleteNode(ae.getParam()[0]);
                    break;
                case 'changed':
                    _model.changeTemplate(ae.getParam()[0]);
                    break;
                case 'editor_loaded':
                    _docView.check();
            }
        } else 
            _pctrl.handleEvent(ae);
            
    };
};
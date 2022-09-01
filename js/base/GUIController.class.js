// GUI Frame Controller
function GUIController(){

    var _view  = null;
    var _model = null;
    
    var self  = this;
    
    var _tpl_ctrl  = null;
    var _file_ctrl = null;
    
    var dd_ctrl    = new DragDropController();
        dd_ctrl.setParent(this);
    
    function addChildController(controller) {
        controller.setParent( self );
        controller.init();
    };
    
    this.setParent = function (parentController) {
        _parentCtrl = parentController;
    }
    
    this.addController = function( controller ){
        addChildController ( controller );
    }
    
    this.init = function () {

        addChildController( (_tpl_ctrl  = new TemplateController() ) );
        addChildController( (_file_ctrl = new FileController() ) );
        
        _model = new GUIModel();
        
        _view.setController(self);
        _view.setModel(_model);
        
        _view.init();
    };

    this.setView = function (view){
        _view  = new GUIFrame(view);
        _view.setController ( self );
    };
    
    this.addPanel = function(p,r) {
        _view.addPanel(p,r)
    };
    
    this.addFrame = function(f){
        _view.addFrame(f);
    };
    
    this.handleEvent = function (ae) {
    
        // TemplateEvent weiter reichen an den Template Controller
        if( ae.isTemplateEvent() ) {
        
            _tpl_ctrl.handleEvent(ae);
        
        } else if( ae.isFileEvent() ) {
        
            _file_ctrl.handleEvent(ae);
            
        } else if ( ae.isDragDropEvent() ) {
        
            dd_ctrl.handleEvent( ae);
        
        } else {
            switch( ae.getMessage() ) {
                case 'addframe':
                    this.addFrame( ae.getParam()[0] );
                    break;
                case 'editor_loaded':
                    _view.check();
                    break;
            }
        }
    };
};

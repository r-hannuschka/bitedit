// File Controller
function FileController(){

    var self  = this;
    
    var _parentCtrl = null;
    
    var _model   = new File();
    var _view    = new FileView(this,_model);

    this.setParent = function (parentController) {
        _parentCtrl = parentController;
    };
    
    this.init = function() {
        _parentCtrl.addPanel( _view.getPanel() , 'file');
    };
    
    this.handleEvent = function (ae) {
        if( ae.isFileEvent() ) {            
            switch(ae.getMessage()) {
                case 'loadXML':
                    _model.loadTemplateFiles();
                    break;
                case 'loadImg':
                    var pm = new PreloaderModel();
                        pm.addObserver( new PreloaderView() );
                        pm.addToQueue( _model.getImageFiles(), PreloaderModel.IMAGE_FILES );
                        pm.onReady(function(){
                            _view.displayImages(this.loadedFiles);
                            
                            // Bilder wurden geladen Drag Drop initialisieren
                            var ae = new ActionEvent(ActionEvent.DRAGDROP_EVENT);
                            ae.setMessage('init');
                            ae.addParam('file');
                            ae.addParam( [_view.getImagePanel().getComponent()] );
                            
                            self.handleEvent(ae);
                        });
                        
                        pm.initQueue();
                    break;
            }
        } else {
            _parentCtrl.handleEvent(ae);
        };
    };
};
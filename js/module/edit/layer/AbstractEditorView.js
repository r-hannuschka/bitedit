function AbstractEditorView( model ){

    var _model = model;

    this.save = function () {
    
        if( _model.isDummySet() ) {
            // Ebenen konvertieren 
            _model.prepareBaseLayer();
        }    

        _model.prepareBaseValues();
        
        _model.setChanges();
    }

    this.prepareView = function(){
        return new BitPanel();
    }

    this.getModel = function () {
        return _model;
    }
    
}
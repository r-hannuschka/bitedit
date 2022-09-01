function TextEditorController(){

    var _pctrl = null;

    var model = null;

    var view  = null;


    this.setParent = function(parent){
        _pctrl = parent;
    }

    this.init = function(){
        if( !model && !view ) {
            model = new TextEditor();
            model.addObserver(this);
            view  = new TextEditorFrame(this, model);
        }

        _pctrl.addFrame( view.getFrame() );
    }

    this.editorLoaded = function() {
        var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
            ae.setMessage("editor_loaded")

        _pctrl.handleEvent(ae);
    }
    
    this.editorFinished = function( modification ) {
        
        var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
            ae.setMessage("changed");
            ae.addParam( modification );
            
        _pctrl.handleEvent(ae); 
    }

    this.handleEvent = function (ae) {
    }
}
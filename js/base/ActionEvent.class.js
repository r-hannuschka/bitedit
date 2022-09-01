function ActionEvent(et){

    var msg = "";
    var event_type = et;
    var param = [];
    
    this.setMessage = function (msg) {
        _msg = msg;
    }
    
    this.getMessage = function (){
        return _msg;
    };
    
    this.addParam = function(p){
        param.push(p)
    };
    
    this.getParam = function(){
        return param;
    };
    
    this.isTemplateEvent = function () {
        
        if(event_type == 'event_template') 
            return true;
        else 
            return false;
            
    };
    
    this.isLoaderEvent = function(){
        if(event_type == 'event_loader')
            return true;
        else 
            return false;
    };
    
    this.isLayerEvent = function () {
        if(event_type == 'event_layer')
            return true;
        else 
            return false;
    };
    
    this.isFileEvent = function(){
        if(event_type == 'event_file')
            return true;
        else 
            return false;
    }
    
    this.isDragDropEvent = function () {
        if(event_type == 'event_dragdrop')
            return true;
        else 
            return false;
    }
	
    this.isLayerEditorEvent = function () {
		
        if(event_type == 'event_layer_editor')
            return true;
        else
            return false;
			
    }

    this.isImageEditorEvent = function(){
        if(event_type == 'event_image_editor')
            return true;
        else
            return false;
    }

};

ActionEvent.FILE_EVENT     = 'event_file';
ActionEvent.TEMPLATE_EVENT = 'event_template';
ActionEvent.LAYER_EVENT    = 'event_layer';
ActionEvent.LOADER_EVENT   = 'event_loader';
ActionEvent.DRAGDROP_EVENT = 'event_dragdrop';
ActionEvent.LAYEREDITOR_EVENT = "event_layer_editor";
ActionEvent.IMAGEEDITOR_EVNET = "event_image_editor";
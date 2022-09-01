function PreloaderController(model,view){

    var _model = model;

    this.setView = function(){
    };
    
    this.addFilesToQueue = function(files,mask){
        _model.addFilesToQueue(files,mask)
    };
    
};
function ImportExportController(){
    
    var pctrl = null;

    var display = null;

    this.setParent = function( ctrl ){
        pctrl = ctrl;
    }

    this.init = function(){
        if( !display ) {
            display = new ImportExportWindow( this );
        }
        
        display.init();
    }

    this.handleEvent = function( ae ){
        pctrl.handleEvent(ae);
    }
}
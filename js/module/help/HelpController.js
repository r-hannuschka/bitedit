function HelpController(){

    var pctrl = null;

    var display = null;

    this.setParent = function( ctrl ){
        pctrl = ctrl;
    }

    this.init = function(){
    
        if( !display ) {
            display = new HelpWindow( this );
        }
        
        display.init();
    }

    this.handleEvent = function( ae ){
        pctrl.handleEvent(ae);
    }

}
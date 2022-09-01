function ImageEditController () {

    var _pctrl = null;

    var view = null;

    var self = this;

    function createWindow(){
        if(!view) {
            view = new ImageWindow();
        }

        if( !view.getFrame().inDocument() ) {
        
            var ae = new ActionEvent();
                ae.setMessage("addframe");
                ae.addParam( view.getFrame() );

            self.handleEvent( ae );

            view.getFrame().setVisible(true);
            
            if ( Template.getInstanz().getSelected() !== -1 )
                view.markElement( Template.getInstanz().getSelected() );
        }
    }

    this.setParent = function( ctrl ){
        _pctrl = ctrl;
    }

    /**
     * Einstiegspunkt wird vom Eltern Controller aufgerufen
     * js/base/GUIController.class.js
     */
    this.init = function(){
        createWindow();
    }

    this.handleEvent = function( ae ){
        if( ae.isImageEditorEvent() ) {
        } else {
            _pctrl.handleEvent( ae );
        }
    }
}
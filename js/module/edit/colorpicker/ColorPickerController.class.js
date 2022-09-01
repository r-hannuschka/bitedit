function ColorPickerController(){
    
    var _pcon = null;
    
    var view  = null;
    
    this.setParent = function ( parent ) {
        _pcon = parent;
    }
    
    this.init = function () {
    
        if( view && view.getWindow().inDocument() ) {
            return false; 
        } else {
            view = new Colorpicker( new WebColors() );
            view.getWindow().setPosition(300,100);
            view.onSelectColor(function( color ){
                var layer =  Tree.getInstanz().getNode( Template.getInstanz().getSelected() );
                    layer.setBackground(color);
                    layer.getLayer().setBackground(color);
                    
                    // nur damit die Färbung gleich übernommen wird
                    // repaint wäre möglich aber würde zu lange dauern 
                    layer.getLayer().getComponent().style.background = color;
            });

            view.show();
         
            var ae = new ActionEvent( null );
                ae.setMessage("addframe");
                ae.addParam(view.getWindow());

            this.handleEvent(ae);
        }
    }
    
    this.handleEvent = function( ae ){
        _pcon.handleEvent ( ae );
    };
}
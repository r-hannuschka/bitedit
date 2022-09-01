function DocumentView(ctrl,model){
    
    var _con  = ctrl;
    
    var _mod  = model;
    
    var panel = new BitScrollPanel();
    
    var _tree = Tree.getInstanz();

    _mod.addObserver(this);

    /**
     * wird aufgerufen vom Model sobald eine Fläche 
     * selektiert wird
     *@access public
     *@param int layer schlüssel
     */
    this.markElement = function(selected, lastselected){};
    
    this.check = function () {
        panel.reload();
    }

    this.update = function(template) {
        panel.removeComponents();
        panel.add( template );
        panel.setVisible(true);
        
        var len = _tree.getArray().length;

        var ae = new ActionEvent(ActionEvent.DRAGDROP_EVENT);
            ae.setMessage('init');
            ae.addParam('template');
        
        var param = [];
    
        for(var i = 0; i < len;i++) {
            
            if( !_tree.getNode(i).isLeaf() ) {
                Element.addEvent(_tree.getNode(i).getLayer().getComponent(),'click',selectElement);
            
                if ( _tree.getNode(i).getLayer().contains().length > 0 )
                    continue;
            
                param.push( _tree.getNode(i).getLayer().getComponent() );                
            }
        }
        
        ae.addParam(param);
        _con.handleEvent(ae);   
    };
	
    function selectElement( evt ){
        var e = evt || window.event;
        var t = e.target || e.srcElement;
		
        Element.stopEvent(e);
        
        var nodeName = null;
        
        do {
            nodeName = t.nodeName.toLowerCase();
            
            if ( t.getAttribute('pointer') && ( nodeName == "div" || nodeName == "img" ) )
                break;
            
            t = t.parentNode;
        } while(t);
        
        var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
            ae.setMessage("select");
            ae.addParam( parseInt( t.getAttribute('pointer'), 10 ) );
                        
        _con.handleEvent(ae);
    }

    this.getPanel = function(){
        panel.setBackground('#fff');
        
        var d = new BitPanel();
        d.setSize(400,1000);
         
        panel.add(d);
        
        return panel;
    };
	
    /**
     * Ebene wurde über den Ebenen Editor Modifziert
     * wird von TemplateController aus aufgerufen
     * @access public
     * @param <int> pointer Zeiger auf die Ebene
     */
    this.updateView = function(pointer, mod) {
    
        var templateChanged = false;

        var addToDragDrop = [];
        
        var removeFromDragDrop = [];

        // Elemente wurden hinzugefügt
        if(mod.added.length > 0) {

            for(var i = 0; i < mod.added.length; i++) {
                if( !mod.added[i].isLeaf() ) {
                    var component = mod.added[i].getLayer().getComponent();

                    Element.addEvent( component, 'click', selectElement);
                    templateChanged = true;

                    addToDragDrop.push(component);
                }
            }
        }

        // Elemente wurden entfernt
        if( mod.removed.length > 0 ) {
            for(var i = 0; i < mod.removed.length; i++) {
                if( !mod.removed[i].isLeaf() ) {
                    templateChanged = true;

                    Element.unlinkEvent(
                        mod.removed[i].getLayer().getComponent(),
                        'click', selectElement
                    );
                    
                    removeFromDragDrop.push( mod.removed[i].getLayer().getComponent() );
                }
                
            }

            if( templateChanged )
                addToDragDrop.push ( _tree.getNode ( pointer ).getLayer().getComponent() );
        }
        
        // das scheint der gar nicht auszuführen
        _tree.getNode( pointer ).getLayer().setVisible( true, true );
        
        panel.reload();

        /* Drag und Drop updaten
        */
        if(templateChanged) {
            if(addToDragDrop.length > 0) {

                /* Drag Drop updaten auch wenn der DragDrop Controller noch
                 * sehr skuril ist in meinen Augen
                 */
                var ae = new ActionEvent(ActionEvent.DRAGDROP_EVENT);
                    ae.setMessage( "refreshContainer" );
                    ae.addParam( _tree.getNode(pointer).getLayer().getComponent() );
                    ae.addParam( addToDragDrop );

                _con.handleEvent(ae);
            }
        }
    };
};

function Navigator(ctrl,model){

    var _con  = ctrl;

    var _mod  = model;
    
    var _tree = Tree.getInstanz();

    var panel = new BitScrollPanel();
    
    _mod.addObserver(this);
    
    var template = null;
	
    this.getPanel = function(){
        
        panel.setBackground('#fff');
        panel.setMinSize ( 100 , 100 );
        panel.setSize    ( 100 , 200 );
        panel.setMaxSize ( 100 , 300 );
        
        return panel;
    };
           
    function selectElement(evt){
        var e = evt || window.event;
        var t = e.target || e.srcElement;
					
        Element.stopEvent(e);
					
        var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
        ae.setMessage("select");
        ae.addParam( t.getAttribute("pointer") );
                    
        _con.handleEvent(ae);
    }

    this.update = function() {

        template = _mod.getClonedTemplate();
        template.setSize(200,300);

        panel.removeComponents();
        panel.add( template );
        panel.setVisible(true);

        var len = _tree.getArray().length;

        for(var i = 0 ; i < len;i++) {  
            
            if ( _tree.getNode(i).isLeaf() ) continue; 
            
            (function(){
                var key = i;
                
                var clonedNode = _tree.getNode(i).getClonedLayer();
                    clonedNode.getComponent().setAttribute("pointer",_tree.getNode(i).getPointer() );
                    clonedNode.getComponent().style.cursor = 'pointer';
                
                Element.addEvent(clonedNode.getComponent(),'click',selectElement );
            })();
        }
    };

    this.markElement = function (selected, lastSelected ){

        if(lastSelected > -1) {
            var last = _tree.getNode( lastSelected );

            if( !last.isLeaf() ) {
                var color = last.getLayer().getBackground();

                last.getClonedLayer().setBackground(color);
                last.getClonedLayer().setVisible(true);
            }
        }

        var selected = _tree.getNode( selected );

        if( !selected.isLeaf() ) {
            selected.getClonedLayer().setBackground('#5f5');
            selected.getClonedLayer().setVisible(true);
        }
        
    };
	
    this.updateView = function( pointer , mod ){
        
        var root = _tree.getNode( pointer );
            root.getClonedLayer().setVisible(true);

        try {
        if( mod.added.length > 0) {
            for(var i = 0 ; i < mod.added.length; i++) {
				
                var layer = mod.added[i].getClonedLayer();
                layer.getComponent().setAttribute("pointer", mod.added[i].getPointer() );
					
                Element.addEvent( layer.getComponent(), "click", selectElement );
            }
        }
		
        if( mod.removed.length > 0){}
        } catch (e) {}
        
    }
	
};
function Modificator(){
    
    var modification = {
        added:[],
        moved:[],
        removed:[]
    }
    
    var tree = Tree.getInstanz();
    
    var node = null;
    
    function addNode( cNode, option){
    
        if ( !cNode.isLeaf() ) {
            node.getLayer().add( cNode.getLayer(), option);
            node.getClonedLayer().add( cNode.getClonedLayer(), option);
            
            cNode.getClonedLayer().setSize(30,30);
        } else {
        
            var before = false;
        
            if ( cNode.getComponent().nextSibling ) 
                before = cNode.getComponent().nextSibling;
                    
            if ( before ) {
                cNode.getComponent().parentNode.insertBefore(
                    before, cNode.getComponent() 
                );
            } else {
                node.getLayer().getComponent().appendChild ( cNode.getComponent() );
            }
        }
    }
        
    /**
     *fügt einen Knoten zu modification.added hinzu 
     *@access public 
     *@param <TreeNode> node
     *@param <String> optional zusätzliche Parameter wie center , left ...
     *@return void     
     */
    this.add = function( node, optional) {
        modification.added.push( [node, optional] );
    }
    
    this.remove = function( node ){
        modification.removed.push( node );
    }
    
    this.move = function(){
        modification.moved.push (pointer);
    }    
    
    this.getModification = function(){
        return modification;
    }
    
    this.deleteOperation = function(){ 
        var layers = modification.removed;
       
        for(var i = 0; i < layers.length; i++ ) {
            if( !layers[i].isLeaf() ) {
                node.getLayer().removeComponent( layers[i].getLayer() );
                node.getClonedLayer().removeComponent( layers[i].getClonedLayer() );
            } else  {
                if ( layers[i].getComponent().parentNode )
                    Element.unlink( layers[i].getComponent() );
            }
            Tree.getInstanz().removeTreeNode( layers[i] );
        }
    }
    
    this.addOperation = function(){    
        if(modification.added.length > 0) {
        
            for(var i = 0; i < modification.added.length; i++) {
                var mod = modification.added[i];
                
                addNode( mod[0], mod[1]); 
                node.addChild ( mod[0] ); 
                
                if ( !mod[0].isLeaf() ) {   
                    mod[0].update();
                }               
            }
        }
    }
    
    this.enableModification = function(){
        this.deleteOperation();
        this.addOperation();
    };
    
    this.setNode = function(n){
        node = n;
    }
    
    this.getNode = function(){
        return node;
    }
}

function LayerModificator( node ){

    Modificator.call ( this, node);
    
    var pEnableModification = this.enableModification;
    
    var self = this;
    
    var modification = {
        layout:{
            isNew:false,
            name:null,
            hgap:0,
            vgap:0,
            cols:1,
            rows:1
        },
        padding:"0px",
        size:[-1, -1]
    }
    
    this.setNewLayout = function ( layoutName ) {
        modification.layout.isNew = true;
        modification.layout.name  = layoutName;
    }
    
    this.setGap = function ( hgap, vgap) {
        modification.layout.hgap = parseInt( hgap, 10);
        modification.layout.vgap = parseInt( vgap, 10);
    }
    
    this.setPadding = function ( pad ) {
        modification.padding = pad;
    }
    
    this.setCols = function( cols ){
        modification.layout.cols = parseInt( cols, 10);
    }
    
    this.setRows = function( rows ){
        modification.layout.rows = parseInt( rows, 10);
    }
    
    this.setSize = function(w, h) {
        modification.size[0] = w;
        modification.size[1] = h;
    }
        
    this.setWidth  = function( width ){
        modification.size[0] = width;
    }

    this.setHeight = function( height ){
        modification.size[1] = height; 
    }
    
    /**
     * ändert die Layout Eigenschaften eines Layers
     * @access private
     * @param <Object> mod
     * @return void
     */
    function enableLayoutModifications ( mod ){
        var node = self.getNode();

        // wenn sich das Layout geändert haben sollte
        if( mod.isNew  ) {
            switch( mod.name ) {
                case 'flowlayout':
                    node.getLayer().setLayout( new FlowLayout() );
                    node.getClonedLayer().setLayout( new FlowLayout(1,1) );
                    break;
                case 'borderlayout':
                    node.getLayer().setLayout( new BorderLayout() );
                    node.getClonedLayer().setLayout( new BorderLayout(1,1) );
                    break;
                case 'gridlayout':
                    node.getLayer().setLayout( new GridLayout() );
                    node.getClonedLayer().setLayout( new GridLayout() );
                    break;
            }
        }
        
        // Layout Manager Einstellungen
        var manager = node.getLayer().getLayoutManager();
            manager.setHGap( mod.hgap );
            manager.setVGap( mod.vgap );
            
        if( manager.getName().toLowerCase() == 'gridlayout' ) {

            manager.setCols ( mod.cols );
            manager.setRows ( mod.rows );

            var navManager = node.getClonedLayer().getLayoutManager();
                navManager.setCols( mod.cols );
                navManager.setRows( mod.rows );
                navManager.setHGap(1);
                navManager.setVGap(1);
        }

        // Allgemeine Einstellungen für die Ebene
        node.getLayer().setAttribute("padding", Element.trim(modification.padding) );
    };

    /**
     * ändert die Panel eigenschaften mit den Dimensionen
     * dabei ist wichtig die Größen Änderung im GridLayout
     * oder BorderLayout zu betrachten im Bezug auf das Eltern Element
     */
    function enableSizeModifications() {
        
        var node = self.getNode();
        
        var s = new ScaleLayer( node, modification.size);
        var _tree = Tree.getInstanz();

        if( node.getParent() !== -1 ) {
            var parent = _tree.getNode( node.getParent() );
            do {
                // Eltern Element Layout
                switch ( parent.getLayout().toLowerCase()  ) {
                    case 'borderlayout':
                        s = new ScaleBorderLayout(s, parent);
                        break;
                    case 'gridlayout':
                        s = new ScaleGridLayout(s, parent);
                        break;
                }

                parent = _tree.getNode( parent.getParent() );
            } while( parent );
        }

        // skalierung beginnen
        s.scale();
    }
    
    this.enableModification = function(){
        this.deleteOperation();
    
        enableLayoutModifications( modification.layout );
        enableSizeModifications();
        
        this.addOperation();
        
        modification = {
            layout:{
                isNew:false,
                name:null,
                hgap:0,
                vgap:0,
                cols:1,
                rows:1
            },
            padding:"0px",
            size:[-1, -1]
        }
    }
}

function Modification_Proxy( mod ){
    var modificator = mod ;
    
    function convertModification( modification ){
        var mod = {
            added:[],
            moved:[],
            removed:[]
        }
                
        if( modification.added.length > 0 ) {
            for(var i = 0; i < modification.added.length;i++)
                mod.added.push( modification.added[i][0] );
        }

        modification.added.splice(0, modification.added.length);        
        
        mod.moved = {};
        mod.removed = modification.removed.splice(0, modification.removed.length);
        
        return mod;
    }
    
    this.setModificator = function ( mod ) {
        modificator = mod;
    }
    
    this.enableModification = function () {
        if ( modificator ) {
            modificator.enableModification();            
            return convertModification( modificator.getModification() );
        }
            
        return {
            added:[],
            moved:[],
            removed:[]
        }
    }
}
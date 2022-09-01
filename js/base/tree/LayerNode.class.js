function LayerNode (layer, parseLayer){

    TreeNode.call(this);

    var _tree = Tree.getInstanz();
        _tree.addNode(this);
    
    var _childs  = [];

    var hgap = 0;

    var vgap = 0;
    
    /* der_layer
     */
    var _layer = layer;
        _layer.getComponent().setAttribute( "pointer", this.getPointer() );

    /* das Layouttyp
     */
    var sLayout = null;
    
    /* der_layertyp
     * BitPanel etc 
     */
    var sLayer = "";
    
    /* der geclonte_layer;
     */
    var cloned     = null;
    
    /* Ausrichtung oder wo liege ich
     */
    var direction = null;
    
    var editAble = true;

    var self = this;

    var childOrder = [];
    
    parseLayer();
    
    function deleteChild(pointer) {
        
        for(var i = 0; i < _childs.length;i++) {
            
            if(_childs[i] == pointer) {
                self.removeChildFromOrder( pointer );
                _childs.splice(i,1);
                break;
            }
            
        }
    }; 
    
    function parseLayer(){
        sLayout = _layer.getLayoutManager().getName();
        
        if(sLayout.toLowerCase() == 'borderlayout' || sLayout.toLowerCase() == 'gridlayout')
            editAble = false;
        
        // pattern 
        var cp = /function([^\(]+)/i;
        sLayer = _layer.constructor.toString().match(cp)[1]; 
        
        self.setBackground ( _layer.getBackground() );
        
        var p = _layer.getAttribute("padding");
        for(var key in p){
            self.setPadding( p[key], key );
        }
        
        this.setPadding = function(value, direction ){
            _padding[direction.toLowerCase()] = parseInt( value, 10);
        }
        
        if( _layer.getParentComponent() ){
            var pLayout =_layer.getParentComponent().getLayoutManager();
            
            if(pLayout.getName().toLowerCase() == 'borderlayout') {
                var c =_layer.getParentComponent().getLayoutManager().getLayoutComponents();
                
                for(var key in c) {
                    if(c[key] == _layer) {
                        direction = key;
                        break;
                    }
                }
            }    
        }

        // Observer aufrufen wenn die Ebene fertig geladen wurde
        // damit die Dimension hinterlegt werden kann
        _layer.addObserver(new function() {
            this.ready = function(){
                var dimension = _layer.getDimension().getComponentDimension();
                self.setSize( dimension[0], dimension[1]);
            }
        });

        if ( _layer.getLayoutManager() ) {
            hgap = _layer.getLayoutManager().getHGap();
            vgap = _layer.getLayoutManager().getVGap();
        }
    };
    
    this.addChild = function(layer){
        _childs.push( layer.getPointer() );
        
        if(layer.getParent() != -1) {
            _tree.getNode( layer.getParent() ).removeChild(layer);
        }
        
        layer.setParent( this.getPointer() );
    };

    this.getClonedLayer = function ( refresh ) {    
        if(!cloned || refresh ){
            cloned = layer.clone();
        }
        return cloned;
    };
    
    /**
     *fügt ein Kinder der Reinfolge hinzu , ist für Blattknoten wichtig und den Export
     *damit klar gemacht werden kann in welcher Reinfolge die Kinder kommen
     *@access public
     *@param <int> key
     */
    this.addChildToOrder = function( key){
        childOrder.push(key); 
    };
    
    /**
     *Vertauscht die Kinder Reinfolge
     *@access public
     *@param <int> key
     */
    this.switchChildInOrder = function(key, before){
        this.removeChildFromOrder( key );
        
        if ( before !== -1 ) {
        
            var found = false;
        
            for(var i = 0; i < childOrder.length; i++) {
                if ( childOrder[i] == before ) {
                    childOrder.splice(i, 0, key); 
                    break;
                }
            }
            
        } else {
            // muss an letzter Stelle sein kein previousSibling gefunden
            childOrder.push( key );
        }
    }
    
    /**
     *entfernt ein Kind Element von der Reinfolge da es nicht mehr als 
     *Kind existiert ist das überhaupt notwendig
     */
    this.removeChildFromOrder = function(key){
        for(var i = 0;i < childOrder.length; i++) {
            if ( key == childOrder[i] ) {
                childOrder.splice( i, 1);
                break;
            }
        }        
    };
    
    this.resetChildOrder = function(){
        childOrder = [];
    }
    
    this.getChildOrder = function(){
        return childOrder;
    }

    this.getLayer = function(){
        return _layer;
    };

    this.getPanelType = function () {
        return sLayer;
    };

    this.getLayout = function (){
        return sLayout;
    };

    this.getDirection = function () {
        return direction;
    };
	
    this.isEditAble = function(){
        return editAble;
    };
        
    this.removeChild = function(layer) {
        
        if( (typeof layer).toString() !== "number" )  {
            layer = layer.getPointer();
        }
        
        deleteChild( layer );
    };
    
    this.getChilds = function(){
        return _childs;
    };
    
    this.isLeaf = function (){
        return false;
    };

    this.getLayout = function() {
        return sLayout.toLowerCase();
    };

    this.update = function () {
        parseLayer();
    };
	
    this.clear = function(){
        while ( _childs.length > 0) {
            _tree.removeTreeNode( _tree.getNode( _childs.shift() ) );
        }
    };

    this.getType = function(){
        return "layer";
    }
    
    this.getHGap = function(){
        return hgap;
    }

    this.setHGap = function( value ){
        hgap = parseInt( value, 10);
    };

    this.getVGap = function(){
        return vgap;
    };

    this.setVGap = function( value ){
        vgap = parseInt( value, 10);
    };
    
    this.toJSON = function(){
        var style = this.getStyleValues();
        
        var json = {
            container:{
                type:sLayer,
                attribute:{
                    layout:{
                        type:sLayout,
                        hgap:hgap,
                        vgap:vgap
                    },
                    style:{
                        background:{ 
                            color:self.getBackground() 
                        },
                        size:{ 
                            width:self.getWidth(), 
                            height:self.getHeight()
                        },
                        padding:{ 
                            value:this.paddingToString()
                        }
                    }
                }
            }
        }        
        
        if ( direction ) {
            json.container["direction"] = direction;
        }
    
        if( _childs.length > 0 ){
            if (sLayout.toLowerCase() == "flowlayout") {
                json.container["content"] = {};
            } else {
                json.container["contains"] = {};
            }
        }
        
        if ( sLayout.toLowerCase() == "gridlayout") {
            with ( json.container.attribute ){
                layout["rows"] = _layer.getLayoutManager().getRows();
                layout["cols"] = _layer.getLayoutManager().getCols();
            }
        }  
        
        return json;
    }
    
};
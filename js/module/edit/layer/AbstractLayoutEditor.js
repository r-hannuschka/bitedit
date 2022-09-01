function AbstractLayoutEditor( layer ){

    BaseModel.call(this);

    this._layer = layer;

    var tree   = Tree.getInstanz();

    this.setComponents = function(){};

    var layerChilds = [];

    var leafChilds  = [];

    var childsParsed = false;
    
    var baseLayer = null;
    
    var bLayer = false;

    var modificator = new LayerModificator();
            
    this.dummySet = function ( dummy ) {
        bLayer = dummy;
    }
    
    this.isDummySet = function(){
        if(bLayer) 
            return true;
        
        return false;
    }

    this.prepareBaseLayer = function(){
    
        /* die Knoten die gelöscht werden sollen in modification.removed
         * speichern da diese nicht mehr benötigt werden
         */         
        for(var i = 0 ; i < baseLayer.getChilds().length; i++) {
            modificator.remove( tree.getNode( baseLayer.getChilds()[i] ) );
        }
        
        modificator.setNewLayout( this._layer.getLayout().toLowerCase() );
        
        this._layer = baseLayer;
        bLayer = null;
    };
    
    this.setBaseLayer = function( layer ){
        baseLayer = layer;
    }

    /* Basis Eigenschaften erstellen für die Ebene
     * wie padding , hgap , vgap etc ...
     * @access public
     * @return void 
     */
    this.prepareBaseValues = function (){
    
        modificator.setNode( this._layer );
    
        // padding zu einen String konvertieren
        var padding  = this._layer.getPadding();
                
        var sPadding = "";

        for(var key in padding) {
            sPadding += padding[key]+"px ";
        }
        
        modificator.setGap( this._layer.getHGap(), this._layer.getVGap() );
        modificator.setPadding( sPadding );
    };

    this.parseChilds = function (){
    
        if(!childsParsed ) {
            var childs = this._layer.getChilds();
            var length = childs.length;

            for(var i = 0 ; i < length; i++ ) {
                if( !tree.getNode( childs[i] ).isLeaf() ) {
                    layerChilds.push( childs[i] );
                } else {
                    leafChilds.push ( childs[i] );
                }
            }
            childsParsed = true;
        }
        return this;
    };

    this.removeLeafs = function () {
        for(var i = 0 ; i < leafChilds.length; i++ ){
            this.remove( leafChilds[i] );
        }
    };

    this.getLayerChilds = function () {
    
        if( ! childsParsed ) {
            this.parseChilds();
        }
        
        return layerChilds;
    };

    this.getLeafChilds = function (){
        if(! childsParsed )
            this.parseChilds();

        return leafChilds;
    };

    this.setSize   = function( width, height){
        modificator.setSize( parseInt( width, 10), parseInt( height, 10) );
    }

    this.setWidth  = function( width ){
        modificator.setWidth( parseInt( width, 10) );
    }

    this.setHeight = function( height ){
        modificator.setHeight( parseInt( height, 10) );
    }
    
    this.getBaseLayer = function(){
        return baseLayer;
    };
    
    /**
     *fügt einen Knoten zu modification.added hinzu 
     *@access public 
     *@param <TreeNode> node
     *@param <String> optional zusätzliche Parameter wie center , left ...
     *@return void     
     */
    this.add = function( node, optional ){
        modificator.add ( node, optional );
    };
    
    /**
     */ 
    this.remove = function( node ){
        modificator.remove ( node );
    };

    this.getName = function(){
        return "";
    };

    this.clearModification = function (){
        childsParsed = false;
    };
    
    this.getModificator = function(){
        return modificator;
    }
};
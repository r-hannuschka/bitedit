function Scale (){
}

Scale.getLastScaled = function(){
    return Scale.lastScaled;
}

Scale.setLastScaled = function( layer ){
    Scale.lastScaled = layer;
}

// statische Funktion in JavaScript
// sieht echt finster aus
Scale.scaleWidthAvailable = function( layer ){

    var canScale = false;

    // proof scale in width available
    if(layer.getParent() !== -1 ) {
        var parent   = Tree.getInstanz().getNode( layer.getParent() );

        do {
            if( parent.getLayout().toLowerCase() == "borderlayout" ) {
                if( /(we|ea)st/i.test( layer.getDirection().toLowerCase() ) ) {
                    canScale = true;
                    break;
                }
            }

            layer  = parent;
            parent = Tree.getInstanz().getNode( parent.getParent() );

        } while ( parent );
    }

    return canScale;
}

// direkt Ebenen skalieren
function ScaleLayer ( currentLayer, dimension ){

    Scale.call ( this );
    
    function getHeight(){
        return dimension[1];
    }

    function getWidth(){
        if ( Scale.scaleWidthAvailable( currentLayer ) ) {
            return dimension[0];
        } else {
            return currentLayer.getWidth();
        }
    }

    this.scale = function(){

        Scale.setLastScaled( currentLayer );

        var width  = getWidth();
        var height = getHeight();

        currentLayer.setSize( width, height);            // TreeNode anpassen
        currentLayer.getLayer().setSize( width, height); // Panel anpassen
        
        return [width, height];
    }
}

// BorderLayout skalieren
function ScaleBorderLayout( ScaleObject, currentLayer){

    Scale.call ( this );

    var layer = currentLayer;

    function getHeight( childs ){

        var centerHeightSet = false;

        var height = 0;

        for(var i = 0; i < childs.length; i++) {
            var child = Tree.getInstanz().getNode ( childs[i] );

            switch ( child.getDirection().toLowerCase() ){
                case 'north': case 'south':
                    height += (child.getHeight() + layer.getVGap() );
                    break;
                 default:
                     if( !centerHeightSet ) {
                        height += child.getHeight();
                        centerHeightSet = true;
                     }
                     continue;
            }
        }

        return height;
    }

    function getWidth(){
        return layer.getWidth();
    }

    function scaleCenterPanes( height ){
        var childs = layer.getChilds();

        for (var i = 0; i < childs.length; i++ ) {
            var child     = Tree.getInstanz().getNode( childs[i] );
            var direction = child.getDirection().toLowerCase();

            if( direction == "west" || direction == "east" || direction == "center") {
                child.setHeight( height );
                child.setSize( child.getWidth(), height );
            }
            
        }
    }

    function scaleLayer( dimension ){

        // alle Flächen erstmal anpassen wie Ost, Zentrum und Westen
        var direction = Scale.getLastScaled().getDirection().toLowerCase();

        if( direction == "center" || direction == "east" || direction == "west" ) {
            scaleCenterPanes( dimension[1] );
        }

        var childs = layer.getChilds();

        var height = getHeight( childs );
        var width  = getWidth();

        height += layer.getPadding().top  + layer.getPadding().bottom;

        // write new Dimension to Panel Object
        layer.getLayer().setSize(width, height);
        layer.setSize( width, height);

        Scale.setLastScaled( layer );

        return [width, height];
    };

    this.scale = function(){
        var new_dim = ScaleObject.scale();

        // setzt Höhe und Weite neu Fest
        return scaleLayer( new_dim );
    };
    
};

// GridLayout skalieren
function ScaleGridLayout( ScaleObject, currentLayer ){
    
    Scale.call ( this );

    var layer = currentLayer;

    function getHeight(h){
        var rows = layer.getLayer().getLayoutManager().getRows();
        h *= (rows > 0)?rows:1;

        // add vGap
        h += (rows > 0?(rows - 1):0) * layer.getVGap();

        // add top and bottom padding
        h += layer.getPadding().top + layer.getPadding().bottom;

        return h;
    };

    function getWidth(w){
        if( Scale.scaleWidthAvailable( layer ) ) {
            var cols = layer.getLayer().getLayoutManager().getCols();
            w *= ( cols > 0 )?cols:1;

            //add hGap
            w += ((cols >0)?cols-1:0) * layer.getHGap();

            // add left and right padding
            w += layer.getPadding().right + layer.getPadding().left;

            return w;
        } else
            return layer.getWidth();
    }

    function scaleLayer( dimension ){
        dimension[0] = getWidth ( dimension[0] );
        dimension[1] = getHeight( dimension[1] );

        // write new Dimension to Panel Object
        layer.getLayer().setSize( dimension[0], dimension[1] );
        layer.setSize( dimension[0], dimension[1] );

        Scale.setLastScaled ( layer );

        return dimension;
    };
    
    this.scale = function(){
        var new_dim = ScaleObject.scale();
        // setzt Höhe und Weite neu Fest
        return scaleLayer( new_dim );
    };
};
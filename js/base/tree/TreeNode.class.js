function TreeNode(){

    var _name    = "";

    var _pointer = -1;

    var _parent  = -1;

    var _margin  = { top:0, right:0, bottom:0, left:0 };

    var _padding = { top:0, right:0, bottom:0, left:0 };

    var _size    = [0, 0];

    var _border  = [0, 'solid', '#000'];
    
    var _background = '#000';

    this.setPointer = function(p){
        _pointer = p;
    };
    
    this.getPointer = function(){
        return _pointer;
    };
    
    this.setParent = function(p){
        _parent = p;
    };
    
    this.getParent = function(){
        return _parent;
    };

    this.setBackground = function( color ) {
        _background = color;
    };
    
    this.getBackground = function(){
        return _background || "#3D3D3D";
    };
    
    /**
     *setzt einen Namen für den Knoten
     *@access public
     *@param <String> nodeName
     *@return void
     */
    this.setNodeName = function(nodeName){
        _name = nodeName || "Ebene "+_pointer;
    };

    /**
     *gibt den Namen für den Knoten zurück
     *@access public
     *@return <String> _name
     */
    this.getNodeName = function(){
        return _name;
    };

    this.parseTreeNode = function(){
    }

    this.setMargin  = function( value, direction ){
        _margin[direction.toLowerCase()] = value;
    }
    
    this.getMargin  = function(){
        return _margin;
    }

    this.setPadding = function(value, direction ){
        _padding[direction.toLowerCase()] = parseInt( value, 10);
    }
    
    this.getPadding = function(){
        return _padding;
    }
    
    this.paddingToString = function ( ){
        var i = 0; 
        var r = "";
    
        for(var key in _padding ) {
            if ( i > 0) r +=" ";                
            r += _padding[key]+"px";            
            i++;
        }
        
        return r;
    }
    
    this.marginToString = function(){        
        var i = 0; 
        var r = "";
    
        for(var key in _margin ) {
            if ( i > 0) r +=" ";                
            r += _margin[key]+"px";            
            i++;
        }
        
        return r;
    }

    this.setSize = function( width, height){
        _size = [ parseInt(width, 10) , parseInt(height, 10) ];
    }

    this.setWidth = function( width ) {
        _size[0] = parseInt(width, 10) ;
    }

    this.setHeight = function( height ){
        _size[1] = parseInt(height, 10);
    }
    
    this.getWidth = function(){
        return _size[0];
    }

    this.getHeight = function(){
        return _size[1];
    }

    this.getSize = function(){
        return {
            width:_size[0],
            height:_size[1]
        }
    }

    this.setBorder = function ( width, style, color){
        _border[0] = width;
        _border[1] = style;
        _border[2] = color;
    }
    
    this.getBorder = function(){
        return {
            width:_border[0],
            style:_border[1],
            color:_border[2]
        };
    }

    this.getStyleValues = function(){
        return {
            width:_size[0]+"px",
            height:_size[1]+"px",
            padding:this.getPadding(),
            margin:this.getMargin(),
            border:this.getBorder()
        }
    }
    
    this.toJSON = function(){
        return {};
    }
};
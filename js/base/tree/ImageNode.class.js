function ImageNode ( img ){
    
    TreeNode.call(this);

    var _tree = Tree.getInstanz();
        _tree.addNode(this);
    
    var _img = null;

    var _src = "";
    
    var self = this;

    var _title = "";

    var _altText = "";

    var _float   = "none";
    
    (function(){
        var pattern = /[^\/]+(?:jpg|png|gif)$/i;

        _img = img.cloneNode( true );
        
        if ( /_thumb/.test( img.src )  ) {
            // ersetzt thumb durch original pfad 
            _src     = img.src.match(pattern)[0].replace(/_thumb/,'');
            _img.src = "files/bilder/"+_src;            
        } 
        
        _img.setAttribute( "pointer" , self.getPointer() );    
        
        if( img.parentNode ) {
            img.parentNode.insertBefore(_img,img);
            img.parentNode.removeChild(img);
            img = null;
        }

        _img.onload = function (){
            self.setSize( _img.width, _img.height);
        }
        
    })();
    
    this.isLeaf = function(){
        return true;
    };

    this.getComponent = function(){
        return _img;
    };

    this.setFloat = function( css_float ){
        _float = (css_float != "left" && css_float != 'right')?'none':css_float;
    }
    
    this.getFloat = function (){
        return _float;
    }

    this.setAltText = function( alternateText ) {
        _altText = (alternateText.match(/^[a-z0-9\s,]+$/i) )?alternateText:"";
    }

    this.getAltText = function() {
        return _altText;
    }

    this.setTitle = function( title ){
        _title = (title.match(/^[a-c0-9\s,]+$/i))?title:"";
    }

    this.getTitle = function(){
        return _title;
    }

    this.getStyleValues = function (){
        return {
            width:self.getSize().width+"px",
            height:self.getSize().height+"px",
            padding:self.getPadding(),
            margin:self.getMargin(),
            border:self.getBorder(),
            cssFloat:self.getFloat()
        }
    };
    
    this.getImage = function(){
        return _img.src;
    }
    
    this.getType = function(){
        return "image";
    }
    
    this.toJSON = function(){
        var style = this.getStyleValues();
        return {
            type:"image",
            img:{
                src:_img.src,
                title:_title,
                alt:_altText,
                style:{
                    width:{
                        value:self.getWidth(),
                        height:self.getHeight()
                    },
                    padding:{
                        value:self.paddingToString()                    
                    },
                    margin:{
                        value:self.marginToString()
                    }
                }
            }
        }
    }
};
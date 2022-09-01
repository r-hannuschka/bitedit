var Template = (function(){

    var instanz = null;

    function Template(){
        // erbt von BaseModel
        BaseModel.call(this);

        var self = this;

        var loadedTemplate = null;

        var cloned         = false;

        var _tree          = Tree.getInstanz();

        var selectedLayer  = -1;
        
        var lastSelected   = -1;

        var _clonedTemplate = null;

        /**
        * @access private
        * @param <Array> layers
        */
        function deleteLayers ( layers ) {
            var deleted = [];

            for(var i = 0; i < layers.length; i++ ) {

                if( layers[i] == selectedLayer )
                    selectedLayer = -1;

                var nodeToDelete = _tree.getNode( layers[i] );

                if( !nodeToDelete.isLeaf() ) {
                    var parent = _tree.getNode( nodeToDelete.getParent() );

                    parent.getLayer().removeComponent( nodeToDelete.getLayer() );
                    parent.getClonedLayer().removeComponent( nodeToDelete.getClonedLayer () );

                    if( !_tree.getNode(selectedLayer) ) {
                        selectedLayer = -1;
                        lastSelected  = -1;
                    }
                    
                } else  {
                    Element.unlink( nodeToDelete.getComponent() );
                }

                _tree.removeTreeNode( nodeToDelete );

                deleted.push( nodeToDelete );
            }

            return deleted;
        };

        /**
         *prüft ob ein Knoten gelöscht werden darf , dies ist nicht der Fall
         *bei einer Zentrums fläche sofern noch andere Flächen existieren.
         *@access public
         *@param <int> node
         *@return boolean
         */
        this.checkNodeDelete = function(node) {

            var _node = _tree.getNode(node);

            if( !_node.isLeaf() ) {
                if( _node.getParent() > -1 ) {
                    var parentNode = _tree.getNode( _node.getParent() );

                    if(parentNode.getChilds().length > 1) {
                        /*
                         * falls es ein BorderLayout ist
                         * und noch andere Kinder hat außer das Zentrum
                         */
                        var layout = parentNode.getLayout().toLowerCase();
                        var node_d = _node.getDirection();

                        if( (  layout == "borderlayout" &&  node_d && node_d.toLowerCase() == "center") 
                            || layout == "gridlayout" )
                            return false;
                    }
                }
            }
            
            return true;
        };

        /**
         * laden alle Layer und Sublayer
         *@access private
         *@param <BitPanel> lay
         */
        function loadAllLayers(lay, parse ) {
            var counter = lay.contains().length;

            var _subRoot = new LayerNode(lay, parse);

            for(var i = 0; i < counter;i++) {
                
                if(lay.contains()[i].contains().length > 0)
                    _subRoot.addChild( loadAllLayers(lay.contains()[i], false ) );
                else {
                    var layer = new LayerNode( lay.contains()[i] );
                    
                    if ( lay.contains()[i].getHtmlContent() ) {
                        loadImages( lay.contains()[i].getComponent(), layer );
                    }
                    
                    _subRoot.addChild( layer );
                }  
            }
            return _subRoot;
        };
        
        function loadImages(node, layer){
            
            var childs = node.childNodes;
            var cNode  = null;
            
            for ( var i = 0 ; i < childs.length; i++ ) {
                    
                if ( childs[i].nodeName.toLowerCase() == "img") {
                    cNode = new ImageNode( childs[i] );
                } else {                    
                    cNode = new HTMLNode( childs[i] );
                }
                
                layer.addChild( cNode );
                layer.addChildToOrder( cNode.getPointer() );
            }
        };

        /**
         * ein Template clonen
         *@access private
         *@return cloned Template
         */
        function cloneTemplate() {
            var pl = null; // parent layer
            var cl = null; // current layer

            // das Template komplett clonen diese
            // Aufgabe übernimmt BitGUI
            var clone = _tree.getNode(0).getLayer().clone();
			
            for(var i = 0 ; i < _tree.getArray().length;i++) {
                if(_tree.getNode(i).getParent() > -1) {

                    pl = _tree.getNode( _tree.getNode(i).getParent() );
                    cl = _tree.getNode(i);

                    if(pl.getLayout().toLowerCase() == "borderlayout" ) {
                        var layerDir = cl.getDirection().toLowerCase();

                        if(layerDir == "north" || layerDir == "south")
                            cl.getClonedLayer().setSize(20,30);

                        if (layerDir == "west" || layerDir == "east")
                            cl.getClonedLayer().setSize(30,20);
                    }

                    pl.getClonedLayer().getLayoutManager().setHGap(1);
                    pl.getClonedLayer().getLayoutManager().setVGap(1);
                }
            }

            return clone;
        };

        /**
         * läd ein Template welches vom Benutzer gewählt wurde
         *@access public
         *@param <String> sTemplateName
         *@return BitGUI_XMLTemplate
         */
        this.loadTemplate = function (sTemplateName){
            lastSelected  = -1;
            selectedLayer = -1;

            cloned = false;

            // alle Knoten löschen bevor sie neu belegt werden
            _tree.removeTreeNode( _tree.getNode( 0 ) );
            _tree.reset();

            new BitGUI_XMLTemplate(sTemplateName,null,function () {
                loadAllLayers(this.instanz, true );
                
                var observer = self.getObserver();

                for(var i = 0 ; i < observer.length;i++)
                    observer[i].update(this.instanz);
            });
        };

        /**
         *fügt ein Bild einer Ebene hinzu
         *@access public
         *@param <String> Bildpfad
         *@param <HTML Node> target in welche Ebene das Bild kommt
         *@param <HTML Node> source von welcher Ebene das Bild kommt
         */
        this.addImage = function(img,target,source){
        
            var _target  = target.getAttribute( 'pointer' );
            
            var _source  = source.getAttribute( 'pointer' );

            var modification = {
                added:[],
                moved:[],
                removed:[]
            };
            
            var imgLayer = null;

            if ( img.getAttribute('pointer') ) {
                imgLayer = _tree.getNode( img.getAttribute('pointer') );
            }
            
            /*Bild wurde in anderen Container verschoben
             *somit ist ein update notwendig , ansonsten bleibt
             *alles beim alten
             */
            if( _target && _target != _source) {
                // Bild war schon am Baum gebunden nur noch umbewegen
                if( _source ) {
                    _tree.moveNodeTo( imgLayer, _tree.getNode(_target) );

                    modification.moved.push({
                        from:source.getAttribute("pointer"),
                        node:imgLayer
                    });

                } else { // neuen Knoten erstellen für das Bild
                    imgLayer = new ImageNode( img );
                    _tree.getNode( _target ).addChild( imgLayer );

                    modification.added.push( imgLayer );
                }
                
                /* Knoten nun hinzufügen
                 */
                var observer = self.getObserver();
                for(var i = 0 ; i < observer.length;i++) {
                    observer[i].updateView(_target, modification );
                }
            }
            
            var beforeNode = -1;
            
            if ( imgLayer.getComponent().nextSibling ) {
                var node  = imgLayer.getComponent().nextSibling;
                beforeNode = parseInt(node.getAttribute("pointer"), 10);
            }
            
            _tree.getNode( _target ).switchChildInOrder( imgLayer.getPointer(), beforeNode); 
        };

        /**
         * gibt das aktuell geladene Template zurück
         *@access public
         *@return BitPanel
         */
        this.getTemplate = function() {
            return loadedTemplate;
        };

        /**
         *gibt das fertig geclonte Template zurück
         *@access public
         *@return BitPanel
         */
        this.getClonedTemplate = function() {

            if(!cloned) {
                _clonedTemplate = cloneTemplate();
                cloned = true;
            }

            return _clonedTemplate;
        };

        /**
         *setzt den aktuell selektierten Layer
         *@access public
         *@param <int> layerKey
         */
        this.selectLayer = function(layerKey){
            
            lastSelected = selectedLayer;
            selectedLayer = layerKey;

            if( lastSelected != selectedLayer ) {
                var observer = self.getObserver();

                for(var i = 0 ; i < observer.length;i++)
                    observer[i].markElement(selectedLayer , lastSelected );
            }
        };

        /**
         *gibt den aktuell selektierten Layer zurück
         *@access public
         *@return int
         */
        this.getSelected = function(){
            return selectedLayer;
        };

        /**
         *löscht eine oder mehere Ebenen aus dem Baum
         *@access public
         *@param <Array> layers
         */
        this.deleteNode  = function(layers) {

            var parent  = _tree.getNode( layers[0] ).getParent();

            var observer = self.getObserver();

            var modification = {
                    added:[],
                    moved:{from:null, node:null},
                    removed:deleteLayers( layers )
                };

            /* Knoten nun hinzufügen
             */
            for(var i = 0 ; i < observer.length;i++) {
                observer[i].updateView(parent, modification );
            }
        };

        /**
         *wird aufgerufen durch den Controller sobald Änderungen
         *am Template stattfanden wie durch den Ebenen Editor oder Text Editor
         *@access public
         *@param <Modification_Proxy> modificator
         *@return void
         */ 
        this.changeTemplate = function ( modificator ) {
            var mod = modificator.enableModification();
            
            var observer = self.getObserver();
            
            for(var i = 0 ; i < observer.length;i++) {
                observer[i].updateView(selectedLayer, mod);
            }
            
        };
        
        // das aktuelle Template in JSON Format transformieren 
        this.templateToJSON = function(){
        
            function convertToJSON( layer ) {
            
                var json = layer.toJSON();
                var childs = layer.getChilds();
                
                if ( json.container["contains"] ) {
                
                    // besitzt nur Panels 
                    // also Grid oder BorderLayout
                    for(var i = 0; i < childs.length; i++) {
                        var node = _tree.getNode( childs[i] );
                        if ( !node.isLeaf() )
                            json.container.contains[i] = convertToJSON( node );                             
                    }
                    
                } else {
                
                    // besitzt nur HTML Content also FlowLayout
                    if ( json.container["content"] ) {
                    
                        var order = layer.getChildOrder();
                    
                        for(var i = 0; i < order.length; i++) {
                            var node = _tree.getNode( order[i] );
                            
                            if ( node.isLeaf() ) {
                                json.container.content[i] = node.toJSON();                              
                            }
                            
                        }
                        
                    }
                    
                }
                
                return json;
            }
            
            return convertToJSON( _tree.getNode( 0 ) );
        }
    
        this.serializeTemplate = function () {
        
            function serialize( jsonObject ){
                var str = '{';
                var i   = 0;
                
                for(var key in jsonObject) {                       
                    if ( jsonObject[key] ) {                    
                        if ( i > 0 ) str += ',';
                        
                        if ( jsonObject[key].constructor == Object ) {
                            str += '"'+key+'":'+serialize(jsonObject[key]);
                        } else {                   
                            str += '"'+key+'":"'+jsonObject[key]+'"' ;
                        }
                    }                    
                    i++;                    
                }
                return str+'}';                
            }
    
            var template = this.templateToJSON();
            return serialize( template );
        }
    } 
    
    /**
     * Singleton realisieren
     */
    return {
        getInstanz:function(){
            if(!instanz)
                instanz = new Template();
            
            return instanz;
        }
    }
})();
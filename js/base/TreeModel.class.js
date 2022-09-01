var Tree = (function(){
    
    var tree = null;

    function Tree() {
        var key    = 0;

        var nodes  = {};

        function updateArrayTree(){};

        function checkNodeMoving(node, parent) {
            if(parent.isLeaf())
                return false;
            else if (node.getParent() == parent.getPointer())
                return false;
            else {
                // ist einzufügender Knoten Elternknoten von Zielknoten ?
                var pPointer = parent.getPointer();

                while ( pPointer != -1 ) {

                    if(pPointer == node.getPointer() )
                        return false;

                    pPointer =  nodes[pPointer].getParent();
                }
            }
            return true;
        };

        /**
         *einen Knoten aus dem Baum löschen
         *mitsammt seiner ganzen Kindknoten
         *@access private
         *@param <Object> node
         */
        function deleteNode(node) {
            var _node = node;

            if( !_node.isLeaf() ){
                var count = _node.getChilds().length;

                // alle Kinder durchlaufen
                for(var i = 0; i < count;i++){
                
                    var child = nodes[ _node.getChilds()[i] ];

                    if( !child.isLeaf() ) {                    
                        if(child.getChilds().length > 0)
                            deleteNode(child);                            
                    }

                    delete nodes[ child.getPointer() ];
                }

                var c = null;

                do {
                    c = _node.getChilds().shift();
                } while(c);
            }
            
            delete nodes[ _node.getPointer() ];
        };

        this.getArray = function(){
            var a = [];

            for(var key in nodes)
                a.push( key );

            return a;
        };

        /**
         * baut ein mehrdimensionales Array zusammen
         * welches den Baum repräsentiert
         * @access public
         * @param <int> node_key
         * @return <array>
         */
        this.getArrayTree = function( node_key ){

            var start = node_key || 0;

            function buildArrayTree( node ){
                
                var array = [];
                    array.isFolder = false;
                    
                var childs = node.getChilds();
                var length = childs.length;

                for( var i = 0 ; i < length;i++ ) {
                    if( !nodes[ childs[i] ].isLeaf() && nodes[ childs[i] ].getChilds().length > 0  ) {
                        array[i] = [ childs[i] ];
                        array[i].isFolder = true;
                        array[i].push( buildArrayTree( nodes[ childs[i] ]) );
                    } else {
                        array[i] = childs[i];
                    }
                }
                return array;
            }

            var arrayTree = [start, buildArrayTree( nodes[start]) ];
                arrayTree.isFolder = true;

            return arrayTree;
        };

        /**
         * fügt ein Kindknoten hinzu
         */
        this.addNode = function(node){
            nodes[key] = node;
            node.setPointer(key);
            node.setNodeName();
            key++;
        };

        /**
         *entfernt einen Knoten und all seine Kindknoten
         *@param <TreeObject> node
         */
        this.removeTreeNode = function(node) {
            if(node) {
                var _node   = ( (typeof node).toString() == "number")?nodes[node]:node;
                var _parent = nodes[ _node.getParent() ] ;

                if( _node.getParent() != -1 ) {
                    _parent.removeChild( _node );
                }

                deleteNode( _node );
                _node = null;
            }
        };

        /**
         * bewegt einen Knoten zu einen anderen Knoten
         */
        this.moveNodeTo = function(node,parentNode) {
            var _oldParent = nodes[ node.getParent() ];
            
            if( checkNodeMoving(node,parentNode) ) {
                _oldParent.removeChild(node);
                parentNode.addChild(node);
            }
        };

        this.getNode = function(pointer){
            return nodes[pointer];
        };

        this.reset = function(){
            key = 0;
        };
    }

    return {
        getInstanz:function(){
            if(!tree) {
                tree = new Tree();
            }

            return tree;
        }
    }
})();
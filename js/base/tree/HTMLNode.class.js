function HTMLNode( node ){
    TreeNode.call(this);
    
    var self = this;
    
    var _tree = Tree.getInstanz();
        _tree.addNode(this);

    var content = "";
    
    var nodeName = "";
    
    init();
    
    function init(){
        nodeName = node.nodeName.toLowerCase();
        content  = node.innerHTML;        
        
        node.setAttribute("pointer", self.getPointer());
        
        self.setNodeName( (content.length > 17)?content.substr(0,14)+" ...":content );
    }
    
    this.getComponent = function () {
        return node;
    }
    
    this.setContent = function( c ){
        node.innerHTML = c;
        content        = c;
        self.setNodeName( (content.length > 17)?content.substr(0,14)+" ...":content );
    }
    
    this.getContent = function(){
        return content;
    }
    
    this.getType = function(){
        return "htmlNode";
    }
    
    this.isLeaf = function(){
        return true;
    };
    
    function convertSlashes(c){
        return c.replace(/\"/g,"'");
    }
    
    this.toJSON = function(){
        return {
            type:"htmlNode",
            node:nodeName,
            html:convertSlashes( content )
        }
    }
}
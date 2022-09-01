function TextEditor(){

    BaseModel.call ( this );

    var self = this;

    var tree = Tree.getInstanz();
    
    var nodesToDelete = [];

    var edit_config = {
        mode:'exact',
        theme:'advanced',
        theme_advanced_toolbar_location:'external',
        theme_advanced_buttons1:"undo,redo,bold,italic,underline,strikethrough,formatselect",
        theme_advanced_buttons2:"numlist, bullist,outdent,indent,justifyleft,justifycenter,justifyright,forecolor,backcolor",
        theme_advanced_buttons3:"fontselect,fontsizeselect,charmap,my_save",
        setup:function(ed){
            ed.addButton('my_save', {
                title:'Save modifications',
                onclick:function(){
                    saveContent();
                }
            })
        }
    };

    var editor  = null;
    var layer   = null;
    var toolbar = null;

    // Tiny MCE kopiert seine Ebene einfach so rein
    // ohne darauf zu achten welche Styles sie hatte
    // ist in dem Fall suboptimal
    var dummy = Element.create( 'div' );
        dummy.id = Element.generateId(5);

    function loadToolBar(){
        toolbar = Element.get(dummy.id+"_external");
        toolbar.style.display = "block";
        toolbar.style.position = "static";

        Element.unlink( Element.get(dummy.id+'_external_close') );
        Element.unlink(toolbar.parentNode);
        
        var obs = self.getObserver();
        for(var i = 0; i < obs.length;i++ )
            obs[i].editorLoaded();
    };

    /**
     * da die Bild Eigenschaften wie pointer verloren gehen diesen Pointer
     * an die Bild URL hängen um sie später wieder hinzuzufügen
     */
    function prepareEditor(){
        var node = layer.getChilds();

        for(var i = 0 ; i < node.length;i++) {
                
            var leaf = Tree.getInstanz().getNode(node[i]);

            nodesToDelete.push( node[i] );
            
            if ( leaf.getType().toLowerCase() == "image" ) {
                var img = new Image();
                    img.src = leaf.getComponent().src.replace( /(.*)$/,"$1?"+leaf.getPointer() );

                Element.attrib(img, "style", leaf.getStyleValues() );
                switchNode(leaf.getComponent(), img);
                
            } else {                
                /*
                var new_node    = leaf.getComponent().cloneNode(true);
                    new_node.id = "bitedit_textedit_"+leaf.getPointer(); 
                
                switchNode( leaf.getComponent(), new_node );
                */
            }            
        }
    };

    function createEditor(){
    
        layer = Tree.getInstanz().getNode(
            Template.getInstanz().getSelected()
        );

        if( !layer.isLeaf() && layer.isEditAble() ) {
            prepareEditor();

            var dim = layer.getLayer().getDimension().availDimension();

            dummy = document.createElement('div');
            dummy.innerHTML  = layer.getLayer().getComponent().innerHTML;
            dummy.id = Element.generateId(5);

            Element.attrib( dummy, 'style', {
                height:dim[1]+"px",
                width:dim[0]+"px"
            })

            layer.getLayer().getComponent().innerHTML = "";
            Element.bind (dummy, layer.getLayer().getComponent() );
            layer.getLayer().getComponent().position = 'relative';

            editor = new tinymce.Editor( dummy.id , edit_config);
            editor.onPreInit.add(loadToolBar);
            editor.render();
        }
    };

    function switchNode( old_node, new_node ){
        old_node.parentNode.insertBefore(new_node, old_node);
        Element.unlink ( old_node );
    };

    function moveImage( img_node ){
        var pn = img_node.parentNode;

        while ( pn.nodeName.toLowerCase() != 'p' ) {
            pn = pn.parentNode;
            continue;
        }

        layer.getLayer().getComponent().insertBefore(img_node, pn);

        // prüfen ob der p tag nun leer ist , wenn ja entfernen
        if( Element.trim(pn.innerHTML) === "" )
            Element.unlink(pn);
    };

    /**
     *prüfen ob der Knoten im fertig bearbeiteten Text noch existiert
     *@access private
     *@param <int> value
     *@return boolean
     */
    function removeFromDeleteModification( value ){        
        for(var i = 0; i < nodesToDelete.length;i++){
            if ( parseInt(nodesToDelete[i], 10) === parseInt(value, 10) ) {
                nodesToDelete.splice(i,1);
                break;
            }
        }
    }
    
    /**
     * durch das Cleanup sind die Ebenen Eigenschaften verschwunden
     */
    function finishEditor() {    
    
        var content = layer.getLayer().getComponent();
        var images  = content.getElementsByTagName("img");
        var len     = images.length;
        var pointer = -1;
        
        var modificator = new Modificator();
            modificator.setNode( layer );
            
        layer.resetChildOrder();
            
        for(var i = 0; i < len; i++) {
            pointer = images[i].src.match(/\?(\d+)$/)[1];
                        
            removeFromDeleteModification( pointer );
                    
            var img_node = tree.getNode(pointer);
            /**
             * der Tiny MCE scheint die Bilder in einen p tag zu hinterlegen 
             * warum auch immer er dies tut , aber die Bilder dort
             * wieder entfernen
             */
            moveImage( images[i] );

            //Original Bild wieder einfügen vor dem Bild
            switchNode(images[i], img_node.getComponent() );
        }
        
        var childs  = content.childNodes;
            len     = childs.length;
            pointer = null;
            
        // andere Tags bearbeiten
        for(var i = 0;i < len; i++) {
            // gleichzeitig die Reinfolge speichern
            if ( childs[i].nodeName == "#text" )
                continue; 
                
            var p = -1;
                
            if ( childs[i].nodeName.toLowerCase() != "img" ){
                var node = new HTMLNode( childs[i] );
                modificator.add( node ); 
                p = node.getPointer();
            } else {
                var p = parseInt( childs[i].getAttribute("pointer") );
            }
            layer.addChildToOrder(p);
        }
        
        for(var i = 0; i < nodesToDelete.length; i++) {
            modificator.remove( tree.getNode(nodesToDelete[i]) );
        }
        
        nodesToDelete = [];
        
        // alles an Template senden
        var obs = self.getObserver();
        for(var i = 0; i < obs.length;i++ )
            obs[i].editorFinished( new Modification_Proxy( modificator ) );
        
    };

    function saveContent(){

        var new_content = editor.getContent();

        editor.remove();
        editor.destroy();

        // Inhalte neu einfügen
        layer.getLayer().getComponent().innerHTML = new_content;
        finishEditor();

        dummy  = null;
        editor = null;
        layer  = null;
    };

    this.enableEditMode = function () {
        if( layer && (layer.getPointer() === Template.getInstanz().getSelected() ) )
            return;

        if( editor ) {
            editor.remove();
            editor.destroy();

            Element.unlink ( dummy );
        }
        createEditor();
    };

    this.getDummy = function(){
        return dummy;
    };

    this.getToolBar = function(){
        return toolbar;
    };

}
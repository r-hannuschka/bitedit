function HelpWindow( ctrl ){

    var frame = null;
    var menu  = null;
    var content_panel = null;

    function createFrame(){
        frame = new BitFrame( "Hilfe" );
        frame.setSize( 500, 400 );
        frame.setClassName("helpWindow");
        frame.add( createContentPane() );
    };

    function loadMenuFromXML(){
        var menu    = null;
        var content = null;
        
        new Load.XMLDocument( 'Hilfe/menu.xml', function( xmlContent ){
            if(/msie/i.test(navigator.userAgent)) 
                content = xmlContent.childNodes[1];
            else if (xmlContent.childNodes[0].nodeName == "#text")
                contnet = xmlContent.childNodes[1];
            else
                content = xmlContent.childNodes[0];
                    
            menu = createMenu( content );            
        }, false);
        
        function createMenu( node ){
        
            var childs = node.childNodes;
            var len    = childs.length;
            var list = document.createElement("ul");
                        
            for(var i = 0; i < len; i++) {
                if ( childs[i].nodeName == "#text" ) continue;
                
                var fileNode = Element.create("li","<span>"+childs[i].getAttribute("name")+"</span>");
                    
                if ( childs[i].nodeName == "folder" ) {
                    fileNode.appendChild( createMenu ( childs[i] ) );
                }

                list.appendChild( fileNode );
                
            }
            return list;            
        };
        
        return menu;
    };
    
    /**
    *baut den Pfad anhand des Baum Menus zusammen 
    *läuft den Baum nach oben und fügt den Pfad zusammen 
    *@access private
    *@param <Html Object> node
    *@return <String> path
    */
    function getPath( node ){    
        var path = node.previousSibling.innerHTML.split(" ").join("_");
        var parent = node;
        
        do {
            parent = parent.parentNode;
            
            if ( parent.nodeName.toLowerCase() !== "ul" ) 
                continue;
                
            var name = parent.previousSibling.innerHTML;
                name = name.split(" ").join("_");
                
            path = name+"/"+path;                
        } while ( parent !== menu );
        
        return path;
    };
    
    function loadTopic( path ) {
        var right = content_panel.getLayoutManager().getRightComponent()
            .getContentPane().getComponent();
            
        new Load.ajaxContent({
            ajax:true,
            method:"POST",
            path:path
        }).initLoad(null, function( text) {
            right.innerHTML = text;
            
            window.setTimeout(function(){ content_panel.getLayoutManager().getRightComponent().reload(); }, 50);
        });
    };
        
    function createContentPane(){
        content_panel = new BitSplitPanel();
        
        menu = loadMenuFromXML();
        menu.id = Element.generateId(5); 
        
        var left = new BitScrollPanel();
            left.setBackground("#dedede");
            left.setSize( 200, 200 );
            left.setMaxSize(300, 200);
            
            left.getContentPane().setAttribute("padding", "5px");
            left.getContentPane().getComponent().appendChild ( Element.create("b", "Hilfe" ) );
            left.getContentPane().getComponent().appendChild ( menu );

        var right = new BitScrollPanel();
            right.setClassName("helpContent");
            right.setBackground("#FFF");
            right.getContentPane().setAttribute("padding","5px");
            
        new TreeMenu( menu )
            .setCallbackFile (function ( node ){
                var path = getPath ( node );  
                    path += (node.innerHTML.split(" ").join("_"))+".html";
                    
                loadTopic( path );
            })
            .setCallbackFolder( function(){
                if( this.trigger.nodeName.toLowerCase() == "span"){
                    var path = getPath ( this.node );                
                        path += "/index.html";
                        
                    loadTopic( path );
                } else {
                    left.reload();
                }                
            });

            content_panel.leftComponent( left );
            content_panel.rightComponent( right );
        
        return content_panel;
    };

    this.init = function(){

        if( !frame ) {
            createFrame();
        }

        if( !frame.inDocument() ) {
            frame.setVisible( true );
            WindowManager.centerWindow( frame );
            
            var ae = new ActionEvent( ActionEvent.MAIN_EVENT );
                ae.setMessage("addframe");
                ae.addParam( frame );

            ctrl.handleEvent( ae );
        }
    }
}
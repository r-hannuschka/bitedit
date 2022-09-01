function LayerOverview(ctrl,model){
    
    var _con  = ctrl;

    var _mod = model;

    var _tree     = Tree.getInstanz();

    var panel = new BitPanel();
    
    panel.setLayout( new BorderLayout(0,0) );

    var listPanel = new BitScrollPanel();
    
    panel.add(listPanel,'center');
    panel.add( getToolPanel() ,'south');

    _mod.addObserver(this);
        
    var list  = null;

    var _dd = new DragDrop();

    /**F
     *erstellt das Toolpanel für allgemeine Ebenen Operationen
     *im ersten fall nur löschen
     *@access private
     *@return BitPanel
     */
    function getToolPanel() {
        var toolPanel =  new BitPanel();
        
        toolPanel.setSize(10, 25);
        toolPanel.setLayout(new FlowLayout(0,0,'right'));
        toolPanel.setClassName("overview_toolpanel");

        var deleteBtn = new BitButton();
        deleteBtn.setSize(20,20);
        deleteBtn.setBackground("url(img/buttons/icons.png) no-repeat -180px 0px");
        deleteBtn.getComponent().id = "delete_layer_inoverview";

        deleteBtn.addAction('click',function(){
            if(_mod.getSelected() > -1 )
                deleteNode( _mod.getSelected() );
        });

        toolPanel.add(deleteBtn);
        return toolPanel;
    };

    /**
     *prüft vorerst ob der Knoten so wie er ist löschbar ist
     *das soll heißen das wenn die Ebene die wir löschen wollen
     *im Zentrum liegt dann müssen auch alle anderen Ebenen
     *gelöscht werden die im Elterncontainer liegen
     *löscht dann erst wenn der Benutzer es bestätigt hat.
     *
     *@access private
     *@param <int> nodeKey
     */
    function deleteNode(node) {

        var ae = null;

        if( _mod.checkNodeDelete(node) ) {
            
            ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
            ae.setMessage("delete");
            ae.addParam( [node] );

            _con.handleEvent(ae);

        } else {  // Ebene kann nicht so ohne weiteres gelöscht werden
            var msg = "Diese Ebene kann nicht gelöscht solange die <br />anderen "+
            "Ebenen in der Ebene "+ _tree.getNode(node).getParent()+" existieren. "+
            "<br /><br />Sollen diese Ebenen nun ebenfalls gelöscht<br />werden ? ";

            ConfirmWindow.confirm(
                function(){
                    /* Knoten aus der Übersicht entfernen
                     */
                    var toDelete = _tree.getNode( _tree.getNode(node).getParent() ).getChilds();
                    var del = [];

                    for(var i = 0 ; i < toDelete.length;i++)
                        del.push ( toDelete[i] );

                    ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
                    ae.setMessage("delete");
                    ae.addParam( del );

                    _con.handleEvent(ae);
                },
                function() {}  // es soll nichts gelöscht werden
                ).show(msg);

            ae = new ActionEvent();
            ae.setMessage("addframe");
            ae.addParam( ConfirmWindow.getConfirmWindow() );

            _con.handleEvent(ae);
        }
    };

    function removeFolder( _node ){
        
        // die LI holen
        var parentLi = document.getElementById("layer_"+_node.getPointer() );
        var childs   = parentLi.childNodes;
        
        if(parentLi) {
            var i = 0;
            do {
                if ( i == 0 )  
                    Element.unlink ( childs[0] );
                
                if ( i == 1 ) 
                    childs[0].className = childs[0].className.replace(/subFolder/,"");
        
                i++;
            } while ( i < 2);
        }

        _dd.removeContainer( _node.listNode.id );
        Element.unlink( _node.listNode );

        /* die UL aus dem Objekt löschen wird nicht mehr benötigt
         */
        delete _node.listNode;
    };

    /**
     *TODO prüft ob der Knoten ein Verzeichniss ist 
     *aber nicht korrekt es ist erst dann ein Verzeichniss 
     *wenn eine UL existiert im LI Knoten der Ebenen Übersicht
     */ 
    function isFolder( _node ) {
        if( _node.getChilds().length > 0 )
            return true;

        return false;
    };

    /**
     *
     */
    function createNameInput(field, node){

        if(field.firstChild.nodeName.toLowerCase() == "input")
            return;

        var input = document.createElement("input");
        input.type  = "text";
        input.value = field.innerHTML;

        field.innerHTML = "";
        field.appendChild(input);
            
        input.focus();

        Element.addEvent(input,'keydown',function(evt){
            var e = evt || window.event;

            if(e.stopPropagation) e.stopPropagation();
            else                  e.cancleBubble = true;

            if(e.keyCode == 13) {
                field.appendChild( document.createTextNode( input.value ) );
                node.setNodeName ( input.value );
                input.parentNode.removeChild( input );
            }
        });

        Element.addEvent(input,'click',function(evt){
            var e = evt || window.event;
            Element.stopEvent(e);

            input.focus();
        });
        
    };

    /**
     * einen EbenenLayer erstellen in form eines LI Tags
     * @access private
     * @param <TreeObject> node
     * @param <int> level
     * @param <boolean> isFirst
     * @param <boolean> isSubFolder
     */
    function createButton( node, level , isFirst , isSubFolder ){
        
        var button    = document.createElement("li");
        var layButton = document.createElement("span");

        button.id = "layer_"+node.getPointer();
        layButton.className = "layerbutton";

        if( isSubFolder ) {
            var openClose = document.createElement("a");
                openClose.className = "opener closed";

            button.appendChild(openClose);

            Element.addEvent(openClose,'click',openLayer);

            layButton.className += " subFolder";
        }

        if(level > 0) {
            var spacer = document.createElement("span");
                spacer.className = "spacer";
                spacer.id        = "spacer_"+node.getPointer();
                spacer.style.width = (level*12)+"px";
        
            if(isFirst)
                spacer.className += " firstFolderElement";

            layButton.appendChild(spacer);
        }

        layButton.appendChild( document.createTextNode( node.getNodeName()) );
        button.appendChild(layButton);

        Element.addEvent(button,'click',function(evt){
            var e = evt || window.event;
            Element.stopEvent(e);

            var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
            ae.setMessage("select");
            ae.addParam( node.getPointer() );

            _con.handleEvent(ae);            
        });
        
        return button;
    };

    /**
     * konvertiert einen bestehenden Button zum
     * Folderbutton so das ein open close möglich ist
     *@access private
     *@param node
     *@return konvertierter Button li Element
     */
    function convertButtonToFolder (node) {

        var btn = Element.get( "layer_"+node.getPointer() );
        
        var aTag = btn.firstChild;
            aTag.className += " subFolder";

        var openClose = document.createElement("a");
        openClose.className = "opener closed";
            
        Element.addEvent(openClose,'click',openLayer);

        btn.insertBefore(openClose,aTag);
        
        /* die Kindliste für das Unterverzeichniss erstellen
         */ 
        var ul    = document.createElement("ul");
        ul.id = Element.generateId(5);
        ul.style.display = "none";

        /* den Listen Knoten im <TreeObject> Knoten anbinden
         * damit später der Zugriff darauf gewährleistet wird
         */
        node.listNode = ul;

        Element.bind(ul, btn );

        _dd.addContainer(new Container(ul.id,{
            drop:false,
            clone:true,
            dragable:['li']
        }));

        return btn;
    };

    /**
     *ermittelt das Ebenen Level vom Knoten
     *@access private
     *@param node
     *@return int level
     */
    function getLayerLevel(node){
        var level = 0;
        
        while(node.getParent() > -1) {
            node = _tree.getNode( node.getParent() );
            level++;
        }

        return level;
    };

    /**
     *Knoten aus der HTML Liste löschen
     *@access private
     *@param node
     *@param [<LayerNode> parent] alternativer Parent Knoten
     */
    function deleteNodeOverview(node, parent){
        
        var _node = null;
                
        if(node.getPointer() > 0 ) {
            _node  = Element.get("layer_"+node.getPointer() );
        } else {
            _node = listPanel.getContentPane();
        }
            
        // DragDrop Container löschen da sie nicht mehr
        // benötigt werden
        var allUl = _node.getElementsByTagName("ul");
        
        var param = [];

        for(var i = 0; i < allUl.length;i++)
            param.push(allUl[i].id);

        _dd.getContainers.apply(param).remove();

        // Eltern UL holen zum updaten später
        var parUl = _tree.getNode( parent || node.getParent() ).listNode;

        /* wenn der Knoten keinen Knoten vor sich hat
         * kann es der letzte verbleibende Knoten sein
         * andernfalls wird dem nachfolgenden Knoten
         * die Grafik des Pfeils verpasst
         */
        if( !_node.previousSibling ){
            
            /* es hat keinen Folgeknoten somit ist es das
             * letzte Element in der Liste gewesen
             * Folder entfernen
             */
            if( !_node.nextSibling ) {
                removeFolder( _tree.getNode( parent || node.getParent() ) );
                Element.unlink(_node);
            } else {
                
                try { // Knoten die direkt unter dem Root sind haben keinen Div
                    var next = _node.nextSibling.getElementsByTagName("div")[0];
                    next.className += ' firstFolderElement';
                } catch (e) {};

                Element.unlink(_node);
                _dd.getContainer(parUl.id).updateContainer();
                
            }
        } else {
            Element.unlink(_node);
            _dd.getContainer(parUl.id).updateContainer();
        }
        
        listPanel.reload();
    };

    /**
     *Sofern Knoten noch nicht der HTML Liste existiert
     *neu erstellen bzw umbewegen zu neuen Knoten
     *@access private
     *@param node Zeiger auf den Knoten
     */
    function moveNodeOverview(node){
        
        var button = null;
        var _node  = node;

        var pn = _tree.getNode( _node.getParent() );
        
        
        /* die Ebene hat noch nicht existiert also wird
         * sie komplett neu eingefügt
         */
        if( !document.getElementById('layer_'+_node.getPointer() ) ) {
            var first = false;
            
            if(pn.getChilds().length == 1 )
                first = true;

            button = createButton( _node, getLayerLevel( _node) , first , false);
        } else {
            button = document.getElementById('layer_'+ _node.getPointer() );
        }

        Element.bind(button, pn.listNode );
        
        if( pn.getChilds().length > 0) {
            var folderLayer = document.getElementById( "layer_"+pn.getPointer() );
            var ul = folderLayer.getElementsByTagName("ul")[0];

            Element.bind(button,ul);
            
            _dd.getContainer(ul.id).updateContainer();
        }

        openLayerTree( _node );
    };

    /**
     *Ebenen Übersicht erstellen
     *@access private
     *@return <HTML UL> list
     */
    function buildLayerOverview(){     
        var level = 1;
        
        function buildList( n ){
        
            var node = n;
        
            var list = document.createElement("ul");
            
            var counter = node.getChilds().length;

            var button  = null;
            
            for(var i = 0 ; i < counter; i++) {
                
                var child = _tree.getNode( node.getChilds()[i] );

                if( !child.isLeaf() ) {
                
                    var count = child.getChilds().length;
                                        
                    if(count > 0) {
                        button  = createButton(child,level++,(i==0),true);
                        
                        var subUl =  buildList(child);
                            subUl.style.display = "none";

                        /**
                         * Unterliste speichern in Objekt damit es 
                         * als verzeichniss gebranntmarkt ist und 
                         * auf die Liste schneller Zugriff gewährleistet wird
                         */ 
                        child.listNode = subUl; 
                        button.appendChild( subUl );

                        level--;
                    } else {
                        button = createButton(child,level,(i==0),false);
                    }
                    
                } else {
                    button = createButton(child,level,(i==0),false);
                }

                Element.bind(button,list);
            }
            
            return list;
        };
        
        var rootList = document.createElement("ul");
            rootList.id        = "layerview";
            rootList.className = "layerview";

        var btn = createButton( _tree.getNode(0) , 0, false ,true);
        var lst = buildList( _tree.getNode(0) );
            lst.style.display = "none"; 

        btn.appendChild( lst );
        rootList.appendChild( btn );

        _tree.getNode(0).listNode = lst;

        return rootList;
    };
    
    function openLayer(e) {

        var evt = e || window.event;
        Element.stopEvent(evt);

        var t = evt.srcElement || evt.target;
        
        var next = t;
        
        do {
            if(next.nodeName.toLowerCase() == "ul") {
                if(next.style.display == "none") {
                    next.style.display = 'block';
                    t.className        = 'opener open';
                } else {
                    t.className        = 'opener closed';
                    next.style.display = 'none';
                }
                break;
            }
        } while( (next = next.nextSibling) );

        // scrollbalken aktualisieren
        listPanel.reload();
    };

    /**
     *vom aktuellen Knoten aus nach oben wandern bis alle
     *Oberlisten gefunden wurden und diese öffnen
     *sollte diese auf display block stehen abbrechen
     *
     *@access private
     *@param <TreeObject> node
     *@return void
     */
    function openLayerTree( node ){
        var parentkey = node.getParent();
        var element   = Element.get( 'layer_'+node.getPointer() );
        
        while(parentkey > -1){      
        
            if(element.nodeName.toLowerCase() == 'ul') {    
            
                if(element.style.display != 'block') {
                    element.style.display = 'block';
                    element   = Element.get('layer_'+parentkey);
                    
                    // das erste Element ist der a tag zum öffnen schließen
                    element.firstChild.className = 'opener open';
                }
            
                parentkey = _tree.getNode( parentkey ).getParent();
                
            }   
            
            element = element.parentNode;
        }
    }

    /**
     * Drag und Drop Funktionaltiät bereitstellen
     * um Ebenen zu löschen
     *@access private
     */
    function enableDragDrop(){
        var allUL = listPanel.getContentPane().getComponent();
        allUL = allUL.getElementsByTagName('ul');
        
        var count = allUL.length;

        for(var i=0;i<count;i++){
            allUL[i].id = Element.generateId(8);

            var c = new Container(allUL[i].id,{
                drop:false,
                clone:true,
                dragable:['li']
            });

            _dd.addContainer(c);
        }
    };

    /**
     * Ansicht des Baumes aktualisieren
     * das die Verzeichniss Struktur korrekt dargestellt wird
     * @access private
     * @param <Tree> tree
     * @return void
     */
    function updateTreeDisplay( tree ){
        if( tree.listNode ) {
            var childs = tree.listNode.childNodes;
            var len    = childs.length;
            
            for(var i = 0 ; i < len ; i++ ) {
                
                var id = childs[i].id.match(/\d+$/)[0];
        
                var spacer = document.getElementById("spacer_"+id);
                                       
                if(i === 0) {
                    spacer.className = "spacer firstFolderElement";
                } else {
                    spacer.className = "spacer";
                }
            }
        }
    };

    function addToView(pointer, mod){
        
        var node = _tree.getNode(pointer);

        if( isFolder(node) && !node.listNode ) {
            convertButtonToFolder( node );
        }
                
        for( var i = 0 ; i < mod.added.length;i++) {
            moveNodeOverview( mod.added[i] );
        }
    }

    /**
     * entfernt einen Knoten aus der Baumansicht
     *@access private
     *@param <Object> mod Modification
     *@param <int> oldParent alternativer Knoten für das alte
     *                       Elternelement wo der Knoten entfernt
     *                       werden soll
     */
    function removeFromView( mod, oldParent ){
        for(var i = 0 ; i < mod.removed.length;i++) {
            deleteNodeOverview( mod.removed[i], oldParent );
        }
    }

    /**
     *markiert ein Element und sorgt dafür das die
     *Ebenen automatisch aufgeklappt werden
     *
     *@acess public
     *@param layerkey
     */
    this.markElement = function(selected , lastSelected ){
        var element   = Element.get('layer_'+selected);
        element.style.background = '#aff';

        if(lastSelected > -1 )
            Element.get('layer_'+lastSelected).style.background = 'transparent';

        openLayerTree( _tree.getNode( selected ) );

        listPanel.reload();
    };

    /**
     * wird von TemplateModel aufgerufen
     * sobald ein neues Template geladen wurde
     *
     * @access public
     */
    this.update = function(){
        last_selected = 0;

        // panel leeren
        var lo = listPanel.getContentPane().getComponent();
        lo.innerHTML = "";

        // übersicht zusammen bauen und einbinden
        list = buildLayerOverview()
        list.id = Element.generateId(5);

        Element.bind(list,lo);

        // drag Drop initialisieren
        enableDragDrop();

        listPanel.reload();
    };

    this.getFrame = function (){
        var frame = new BitFrame("Ebenen");
        frame.setSize(200,300);
        frame.setPosition(100,50);
        frame.setBackground('#cacaca');
        frame.add(panel);
        frame.setVisible(true);

        _dd.addContainer(new Container("delete_layer_inoverview"));
        _dd.callOnDrop(function () {
            var id = this.dropped_element.getAttribute("id");
            Element.unlink(this.dropped_element);
            deleteNode( id.match(/\d+$/) );
        });

        return frame;
    };
	
    this.updateView = function( pointer, mod){
	            
        // Knoten hinzufügen
        if(mod.added.length > 0) {
            addToView(pointer, mod);
        }

        // knoten löschen
        if(mod.removed.length > 0) {
            removeFromView( mod );
        }

        // Knoten umbewegen
        if(mod.moved.length > 0) {
            for(var i = 0 ; i < mod.moved.length; i++ ) {

                removeFromView({
                    removed:[mod.moved[i].node]
                }, mod.moved[i].from );

                addToView(pointer,
                {
                    added:[mod.moved[i].node]
                });
            }
        }

        updateTreeDisplay( _tree.getNode( pointer ) );
        listPanel.reload();
    };
};
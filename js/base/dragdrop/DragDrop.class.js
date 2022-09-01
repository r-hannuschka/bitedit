function Container(element,config){

    var container_coords = [];
    
    var childs           = [];
    
    var container        = loadContainer(element);
    
    var configuration    = (
        function(){
            if(config)
                return config;
            else 
                return {
                    drop:true,
                    clone:false,
                    dragable:[]
                };
        }
    )();
    
    // Container Koordinaten und Kind Koordinaten speichern 
    // Sowie Kinder des Containers abspeichern damit klar ist welche Kinder nun beeinflusst werden
    function loadContainer(ele){
        var con = null; 
        
        if((typeof ele).toLowerCase() == 'string') {
            con = Element.get(ele);
        } else {
            con = ele;
        }
            
        // Koordinaten speichern
        container_coords = Element.getCoords(con);
        
        // Kindelemente speichern 
        for(var i = 0 ; i < con.childNodes.length;i++) {
        
            if(con.childNodes[i].nodeName == '#text') continue;
        
            var child_coords = Element.getCoords(con.childNodes[i]);
            
            var child = con.childNodes[i];
            
            Element.attrib(child,"dragObj",true);
            childs.push([child,child_coords]);
        }
        
        return con;
    };
    
    function checkForUpdate(){
        
        var current_coords = Element.getCoords(container);
        
        if(container_coords.posX != current_coords.posX || container_coords.posY != current_coords.posY ||
           container_coords.h    != current_coords.h    || container_coords.w    != current_coords.w      )        
                updateContainer();
                
    };
        
    function updateContainer(){
        childs = [];
        loadContainer(container);
    };
    
    function getChilds(){
        return childs;
    };
    
    function getContainer(){
        return container;
    };
    
    function getAttribute(){
    };
    
    function getContainerCoords(){
        return container_coords;
    };
    
    this.setParam = function (param){
        for(var key in param) {
            configuration[key] = param[key];
        }
    };
    
    function getParam(param){
        return configuration[param];
    };
    
    this.getParam    = getParam;
    
    this.getContainer = getContainer;
    
    this.getChilds    = getChilds;
    
    this.getAttribute = getAttribute;
    
    this.updateContainer = updateContainer;
    
    this.getContainerCoords = getContainerCoords;
    
    this.checkForUpdate = checkForUpdate;
};
            
/**
* DRAG DROP 
*/
function DragDrop (container) {

    var clickedX = 0;
    var clickedY = 0;
    
    var elementDragged = false;
    
    var dd_dummy       = null;
    
    var element        = null;
    
    var cloned_element = null;
    
    var cur_con        = null;
    
    var start_con      = null;
    
    var last_container = null;
    
    var containers     = [];
    
    var display_dummy  = null;
    
    var display_dummy_attrib = {};
    
    // boolsche Variable um festzustellen ob wirklich was rumgeschoben wurde
    var moved = false;
    
    var dragged_element = {
        cords:[0,0],
        node:null
    };
    
    var drop_method = null;

    var move_method = null;
            
    // man kann nur Elemente innerhalb dieses Containers ablegen
    if(arguments.length > 0) {
        for(var i = 0 ; i < arguments.length;i++) {
            setContainer(arguments[i]);
        }
    }
    
    function setContainer(){
    
        if(arguments[0].constructor == Array) {
        
            for(var i = 0 ; i < arguments[0].length;i++) {
                containers.push(new Container(arguments[0][i]));
                addEvents(containers[containers.length-1]);
            }
            
        } else {
            for(var i = 0 ; i < arguments.length;i++) {
                if(arguments[i].constructor == Container)
                    containers.push(arguments[i]);
                else 
                    containers.push(new Container(arguments[i]));
                    
                addEvents(containers[containers.length-1]);
            }
        }
    };
    
    function addEvents(container){        
        var childs_in_container = container.getChilds();
        
        var len = childs_in_container.length;
        for(var i = 0 ; i < len ;i++) {
            Element.unlinkEvent(childs_in_container[i][0],'mousedown',dragElement);
            Element.addEvent(childs_in_container[i][0],'mousedown',dragElement);
        }
        
    };
                
    function getMouseCoords (e) {
        if(document.all && (/msie/i.test(navigator.userAgent)) ) {
            return {
                mx:document.documentElement.scrollLeft+e.clientX,
                my:document.documentElement.scrollTop+e.clientY
            };
        } else 
            return {mx:e.pageX,my:e.pageY};
    };
 
    //maus gedrÃ¼ckt
    function dragElement (evt) {
        
        var e   = evt || window.event;
        element = e.srcElement || e.target;
        
        Element.stopEvent(e);
        
        // das Dragobjekt holen , falls der Event gesickert ist kann es passieren 
        // das sonst ein anderes Element statt dem gewollten verschoben wird

        do {
            if(element && element.getAttribute("dragObj"))
                break;
        } while( (element = element.parentNode) );

        // alle Container updaten
        for(var i = 0 ; i < containers.length;i++){
            containers[i].updateContainer();
        }
           
        if(!element) return;
        
        var mc = getMouseCoords(e);
        var ec = Element.getCoords(element);
        
        dragged_element.coords = [ec.posX,ec.posY];
                    
        clickedX = mc.mx-ec.posX;
        clickedY = mc.my-ec.posY;
                    
        elementDragged = true;
                
        try {
            
            start_con = getContainer( element.parentNode.id );

            if(start_con.getParam('dragable').length > 0 &&
                !start_con.getParam('dragable').inArray(element.nodeName.toLowerCase())
            ) {
                elementDragged = false;
                return;
            }

            if( start_con.getParam('clone') )
                cloned_element = element.cloneNode(true);
        
            
            Element.addEvent(document,"mousemove",moveElement);
            Element.addEvent(document,"mouseup",dropElement);

        } catch (e) {
            return;
        }
        
        // Attribute fÃ¼r den Display Dummy holen
        var floating = Element.cssValue(element,'float') || Element.cssValue(element,'styleFloat');
        
        if(floating == 0) {
            floating = element.style.cssFloat || element.style.styleFloat || 'none';
        }
        
        if(floating == "none")
            display_dummy_attrib = { display:'block' };
        else
            display_dummy_attrib = { cssFloat:floating };
                        
        display_dummy_attrib['margin'] = Element.getMargin(element).join("px ");
    };
                
    //maus bewegt
    function moveElement (evt) {
        if(!elementDragged) return false;
        
        var e = evt || window.event;
        Element.stopEvent(e);
                    
        if(!moved){
            var cur_node   = cloned_element || element;
            var clonedNode = (cloned_element)?cloned_element:element.cloneNode(true);
                
            // dummy objekt erstellen falls nÃ¶tig
            if(!Element.exists("dd_dummy_object")) {
                dd_dummy = Element.create("div");
                dd_dummy.className = 'dragged';
                dd_dummy.id = "dd_dummy_object";
                Element.bind(dd_dummy,"body");
            } else 
                dd_dummy = Element.get('dd_dummy_object');

            Element.attrib(dd_dummy,"style",{
                position:'absolute',
                height:cur_node.offsetHeight+"px",
                width:cur_node.offsetWidth+"px",
                zIndex:1000000,
                display:'block'
            });

            if(!Element.exists("display_dummy_object")) {
                display_dummy = Element.create('span');
                display_dummy.id = "display_dummy_object";
                
                Object.extend(display_dummy_attrib,{
                    width:(cur_node.offsetWidth)+"px",
                    height:(cur_node.offsetHeight)+"px"
                });
                
                Element.attrib(display_dummy,"style",display_dummy_attrib);
                Element.bind(clonedNode,dd_dummy);

                if(!cloned_element)
                    element.style.display = 'none';
                
                Element.attrib(dd_dummy,"style",
                {left:dragged_element.coords[0]+"px",
                 top:dragged_element.coords[1]+"px"});
            } else
                display_dummy = Element.get('display_dummy_object');

            moved = true;
        }

        var mc = getMouseCoords(e);
        var nx = mc.mx-clickedX; // neue x coordinate
        var ny = mc.my-clickedY; // neue y coordinate

        // Ã¼bergibt dem Observer die Maus Koordinaten
        if(move_method) move_method(nx,ny);
                                        
        Element.attrib(dd_dummy,"style",{
            left:nx+"px",
            top:ny+"px"
        });
        
        var mx = nx+dd_dummy.offsetWidth/2;  // mitte x
        var my = ny+dd_dummy.offsetHeight/2; // mitte y
        
        cur_con = null;
        var childs = null
                    
        for(var i = 0 ; i < containers.length;i++){
            var container_coords = containers[i].getContainerCoords(); 
            
            with(container_coords) {
                if(mc.mx >= posX && mc.mx <= posX+w &&
                   mc.my >= posY && mc.my <= posY+h) {
                    // container gefunden
                    cur_con = containers[i];

                    childs  = cur_con.getChilds();
                    break;1
                }
            }
        } 
        
        if( !cur_con ) {
            if(last_container) {
                for(var i = 0 ; i < containers.length;i++) {
                    containers[i].checkForUpdate();
                }
            }
            return false;
        } else {
            if(cur_con && !cur_con.getParam('drop')) {
                return false;
            }
        }
        
        last_container = cur_con;
          
        var before = null;

        // nun alle kinder des Containers abprÃ¼fen
        for(var i = 0 ; i < childs.length;i++) {
            
            if(childs[i][0] == element) continue;
            
            if(childs[i][1].posY+childs[i][1].h > my && 
               childs[i][1].posX+childs[i][1].w > mx){
                before = childs[i][0];
                break;
            }
        }

        if(cur_con) {
            if(before) {
                cur_con.getContainer().insertBefore(display_dummy,before);
            } else  {
                Element.bind(display_dummy,cur_con.getContainer());
            }
            
            if(window.getSelection) {
                var sel = window.getSelection();
                sel.removeAllRanges();
            }
        }
    };
                
    // maus losgelassen
    function dropElement (evt) {
        var e = evt || window.event;
        Element.stopEvent(e);

        Element.unlinkEvent(document,"mousemove",moveElement);
        Element.unlinkEvent(document,"mouseup",dropElement);
        
        elementDragged = false;
        if(!moved) return;
        
        if(display_dummy.parentNode) {

            if(cloned_element) {
                display_dummy.parentNode.insertBefore(cloned_element,display_dummy);
            } else {
                display_dummy.parentNode.insertBefore(element,display_dummy);
                element.style.display = '';
            }

            Element.unlink(display_dummy);
            display_dummy = null;
        }
        
        dd_dummy.innerHTML = "";
        moved = false;
        
        Element.attrib(dd_dummy,"style",{
            display:'none'
        });
                            
        if(drop_method) {
            drop_method.call({
                dropped_element: (cloned_element|| element ),
                drop_container:(cur_con)?cur_con.getContainer():start_con,
                start_con:start_con
            });
        };

        cloned_element = null;
    };
      
    function callOnMove(callback) {
        move_method = callback;
    };

    function callOnDrop(callback) {
        drop_method = callback;
    };
    
    // liefert ein Container Object zurÃ¼ck
    function getContainer(name){
        for(var i = 0 ; i < containers.length;i++)
            if(containers[i].getContainer().id == name)
                return containers[i];
    };
    
    function getContainers(){
    
        var args = arguments;
        
        return {
            setParam:function(params){
                for(var i = 0; i < args.length;i++) {
                    getContainer(args[i]).setParam(params);
                }
            },
            remove:function(){
                for(var i = 0; i < args.length;i++) {
                    removeContainer(args[i]);
                }
            },
            update:function(){
                for(var i = 0; i < args.length;i++) {
                    getContainer(args[i]).updateContainer();
                    addEvents( getContainer(args[i]) );
                }
            },
            list:function(msg){
            
                var list = "";
                for(var i = 0; i < containers.length;i++)
                    list += containers[i].getContainer().id+" ," ;
                    
                alert(msg+" "+list);
            }
        };
    };
    
    /**
     * fÃ¼gt einen bestehenden Container Object 
     * ein neues Container Object hinzu
     *@access public
     *@param new_container
     *@return void
     */
    function addContainer(new_container){
       
       if(new_container.constructor == Container && !containers.inArray(new_container)) {
            containers.push(new_container);
        } else {
            if(new_container.constructor == Array) {
            
                for(var i = 0; i < new_container.length;i++) {
                    containers.push(new Container(new_container[i]));
                }
                
            } else {
                if(Element.exists(new_container))
                    containers.push(new Container(new_container));
                else 
                    return;
            }
        }
        
        addEvents(containers[containers.length-1]);
    };
    
    /**
     * entfernt ein Container Element
     *@access public
     *@param String Container ID
     *@return void
     */
    function removeContainer(id){        
    
        var container = getContainer(id);
        if(!container) return;
        
        var childs = container.getContainer().childNodes;

        for(var i = 0 ; i < childs.length ; i++) {
            if(childs[i].nodeName == '#text') continue;
            Element.unlinkEvent(childs[i],'mousedown',dragElement);
        }

        containers = containers.deleteValue(container);
    };
    
    this.addContainer    = addContainer;
    
    this.removeContainer = removeContainer;
    
    this.getContainer    = getContainer;
    
    this.getContainers   = getContainers;
    
    this.callOnDrop      = callOnDrop;
};
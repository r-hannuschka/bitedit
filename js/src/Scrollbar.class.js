/**
* JavaScript Scrollbars Version 2
* 
* autor Ralf Hannuschka
* last modified 13.03.2009
*
* Version 2.1
*/
function Scrollbar(config) {

    var windowFrame     = null;
    
    var scrollArea      = null;
    var slider          = null;
    var scrollbarActive = false;
    
    var updateonmove    = null;
    var updateondrop    = null;
    
    var direction       = config.direction;
    
    var bMouseKeyDown = false;
    var bMouseKeyUp   = true;
    
    var scrollbarConfig = {
        displayWindow:{dim:[],position:[],node:null},
        scrollbarContainer:{dim:[],position:[],node:null},
        innerDocument:{dim:[],position:[],node:null},
        scroll_ground:{dim:[],node:null},
        lineHeight:0
    };

    function stopEvent (e) {    
        if(e.preventDefault) e.preventDefault();
        else                 e.returnValue = false;

        if(e.stopPropagation) e.stopPropagation();
        else                  e.cancelBubble = true;
    };

    function scrollSlider() {
        var innerDoc  = null;
        var sliderPos = this.sliderValue().sliderPosition();

        with(scrollbarConfig) {
        
            if(config.direction == "vertical") {
                var movedTop = sliderPos.top;
                innerFrametop = movedTop*innerDocument.dim[1]/scroll_ground.dim[1];

                Element.attrib(innerDocument.node,"style",{
                    position:"relative",
                    top:-innerFrametop+"px"
                });

            } else {
            
                var movedLeft = sliderPos.left;
                innerFrameLeft = movedLeft*innerDocument.dim[0]/scroll_ground.dim[0];

                Element.attrib(innerDocument.node,"style",{
                    position:"relative",
                    left:-innerFrameLeft+"px"
                });
            }
            
        }
    };

    function enableEvents(){
    
        Element.addEvent(Element.get(config.scrollButtons[0]),"click",scrollButton);
        Element.addEvent(Element.get(config.scrollButtons[1]),"click",scrollButton);
        Element.addEvent(Element.get(config.scrollGround),"click",scrollPage);

        // mousedown events abfangen
        Element.addEvent(Element.get(config.scrollButtons[0]),"mousedown",scrollButtonAuto);
        Element.addEvent(Element.get(config.scrollButtons[1]),"mousedown",scrollButtonAuto);        
        
        Element.addEvent(Element.get(config.scrollButtons[0]),"mouseup",scrollButtonAutoStop);
        Element.addEvent(Element.get(config.scrollButtons[1]),"mouseup",scrollButtonAutoStop);
        
        Element.addEvent(Element.get(config.scrollGround),"mousedown",stopEvent);

        if(config.direction == "vertical") {      
            if(/firefox/i.test(navigator.userAgent))
                Element.addEvent(config.innerDocument,"DOMMouseScroll",scrollMouseWheel);
            else 
                Element.addEvent(config.innerDocument,"mousewheel",scrollMouseWheel);
        }
    };

    function scrollButtonAutoStop(evt){
        var e = evt      || window.event;
        var t = e.target || e.srcElement;
        
        Element.stopEvent(e);
        
        bMouseKeyUp   = true;
        bMouseKeyDown = false;
    };
    
    function scrollButtonAuto(evt) {
        var e = evt || window.event;
        var t = e.target || e.srcElement;
        
        Element.stopEvent(e);
        
        if(!scrollbarActive) return false;
        
        var move_page_distance = 0;
        
        if(t.id == config.scrollButtons[0]) {
            move_page_distance = -config.lineHeight;
        } else {
            move_page_distance = config.lineHeight;
        }
        
        bMouseKeyUp = false;
        
        function scrollButtonOnMouseDown(){
        
            if(bMouseKeyDown) {
                movePageDistance(move_page_distance);
                window.setTimeout(scrollButtonOnMouseDown,60);
            }
            
        };
        
        window.setTimeout(function(){
            if(!bMouseKeyUp) { 
                bMouseKeyDown=true;
                scrollButtonOnMouseDown(); 
            } 
        },300);
    };
    
    /**
    * Scrollbutton wurde gedrückt somit wird der scrollbalken um 1 Zeilenhöhe verschoben
    *@access private
    *@params Event MouseEvent
    *@return void
    */
    function scrollButton(evt){
    
        var e = evt      || window.event;
        var t = e.target || e.srcElement;
        
        Element.stopEvent(e);
        
        if(!scrollbarActive) return false;
        
        var distance = 0;

        if(t.id == config.scrollButtons[0]) // links scrollen oder hoch 
            distance = -config.lineHeight;
        else // rechts oder nach unten scrollen 
            distance = config.lineHeight;

        var moveDistance = distance*scrollbarConfig.scroll_ground.dim[1]/scrollbarConfig.innerDocument.dim[1];
                
        slider.moveSliderDistance(moveDistance);
    };

    function scrollPage(evt){
        var e = evt || window.event;
        var t = e.target || e.srcElement;
        
        stopEvent(e);
        
        if(!scrollbarActive) return false;
        
        if(config.direction == "vertical") {
            var clicked_y = e.clientY;
            
            var coords = Element.getCoords(config.scrollLayer);

            if(clicked_y < coords.posY) slider.moveSliderDistance(-coords.h);
            else                        slider.moveSliderDistance(coords.h);
        } else {
            var clicked_x = e.clientX;
            var coords = Element.getCoords(config.scrollLayer);

            if(clicked_x < coords.posX) slider.moveSliderDistance(-coords.w);
            else                        slider.moveSliderDistance(coords.w);
        }
    };

    function scrollMouseWheel(evt) { 
        var e = evt || window.event;
        var distance = 0;
        
        Element.stopEvent(e);
        if(!scrollbarActive) return false;

        if(e.wheelDelta) { // Opera und so
            if(e.wheelDelta/120 < 0) { // mausrad wurde nach unten gedreht 
                distance = config.lineHeight*3;
            } else { // mausrad wurde nach oben gedreht 
                distance = -config.lineHeight*3;
            }
        } else { // Firefox 
            if(e.detail/3 < 0) { // mausrad wurde nach oben gedreht
                distance = -config.lineHeight*3;
            } else { // mausrad wurde nach unten  gedreht
                distance = config.lineHeight*3;
            }
        }

        with(scrollbarConfig) {
            var moveDistance = distance*scroll_ground.dim[1]/innerDocument.dim[1];
        }
        
        slider.moveSliderDistance(moveDistance);
    };

    function getProperties () {            
        with(scrollbarConfig) {
            var sR_width  = displayWindow.dim[0]*scroll_ground.dim[0]/innerDocument.dim[0];
            var sR_height = displayWindow.dim[1]*scroll_ground.dim[1]/innerDocument.dim[1];
        };
        
        return {
            scrollerHeight:sR_height,
            scrollerWidth:sR_width,
            padding:Element.getPadding(Element.get(config.scrollLayer))
        };
        
    };
    /**
           * vorbereiten des Scrollbalkens
           * Anpassung des Schiebe Reglers
           * Anlegen der Events
           *@access private
           *@return void
           */
    function prepareScrollbar() {
        var show_scrollbar = false;
            
        with(scrollbarConfig) {
        
            switch(config.direction) {
                case 'vertical':
                    if(innerDocument.dim[1] > displayWindow.dim[1]) {
                        var p = getProperties();
                        var h = p.scrollerHeight-(p.padding.top+p.padding.bottom)+"px";
                        Element.get(config.scrollLayer).style.height = h;
                        
                        show_scrollbar = true;
                    }
                break;
                case 'horizontal':
                    if(innerDocument.dim[0] > displayWindow.dim[0]) {
                        var p = getProperties();
                        var w = p.scrollerWidth-(p.padding.right+p.padding.left)+"px";
                        Element.get(config.scrollLayer).style.width = w;
                        
                        show_scrollbar = true;
                    }
                break;
            }
        
            if(!show_scrollbar) {
            
                Element.attrib(innerDocument.node,'style',{
                    position:'relative'
                });
                
                if(config.direction == 'vertical') {
                    Element.get(config.scrollLayer).style.top  = '0px';
                    innerDocument.node.style.top = '0px';
                } else {
                    Element.get(config.scrollLayer).style.left = '0px';
                    innerDocument.node.style.left = '0px';
                }
                
                Element.hide(Element.get(config.scrollLayer));
                
                scrollbarActive = false;
                
            } else {
            
                // IE 6 Bug bei Sliding Doors  Scroller , wenn die untere Höhe auf 100% festgelegt war skaliert sie nicht mit
                // darum wird der Regler leer geräumt und neu befüllt
                if(document.all && /msie/i.test(navigator.userAgent)) {
                    var test = Element.get(config.scrollLayer).innerHTML;
                    Element.get(config.scrollLayer).innerHTML = "";
                    Element.get(config.scrollLayer).innerHTML = test;
                }
                
                Element.show( Element.get(config.scrollLayer) );
                
                scrollbarActive = true;
            }
        }
    };
    
/* Public Methods
*********************************************************/   
    function resizeScrollbar(value){

        if(value < 1) return false;
        
        /* diese beiden Werte können wir aus der Slider Klasse beziehen
         **************************************************************/         
        var scrollGround = slider.getDimension().groundValue;     
        var scrollLayer  = slider.getDimension().sliderValue;
 
        with(scrollbarConfig) {           
            if(config.direction == "vertical") {
            
                /* Differenz von der alten Höhe des Scrollcontainers und des neuen Wertes
                 * um diese Höhe muss auch der Scrollbalken Grund verkleinert werden 
                 ************************************************************************/
                var dif = scrollbarContainer.dim[1]-value;
                
                Element.attrib(scrollbarContainer.node,"style",{height:value+"px"});
                
                Element.attrib(scrollGround.element,"style",{
                    height:(scrollGround.getDimension().height-dif)+"px"
                });        
                
                /* Scrollbalken vorbereiten 
                 ********************************/
                setScrollBarDimension();
                prepareScrollbar();

                /* Scrollregler vom wert oben anpassen
                 *************************************/
                var newTopvalue = innerDocument.pos[1]*(scrollGround.getDimension().height-dif)/innerDocument.dim[1];
                
                Element.get(config.scrollLayer).style.top = Math.abs(newTopvalue)+"px";
                
            } else {
            
                /* Differenz von der alten Weite des Scrollcontainers und des neuen Wertes
                                           *  um diese Weite muss auch der Scrollbalken Grund verkleinert werden 
                                           *****************************************************************/
                var dif = scrollbarContainer.dim[0]-value;
                
                Element.attrib(scrollbarContainer.node,"style",{width:value+"px"});
                Element.attrib(scrollGround.element,"style",{
                    width:(scrollGround.getDimension().width-dif)+"px"
                });    
                
                /* Scrollbalken vorbereiten 
                                             ********************************/                
                setScrollBarDimension();
                prepareScrollbar();
                
                /* Scrollregler vom wert oben anpassen
                                            **********************************/
                var newLeftvalue = innerDocument.pos[0]*(scrollGround.getDimension().width-dif)/innerDocument.dim[0];
                Element.get(config.scrollLayer).style.left = Math.abs(newLeftvalue)+"px";
            }
        };
        slider.refreshSlider();
    };
    
    function reloadScrollbar () {      
        updateScrollbarObject(scrollbarConfig.scrollbarContainer,true);
        
        var new_dim_scroll_container = scrollbarConfig.scrollbarContainer.dim;
        
        resizeScrollbar((direction == "vertical")?new_dim_scroll_container[1]:new_dim_scroll_container[0]);
    };
    
    function refreshScrollbar() {
        //updaten  vom Objekt innerDocument 
        updateScrollbarObject(scrollbarConfig.innerDocument,true);
        prepareScrollbar();
                
        if(scrollbarActive) slider.refreshSlider(); // nur aktualisieren wenn ein Slider existiert
    };
    
    function resetScrollbar(){
        if(scrollbarActive) refreshScrollbar();
        scrollPageStart();
    };

    function movePageDistance (distance) {
        if(distance && scrollbarActive) {
            with(scrollbarConfig) {
                if(config.direction == "vertical")
                    var moveDistance = distance*scroll_ground.dim[1]/innerDocument.dim[1];
                else 
                    var moveDistance = distance*scroll_ground.dim[0]/innerDocument.dim[0];
            }
                
            slider.moveSliderDistance(moveDistance);
        }
    };

    function moveSliderDistance (distance) {
        if(distance && scrollbarActive)
            slider.moveSliderDistance(distance);
    };
    
    function scrollPageStart() {
        updateScrollbarObject(scrollbarConfig.innerDocument,true);
        updateScrollbarObject(scrollbarConfig.displayWindow);
    
        if(scrollbarActive) {
            with(scrollbarConfig) {
                if(config.direction == "vertical") 
                    movePageDistance(innerDocument.pos[1]-displayWindow.pos[1]);
                else 
                    movePageDistance(innerDocument.pos[0]-displayWindow.pos[0]);
            }
        }
        
    };
    
    function scrollPageEnd() {
        updateScrollbarObject(scrollbarConfig.innerDocument,true);
    
        if(scrollbarActive) {
            with(scrollbarConfig) {
                if(config.direction == "vertical")
                    movePageDistance(innerDocument.dim[1]-displayWindow.dim[1]);
                else 
                    movePageDistance(innerDocument.dim[0]-displayWindow.dim[0]);
            }
        }
    };
    
    function getDimension(){
        return{
            displayWindow:scrollbarConfig.displayWindow,
            innerDocument:scrollbarConfig.innerDocument,
            scrollContainer:scrollbarConfig.scrollbarContainer,
            scrollLayer:slider.getDimension().sliderValue // der Scrollregler
        };
    };
    
    /**
            * gibt die verfügbare Dimension des Knoten wieders
            * ignore Padding sorgt dafür das das Padding ignoriert wird , bei dem innereren Document zählt es mit zur Höhe und darf nicht 
            * ignoriert werden bei dem Viewport allerdings ist das Padding Elementar , das padding verringert in dem Falle den sichtbaren Bereich
            *@access public
            *@param Html Node
            *@param boolean (ignore padding)
            *@return Array
            */
    function getAvailDimension(node,ignorePadding){
        var padding = Element.getPadding ( node ) ; 
        var border  = Element.getBorder  ( node ) ;
        
        var dim = Element.getCoords(node);

        if(ignorePadding) {
            return [dim.w,dim.h,dim.posX,dim.posY];
        } else {
            return [
                dim.w-(padding.left+padding.right),
                dim.h-(padding.top+padding.bottom),
                dim.posX,
                dim.posY
            ];
        }
    };
    
    function updateScrollbarObject(obj,ip){
        var d = getAvailDimension(obj.node,ip);

        obj.dim  = [d[0],d[1]];
        obj.pos  = [d[2],d[3]];
    };
    
    function setScrollBarDimension(){   
        with(scrollbarConfig) {
            var display_dim = getAvailDimension(Element.get(config.displayWindow));        // Anzeigebereich
            var inner_dim   = getAvailDimension(Element.get(config.innerDocument),true);   // Inneres Dokument 
            var scroll_dim  = getAvailDimension(Element.get(config.scrollContainer),true); // Fläche wo der gesammte Scrollbalken liegt
            var ground_dim  = getAvailDimension(Element.get(config.scrollGround));         // Fläche wo der Slider liegt        

            displayWindow.node = Element.get(config.displayWindow);
            displayWindow.dim  = [display_dim[0],display_dim[1]];
            displayWindow.pos  = [display_dim[2],display_dim[3]];
            
            innerDocument.node = Element.get(config.innerDocument);
            innerDocument.dim  = [inner_dim[0],inner_dim[1]];
            innerDocument.pos  = [inner_dim[2]-display_dim[2],inner_dim[3]-display_dim[3]];
                        
            scrollbarContainer.node = Element.get(config.scrollContainer);
            scrollbarContainer.dim  = [scroll_dim[0],scroll_dim[1]];
            scrollbarContainer.pos  = [scroll_dim[2],scroll_dim[3]];
            
            scroll_ground.node = Element.get(config.scrollGround);
            scroll_ground.dim  = [ground_dim[0],ground_dim[1]];

        }
    };

    function initScrollbar() {   
        /*
        * Scrollbalken Dimensionen setzen Padding und Rahmen werden bereits abgezogen
        * alles was übrig bleibt ist die verfügbare Höhe und Weite
        */
        setScrollBarDimension();
        
        prepareScrollbar();
        
        //neues SliderObjekt anlegen
        slider = new Slider({
            sliderLayer:config.scrollLayer,
            sliderGround:config.scrollGround,
            direction:config.direction
        });
        
        slider.updateOnMove(scrollSlider);
        
        if(updateondrop)
            slider.updateOnDrop(updateondrop);
            
        slider.initSlider();
        enableEvents();
    };
    
    function updateOnScrolled(cb){
        if(!slider)
            updateondrop = cb;
        else 
            slider.updateOnDrop(cb);
    };
    
    this.refreshScrollbar = refreshScrollbar;
    this.reloadScrollbar  = reloadScrollbar;
    this.resizeScrollbar  = resizeScrollbar;
    this.resetScrollbar   = resetScrollbar;
    
    this.initScrollbar    = initScrollbar;
    this.moveSlider       = moveSliderDistance;
    this.movePage         = movePageDistance;
    
    this.getDimension     = getDimension;
    
    this.scrollPageStart  = scrollPageStart;
    this.scrollPageEnd    = scrollPageEnd;
    
    this.updateOnScrolled = updateOnScrolled;
};
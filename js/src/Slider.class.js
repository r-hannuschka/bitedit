/**
* JavaScript Slider
* 
* autor Ralf Hannuschka
* last modified 01.08.2008
* version 1.2
*/
function Slider(sliderConfig) {
    if(!sliderConfig) return;

    var slider = null;
    var sliderObject = this;
    var dd_dummy = Element.create("div"); // drag drop dummy;
    var dragged_x = 0;
    var dragged_y = 0;
    var sliderDragged   = false;
    var updateListener  = new Array();
    var updateondrop    = null;

    try {
        var sliderProperties = (function (sliderConfig) {

            var config = {
                direction:null,
                sliderGround:{},
                sliderSource:{},
                sliderDummy:{left:0,top:0}
            };

            if(!Element.exists(sliderConfig.sliderGround)) 
                throw "Element"+sliderConfig.sliderGround+"existiert nicht";

            try {
                slider = Element.get(sliderConfig.sliderLayer);
            } catch (e) {
                throw "es konnte kein Slider gefunden werden";
            }

            if(!sliderConfig.direction && sliderConfig.direction != "vertical" && sliderConfig.direction != "horizontal")
                throw "geben sie die Ausrichtung an 'vertical' oder 'horizontal'";
                        
            config.direction = sliderConfig.direction; 

            with(sliderConfig){
                /* Slider Grundeigenschaften
                                            **********************************************/
                var sG = Element.get(sliderGround);
                Object.extend(config.sliderGround,calcGroundProperties(sG));

                config.sliderGround.element   = sG;
                config.sliderGround.direction = direction;

                /* Slider Eigenschafen
                                            *********************************************************/
                var sliderCoords = Element.getCoords(slider);

                config.sliderSource.element = slider;
                config.sliderSource.left = 0;
                config.sliderSource.top  = 0;
                
                config.sliderSource.width  = slider.offsetWidth;
                config.sliderSource.height = slider.offsetHeight;
            }
            
            return config;
        })(sliderConfig);

    } catch (error) { alert("Fehler"+error.message); return false; };

    var getSliderValues = new GetSliderProperties();
    var groundDimension = getSliderValues;

    /**
           * Grundwerte des Slidergrounds berechnen
          *@access private
          *@params Sliderground Layer HTML Object
          *@return Object for sliderConfig.sliderGround
          */
    function calcGroundProperties (sliderground) {
    
        var slider_ground_coords = Element.getCoords(sliderground);
        var sliderGround_Padding = Element.getPadding(sliderground);

        return {
            ground_x:slider_ground_coords.posX+sliderGround_Padding.left,
            ground_y:slider_ground_coords.posY+sliderGround_Padding.top,
            groundWidth:sliderground.clientWidth-(sliderGround_Padding.left+sliderGround_Padding.right),
            groundHeight:sliderground.clientHeight-(sliderGround_Padding.top+sliderGround_Padding.bottom)
        }
        
    };

        /* Innere Klasse GetSliderProperties
    ****************************************************/
    function GetSliderProperties() {

        function calcPercentValue(){

            var percentHorizontal = 0;
            var percentVertical   = 0;

            with(sliderProperties){
                var maxWidth  = sliderGround.groundWidth-sliderSource.width;
                var maxHeight = sliderGround.groundHeight-sliderSource.height;
                
                percentHorizontal = sliderSource.left*100/maxWidth;
                percentVertical   = sliderSource.top*100/maxHeight;
            };
            
            return {
                percentX:percentHorizontal,
                percentY:percentVertical
            };
        };

        /* public Methods
        ******************************************/
        function percentValue () {
            return calcPercentValue();
        };

        function sliderValue() {
            return {
                element:sliderProperties.sliderSource.element,
                sliderPosition:function () {
                    with(sliderProperties) {
                        var l = 0;
                        var t = 0;
                        
                        if(sliderGround.direction == "vertical") t = sliderSource.top;
                        else                                     l = sliderSource.left;
                        
                        return {
                            left:l,
                            top:t,
                            right:sliderGround.groundWidth-(sliderSource.width+l),
                            bottom:sliderGround.groundWidth-(sliderSource.height+t)
                        };
                    };
                },
                getDimension:function(){
                    return {
                        height:sliderProperties.sliderSource.height,
                        width:sliderProperties.sliderSource.width
                    };
                }
            };
        };
        
        function getGroundProperties(){
            // Object sliderProperties.sliderGround mit neuen werten befüllen
            try {
                Object.extend(sliderProperties.sliderGround,calcGroundProperties(sliderProperties.sliderGround.element));
            } catch (e) {
            }
            
            return {            
                element:sliderProperties.sliderGround.element,
                getDimension:function(){
                    with(sliderProperties) {
                        return {
                            padding:Element.getPadding(sliderGround.element),
                            height:sliderGround.groundHeight,
                            width:sliderGround.groundWidth
                        };
                    };
                },
                getPosition:function(){
                    return {
                        posX:sliderProperties.sliderGround.ground_x,
                        posY:sliderProperties.sliderGround.ground_y
                    };
                }
            }
        };

        function dummyPosition () {
            return {
                top:sliderProperties.sliderDummy.top,
                left:sliderProperties.sliderDummy.left
            }
        };

        function getSliderDirection () {
            return sliderProperties.sliderGround.direction;
        };

        this.sliderDirection     = getSliderDirection;
        this.getGroundProperties = getGroundProperties;
        this.sliderValue         = sliderValue; // sliderPosition;
        this.dummyPosition       = dummyPosition;
        this.percentValue        = percentValue;
    };

    function addEvents (sliderObj) {
        Element.addEvent(sliderObj,'mousedown',dragSlider);
        Element.addEvent(document,'mouseup',dropSlider);
        Element.addEvent(document,'mousemove',calcSliderPosition);
    };

    function getMousePosition (e) {
        if(e.pageX && e.pageY) return { x:e.pageX, y:e.pageY };
        else {
            return {
                x:e.clientX+document.body.scrollLeft-document.body.clientLeft,
                y:e.clientY+document.body.scrollTop-document.body.clientTop
            }
        }
    };

    function dragSlider(evt) {
        var e = evt || window.event;

        var mouse_coords = getMousePosition(e);
        Element.stopEvent(e);

        var sliderPos = Element.getCoords(slider);
        
        dragged_x =  mouse_coords.x-sliderPos.posX;
        dragged_y =  mouse_coords.y-sliderPos.posY;

        /* Drag Drop Dummy einbinden
                        *****************************************/
        Element.attrib(dd_dummy,"style",{
            display:'block',
            position:'absolute',
            left:sliderPos.posX+"px",
            top:sliderPos.posY+"px",
            zIndex:1000000000
        });

        Element.attrib(slider,'style',{
            left:"0px",
            top:"0px"
        });

        Element.bind(slider.cloneNode(true),dd_dummy);
        Element.bind(dd_dummy,"body");

        slider.style.visibility = "hidden";
        sliderDragged = true;
    };

    function dropSlider(evt) {
        if(!sliderDragged) return false;

        dd_dummy.innerHTML = "";
        Element.unlink(dd_dummy);

        slider.style.visibility = "visible";

        var e = evt || window.event;
        var t = e.target || e.srcElement;
        
        sliderObject.sliderDropped.call(getSliderValues.sliderValue().sliderPosition(),slider);
        sliderDragged = false;
        
        if(updateondrop) updateondrop();
    };

    function calcSliderPosition(evt) {
        if(!sliderDragged) return false;

        var e = evt || window.event;
        var t = e.target || e.srcElement;
        var mouse_coords = getMousePosition(e);

        with(sliderProperties) {
            sliderDummy.top  = mouse_coords.y-dragged_y;
            sliderDummy.left = mouse_coords.x-dragged_x;
            
            var dim = groundDimension.getGroundProperties().getPosition();
            
            sliderSource.left = mouse_coords.x-dragged_x-(dim.posX);
            sliderSource.top  = mouse_coords.y-dragged_y-(dim.posY);
        };

        cords = new Object();
        Object.extend(cords,dim);
        Object.extend(cords,groundDimension.getGroundProperties().getDimension());
        checkOverFlow.apply(cords);

        sliderObject.setSlider.call(getSliderValues,updateListener);
    };

    function moveSliderForDistance (distance) {

        with(sliderProperties) {
            sliderSource.left += distance;
            sliderSource.top  += distance;
        }

        cords = new Object();
        Object.extend(cords,groundDimension.getGroundProperties().getPosition());
        Object.extend(cords,groundDimension.getGroundProperties().getDimension());
        checkOverFlow.apply(cords);

        // den Slider gleich an die aktuelle Position legen
        sliderObject.sliderDropped.call(getSliderValues.sliderValue().sliderPosition(),slider);

        for(var i = 0 ; i < updateListener.length;i++) {
            updateListener[i].call(getSliderValues);
        }
    };

    function checkOverFlow() {
        /**
                     * Rahmen von der Slidergrundfläche berechnen
                     * damit der Drag and Drop Dummy keine falschen Werte bekommt
                     */
        var border_l = 0;
        var border_t = 0;

        with(sliderProperties.sliderGround) {
            if(element.clientLeft || element.clientLeft == 0)
                border_l = element.clientLeft;
            else { // für den FF 2.0 
                border_l = parseInt(Element.cssValue(element,"border-left-width"));
            }
                
            if(element.clientTop || element.clientTop == 0)
                border_t = element.clientTop; 
            else {  // für den FF 2.0 
                border_t = parseInt(Element.cssValue(element,"border-top-width"));
            }
        }
        
        with(sliderProperties) {
            var percent = getSliderValues.percentValue();

            if(percent.percentY <= 0) {
                sliderSource.top = 0;
                sliderDummy.top  = this.posY+border_t;

            } else if (percent.percentY >= 100) {
                sliderSource.top = this.height-sliderSource.height;
                sliderDummy.top  = this.posY+border_t+this.height-sliderSource.height;
            }
            
            if (percent.percentX <= 0) {
                sliderSource.left = 0;
                sliderDummy.left  = this.posX+border_l;
            } else if (percent.percentX >= 100) {
                sliderSource.left = this.width-sliderSource.width;
                sliderDummy.left  = this.posX+border_l+this.width-sliderSource.width;
            }
        }
    };

/* Public Methods
*******************************************/
    function setSlider(){

/* vertikaler Slider
*******************************************/
        if(this.sliderDirection() == "vertical") {
            dd_dummy.style.top  = this.dummyPosition().top+"px";
        }

/* horizontaler Slider
*******************************************/
        if(this.sliderDirection() == "horizontal") {
            dd_dummy.style.left = this.dummyPosition().left+"px";
        }

        for(var i = 0 ; i < updateListener.length;i++) {
            updateListener[i].call(this);
        }
    };

    function sliderDropped(slider) {
        Element.attrib(slider,"style",{
            left:this.left+"px",
            top:this.top+"px"
        });
    };

    function moveSliderDistance(distance){
        moveSliderForDistance(distance);
        
        if(updateondrop) updateondrop();
    };

    function updateOnMove(func) {
        updateListener.push(func);
    };

    function setPosition (position) {
    
        with(sliderProperties) {
            var dim = groundDimension.getGroundProperties().getDimension();
            
            if(position == "bottom" || position == "right") {
                // ans ende legen
                if(direction == "vertical") moveSliderForDistance((dim.height-sliderSource.height));
                else                        moveSliderForDistance((dim.width-sliderSource.width));
            } else {
                if(position == "center") {
                    if(direction == "vertical") moveSliderForDistance((dim.height/2-sliderSource.height/2));
                    else                        moveSliderForDistance((dim.width/2-sliderSource.width/2));
                }
            }
        }
    };
    
    function getDimension(){
        return {        
            sliderValue:getSliderValues.sliderValue(),
            groundValue:getSliderValues.getGroundProperties()
        }
    };
    
    function updateOnDrop (func) {
        updateondrop = func;
    };
       
    // Slider wird an die richtige Position gerückt
    function refreshSlider(){
    
        with(sliderProperties) {        
            Object.extend(sliderGround,calcGroundProperties(sliderGround.element));

            var sliderCoords = Element.getCoords(slider);
            
            sliderSource.top    = sliderCoords.posY-sliderGround.ground_y;
            sliderSource.left   = sliderCoords.posX-sliderGround.ground_x;

            sliderSource.width  = sliderCoords.w;
            sliderSource.height = sliderCoords.h;
            
            var dim = groundDimension.getGroundProperties().getDimension();  
            
            var sliderDimension_v = sliderSource.top+sliderSource.height;
            
            var sliderDimension_h = sliderSource.left+sliderSource.width;
                
            if(sliderGround.direction == "vertical") {            
                if(sliderDimension_v-dim.height > 0) 
                    moveSliderForDistance(-(sliderDimension_v-dim.height));
                else if(sliderSource.height == 0 && sliderSource.top > 0) 
                    moveSliderForDistance(-sliderSource.top);
                    
            } else {
                if(sliderDimension_h-dim.width > 0) 
                    moveSliderForDistance(-(sliderDimension_h-dim.width));
                else if(sliderSource.width == 0 && sliderSource.left > 0) 
                    moveSliderForDistance(-sliderSource.left);
            }
        }
    };

    function initSlider(){
        addEvents(slider);
    };

    this.sliderDropped      = sliderDropped;
    this.moveSliderDistance = moveSliderDistance;
    this.setSlider          = setSlider;
    this.updateOnMove       = updateOnMove;
    this.updateOnDrop       = updateOnDrop;
    this.refreshSlider      = refreshSlider;
    this.setPosition        = setPosition;
    this.getDimension       = getDimension;
    this.initSlider         = initSlider;
};
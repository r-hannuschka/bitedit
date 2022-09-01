/*
* Samelsurium von Hilfs Funktionen 
*@author Ralf Hannuschka
*/    
RegExp.prototype.replaceCallback = function (sElement,fCallback) {
    this.matches = this.exec(sElement);
    return fCallback.call(this);
};

/**
 * ein Array mit Inhalten clonen lassen
 * wichtig nochmal zur durchsicht mit mehreren Arrays und Tiefen Rekursion ob das notwendig ist
*@access public
*@return Array
*/
Array.prototype.clone = function () {
    var cloned_array = [];
                
    for(var i = 0 ; i < this.length;i++) {
        cloned_array[i] = this[i];
    }
    return cloned_array;
};

Date.prototype.getDaysOfMonth = function () {
    var curMon = this.getMonth();
    var day = 28; //28 Tage hat auf jeden Fall jeder Monat
    do {   
        this.setDate(++day);                      
    } while (curMon == this.getMonth());
    return --day;
};

Date.prototype.getWeek = function () {
    var date   = new Date();
    var curMon = this.getMonth();
    var days   = this.getDate();
    var curWeekDay = (this.getDay() == 0)?7:this.getDay();

    for(var i = curMon ; i > 0 ; i--) {        
        date.setMonth((curMon-i));
        days += date.getDaysOfMonth();
    }

    var lastDaysOfYear = days-curWeekDay;
    var weeks = 1;

    if(lastDaysOfYear > 0 ) {
        while (lastDaysOfYear > 0){
           weeks++;
           lastDaysOfYear-=7;
        }
    }

    date.setDate(4); date.setMonth(0);
    if( (date.getDay()==0?6:date.getDay()-1 ) < 3) weeks--;

    return (weeks == 0)?52:weeks;
};

Date.prototype.getFullYear = function () {    
    if(navigator.appName == 'Microsoft Internet Explorer') {
        if(this.getYear() < 100) 
            return 1900+this.getYear();
        else 
            return this.getYear();
    } else {
        if(this.getYear() < 1000)
            return this.getYear()+1900;
        else
            return this.getYear();
    }
};

Array.prototype.arrayKey = function (search) {
    for(var i = 0 ; i < this.length;i++)
        if(this[i] == search) return i;
};

Array.prototype.inArray = function (search) {
    for(var i=0;i < this.length;i++) {
        if(this[i] == search) return true;
    }
    return false;
};

Array.prototype.merge = function () {
    for(var i = 0 ; i < arguments.length;i++) {
        for(var j = 0 ; j < arguments[i].length;j++) {
            this.push(arguments[i][j]); 
        }
    }
};

Array.prototype.deleteValue = function (search) {
    var buffer = new Array();
    for(var i = 0;i < this.length;i++) {
        if(typeof this[i] == "function" || typeof this[i] == "object") {
            if(this[i] != search) buffer.push(this[i]);
        } else {
            if(this[i].toLowerCase() != search.toLowerCase())
                buffer.push(this[i]);
        }
    }
    return buffer;
};

var ObjectSort = (
    function () {
        var object       = null;
        var objectArray  = new Array();
        var sortedObject = null;
        var found        = false;
        var path         = new Array();
        var objectPath       = '';

        function getPath (obj,s) {
        
            for(key in obj) {
                        
                if(!obj[key].nodeType && obj[key].constructor && obj[key].constructor == Object) {
                                
                        path.push(key);
                        getPath(obj[key],s);
                        
                        if(!found)
                            path.pop();
                } else {
                    if(key == s) {
                        found = true;
                    }
                }
                if(found) {
                    break;
                }
            }
            return false;
        };

        function quickSort(lo,hi) {
            var pivot = eval('object.'+objectArray[hi]);
            var i = lo; 
            var j = hi;

                while (i <= j) {
                    while (eval('object.'+objectArray[i]) < pivot) i++;
                    while (eval('object.'+objectArray[j]) > pivot) j--;
                    
                    if(i <= j) {
                        var tmp = objectArray[j];
                        objectArray[j] = objectArray[i];
                        objectArray[i] = tmp;
                        i++;
                        j--;
                    }
                }

                if (lo<j) quickSort(lo,j);
                if (hi>i) quickSort(i,hi);
        };

        function sortObject(){
            var temp = null;
            quickSort(0,objectArray.length-1);

            //alles wieder in ein Object umwandeln
            var buffer = {};
            for(var i = 0 ; i < objectArray.length;i++) {
                var key = /([^\.]+)/.exec(objectArray[i])[0];
                buffer[key] = object[key];
            }
            
            object = buffer;
            delete buffer;
            return object;
        };

        return {
            sort:function (objectToSort,searchValue) {
                object = objectToSort;
                objectArray = (
                    function () {
                        getPath(object,searchValue);
                        
                        path.shift();
                        var temp = new Array();
                        //pfad erstellen
                        objectPath = path.join('.');
                        
                        var count = 0;
                        
                        for(key in object) {
                            
                            try {
                                var objp = (objectPath != '')?'.'+objectPath:'';
                                
                                if(eval("object."+key+objp)) {
                                    temp.push(key+objp+'.'+searchValue);
                                }
                            } catch (e) {
                                return null;
                            };
                            
                        }
                        return temp;
                    }
                )();
                return sortObject();
            },
            getObjectArray:function(){
                if(objectArray)
                    return objectArray;
                else 
                    return null;
            },
            getObjectArrayDesc:function(){
                if(objectArray) {
                    var b = new Array();
                    for(var i = objectArray.length-1 ; i >=0;i--) {
                        b.push(objectArray[i]);
                    }
                    return b;
                }
            }
        }
    }
)();

var DOM = {
    domCheck:false,
    domReady:false,
    inRow:new Array(),
    loaded:function (func) {
        DOM.inRow.push(func);
        if(!DOM.domCheck) {
            (function(){
                DOM.domCheck = true;

                if(document.all && /msie/i.test(navigator.userAgent)) {
                    document.write("<script type='text/javascript' id='dummyScript' defer src='javascript:void(0);'><\/script>");
                    var ds = document.getElementById("dummyScript");

                    ds.onreadystatechange = function () {
                        if(this.readyState == "complete") {
                            DOM.domReady = true;
                            domLoaded();
                        }
                    };
                } else {
                    document.addEventListener("DOMContentLoaded",function () { DOM.domReady = true;domLoaded(); },false);
                }
                return null;
            })();
        } else {
            if(DOM.domReady) {
                func();
            }
        }

        function domLoaded(){
            for(func in DOM.inRow) DOM.inRow[func]();
        };
    }
};

function removeElementFromObject (name,object) {
    var buffer = {};
    
    for(var key in object) {
        if(key == name) continue;
        buffer[key] = object[key];
    }
    
    return buffer;
};

Object.extend = function (ObjectName,source) {
    for(var property in source) {
        ObjectName[property] = source[property]; 
    }
};

var Regexp = {
    datePattern:/^([0-2][0-9]\.|(3(0\.(?=[\d]{1,2})|1\.(?!(04|06|09|11))))(?!02))(0[1-9]|1[0-2])\.(\d{4})$/g,
    simpleDate:/^\d{2}\.\d{2}\.\d{4}$/g,
    timerpattern:/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
    mail:/^([\w\d\-\_\.]+)@([\w\d\-\_]+)\.([a-z]{2,3})$/,
    alpha:/^[a-zA-Z\s]+$/
};

if(!Element) var Element = new Object();
Object.extend(Element,{
        /**
                     *generate id for Element
                     *@access public
                     *@param int lenth id string
                     *@return String generated ID
                     */
        generateId:function (len) {
            var generatedId = '';
            var letter = true;
            
            for(var i = 0 ; i < len;i++){
                if(letter) {
                    
                    while (true) {
                        var letterCode = Math.round(Math.random()*122);
                        
                        if(letterCode >= 65 && letterCode <= 90 || letterCode >= 97 && letterCode <= 122) {
                            generatedId += String.fromCharCode(letterCode);
                            letter = false;
                            break;
                        }
                        
                    }
                    
                } else {
                
                    generatedId += Math.round(Math.random()*10).toString();
                    letter = true;
                    
                }
            }
            return generatedId;
        },

        trim:function (obj) {
            if(typeof obj == 'object') {
                obj.innerHTML = obj.innerHTML.replace(/^\s*/,'');
                obj.innerHTML = obj.innerHTML.replace(/\s*$/,'');
            } else {
                obj = obj.replace(/^\s*/,'');
                obj = obj.replace(/\s*$/,'');
            }
            return obj;
        },
        getElementAttribute:function (htmlObj,attrib,search) {
            var obj = htmlObj;
            var found = false;

            if(document.getElementById(search) && !attrib) return true; 
            if(!search && !attrib && document.getElementById(htmlObj)) return true;

            if(typeof obj != 'object') {
                 if(document.getElementById(htmlObj)) obj = document.getElementById(htmlObj);
                 else if (obj.toLowerCase() == 'body') obj = document.getElementsByTagName('BODY')[0];
                 else return false;
            }

            function searchObj (o) {
                for(var i = 0; i < o.childNodes.length;i++) {
                     if(o.childNodes[i].nodeName == '#text' || o.childNodes[i].nodeName == '#comment' )
                         continue;

                    with(o.childNodes[i]) {
                        if (getAttribute(attrib) == search) {
                            found = o.childNodes[i];
                        }
                        else 
                            if(childNodes.length > 0 && !found) 
                                found = searchObj(o.childNodes[i]);
                    }
                }
                return found;
            };
            return searchObj(obj);
        },
        /**
                     *HTML Element exists durchsucht den gegeben Container htmlObj nach 
                     *einen Element welches das Attribute search aufweist
                     * 
                     *@access public
                     *@params HTML object or String object id
                     *@params String searchvalue 
                     *@params String attribute Name default id attribute
                     *@return boolean
                     */
        exists:function(htmlObj,search,attrib) {
            var obj = htmlObj;
            var found = false;

            if(document.getElementById(search) && !attrib) return true; 

            if(!search && !attrib && document.getElementById(htmlObj)) return true;
            else return false;

            if(typeof obj != 'object') {
                 if(document.getElementById(htmlObj)) obj = document.getElementById(htmlObj);
                 else if (obj.toLowerCase() == 'body') obj = document.getElementsByTagName('BODY')[0];
                 else return false;
            }

            function searchObj (o) {
                for(var i = 0; i < o.childNodes.length;i++) {
                     if(o.childNodes[i].nodeName == '#text')
                         continue;

                    with(o.childNodes[i]) {
                        if (getAttribute(attrib) == search) 
                            found = true;
                        else 
                            if(childNodes.length > 0 && !found) searchObj(o.childNodes[i]);
                    }
                }        
                if(found) return true;
            };

            searchObj(obj);
            return found;
        },

        /**
        * create HTML Element
        * @access public 
        * @params String HTML name
        * @return object
        */
        create:function (n,string) {
            var el = document.createElement(n);
            if(typeof string == 'string') {
				el.innerHTML = string;
            }
            return el;
        },

        /**
                     *get HTML object over id
                     *@access public 
                     *@params String object id
                     *@return object
                     */
        get:function (id) {
            return (Element.exists(id))?document.getElementById(id):null;
        },

        getElements:function(element,htmlTag) {
            if(typeof element == 'object') 
                return element.getElementsByTagName(htmlTag);
            else 
                return Element.get(element).getElementsByTagName(htmlTag);
        },

        addEvent:function(element,type,func) {
            if(typeof element == 'string') {
                if(element.match(/body/i)) {
                    var triggerObj = document.getElementsByTagName('BODY')[0];
                } else {
                    var triggerObj = document.getElementById(element);
                }
            } else {
                var triggerObj = element;
            }

            if(document.addEventListener) { //gute Browser
            	 if(type.match(/^on/))  {
                    type = type.replace(/^on/,"");
                }
                triggerObj.addEventListener(type,func,false);
            } else { // IE
            	if(!type.match(/^on/)) type = "on"+type;
                triggerObj.attachEvent(type,func);
            }
        },

        /**
                     *delete Event Listener from Element
                     *@access public 
                     *@param HTML Object element
                     *@param String event type
                     *@param Function Object func
                     *@return void
                     */
        unlinkEvent:function(element,type,func) {
            if(typeof element == 'string') {
                if(element.match(/body/i)) {
                    var triggerObj = document.getElementsByTagName('BODY')[0];
                } else {
                    var triggerObj = document.getElementById(element);
                }
            } else {
                var triggerObj = element;
            }

            if(document.removeEventListener) { //gute Browser
            	if(type.match(/^on/))  {
                    type = type.replace(/^on/,"");
                }
                triggerObj.removeEventListener(type,func,false);
            } else { // IE
                if(!type.match(/^on/)) type = "on"+type;
                triggerObj.detachEvent(type,func);
            }
        },

        /**
                     *attach Attribute to HTML Element
                     *@access public           
                     *@params Object HTML Element
                     *@params String name of Attribute
                     *@params [String Attribute Value] [Object Attribute Values [only for style Attribute]]
                     *@return void
                     */
        attrib:function (obj,name,valObj) {
            
            if(typeof obj != 'object') 
                obj = Element.get(obj);

            if(!name.match(/style/i) ) {
                if(name == 'class' && navigator.appName == 'Microsoft Internet Explorer') {
                    name = 'className';
                }
                
                try {
                    obj.setAttribute(name,valObj);
                } catch (e) {
                }
            
            } else {

                for(var value in valObj) {

                    if(value == "cssFloat" && /msie/i.test(navigator.userAgent)) {
                        obj.style.styleFloat = valObj[value];
                    } else {
                        if( typeof valObj[value] == "object" ) {

                            var val = "";

                            for(var key in valObj[value]) {
                                val += valObj[value][key]+( (value == "padding" || value== "margin")?"px":"")+" ";
                            }

                            obj.style[value] = val;
                        } else 
                            obj.style[value] = valObj[value];
                    }
                }
            }
        },

        /**
                     *display Object on Document
                     *@access public
                     *@parcontinueams obj HTML object
                     *@return void
                     */
        show:function(obj) {
            if(typeof obj == 'object')
                obj.style.display = 'block';
            else 
                document.getElementById(obj).style.display = 'block';
        },
        
        /**    
                     *hide Object on Document
                     *@access public
                     *@params obj HTML object
                     *@return void
                     */
        hide:function(obj) {
            if(typeof obj == 'object')
                obj.style.display = 'none';
            else 
                document.getElementById(obj).style.display = 'none';
        },
        
        /**
                     *delete HTML Element from Document
                     *@access public
                     *@params Object HTML element
                     *@return void
                     */                       
        unlink:function (element) {
            element.parentNode.removeChild(element);
        },
        
        /**
                     *bind HTML object to HTML element
                     *@access public 
                     *@params Object HTML ObjT target Element
                     *@params Object HTML Obj bind to Element
                     *@return void
                     */
        bind:function (objT,objS) {        
            if(typeof objS == 'object') {
                objS.appendChild(objT);
            } else {
                try {
                    if(objS.match(/^body$/i)) {
                        document.getElementsByTagName('BODY')[0].appendChild(objT);
                    } else {
                        if(document.getElementById(objS)) {
                            document.getElementById(objS).appendChild(objT);
                        } else {
                            throw ('Element mit der ID '+objS+' ist nicht belegt');
                        }
                    }
                } catch (e) {
                    alert(e+"  "+objS);
                }
            }
        },

        /**
                     * position ermitteln 
                     * @access private
                     * @param Object HTML Object
                     * @return Object
                     */
        getCoords:function(htmlObj) {
            var body = false;
            
            if(typeof htmlObj == 'string' && !htmlObj.match(/(body|window)/i)) {
                var obj = Element.get(htmlObj);
            } else if (typeof htmlObj == 'object' && !htmlObj.nodeName.match(/(body|window)/i)) {
                var obj = htmlObj;
            } else {
                body = true;
            }

            var o = obj;
                        
            if(!body) {
                var left = 0;
                var top  = 0;
                var objW = obj.offsetWidth;
                var objH = obj.offsetHeight;
                                
                do {
                    left += obj.offsetLeft;
                    top  += obj.offsetTop;
                    
                    if(!/opera/i.test(navigator.userAgent) && obj != o) {
                        var bT = 0;
                        var bL = 0;
                    
                        if(!/msie/i.test(navigator.userAgent)) {
                            bT = parseInt(Element.cssValue(obj,"border-top-width"));
                            bL = parseInt(Element.cssValue(obj,"border-left-width"));
                        } else {
                            bT = parseInt(Element.cssValue(obj,"borderTopWidth"));
                            bL = parseInt(Element.cssValue(obj,"borderLeftWidth"));
                        }
                                                
                        if (bT)  top += bT;
                        if (bL) left += bL;
                    };
                    
                } while ( ( obj = obj.offsetParent) ); 
                                
                return {posX:left,posY:top,w:objW,h:objH};
            } else {
                var height       = window.innerHeight || document.documentElement.offsetHeight;
                var width        = window.innerWidth  || document.documentElement.offsetWidth;

                var scrollHeight = document.body.scrollTop  || window.pageYOffset;
                var scrollWidth  = document.body.scrollLeft || window.pageXOffset;

                return {w:width,h:height,sW:scrollWidth,sH:scrollHeight};
            }
        },
        
        /**
                        * aktuelle Mauskoordinaten zurück geben
                        *@aceess private
                        *@param Object Event
                        *@return void
                        */
        getMouseCoords:function (e){
            var x = e.pageX;
            var y = e.pageY;
                    
            if(!x && !y) {
                x = e.clientX+document.documentElement.scrollLeft;
                y = e.clientY+document.documentElement.scrollTop;
            }
            return {mousex:x,mousey:y};
        },
        
        /**
                        * Event bubbeling und standard Ausführung der Componenten verhindern 
                        * wie link.click()
                        *@aceess private
                        *@param Object Event
                        *@return void
                        */
        stopEvent:function(e){
            if(e.stopPropagation) e.stopPropagation();
            else e.cancelBubble = true;
                    
            if(e.preventDefault) e.preventDefault();
            else e.returnValue = false;
        },

        /**
        * Hilfsfunktion für Eventhandling
        * @access public
        * @param Object element , welches Object den Event ausl�st
        * @param String type , welcher Eventhandler kommt in Frage
        * @param String callBack , callBack Funktion welche den event verarbeitet
        * @param Object returnParams optionale R�ckgabe Parameter
        * @return object event;
        * @return object html object;
        */
        bindEvent:function(element,type,callBack,rP,onlyParams) {

            if(typeof element == 'string') {
                if(element.match(/body/i)) {
                    var triggerObj = document.getElementsByTagName('BODY')[0];
                } else {
                    var triggerObj = document.getElementById(element);
                }
            } else {
                var triggerObj = element;
            }

            var returnParams = rP;	
            var event        = type;
            try{
            	if(document.addEventListener) { //gute Browser
            	    if(type.match(/^on/))  {
                       event = type.replace(/^on/,"");
                    }
                    triggerObj.addEventListener(event,handleEvent,false);
            	} else { // IE
            	    if(!type.match(/^on/))	
                        event = "on"+type;
                    triggerObj.attachEvent(event,handleEvent);
            	}
            }catch(e){}

            function handleEvent (evt) {
                var event  = (evt)?evt:(window.event)?window.event:'';
 
                if(event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }

                var target = event.srcElement || event.currentTarget; 
                if(onlyParams) callBack.call(callBack,(returnParams)?returnParams:null);
                else           callBack.call(callBack,event,target,(returnParams)?returnParams:null);
            }
        },

       /**
                    *clear browser newlines form inner HTML
                    *@access public
                    *@params Object HTML Element
                    *@return Object HTML Element
                    */
        stripBreaks:function(obj) {
            obj.innerHTML = obj.innerHTML.replace(/>\s*/gm,'>'); 
            obj.innerHTML = obj.innerHTML.replace(/\s*</gm,'<'); 
            obj.innerHTML = obj.innerHTML.replace(/>\s*</gm,'><'); 
        },
        
       /**
                    *css Wert auslesen welche direkt in einen CSS File angegeben sein k�nnenclear
                    *@access public
                    *@params [Object htmlObject | String object id / name] 
                    *@paramsString name CSS 
                    *@return String CSS Value
                    */
        cssValue:function (htmlObj,name) {
        
            if(typeof htmlObj == 'string') {
                if(htmlObj.match(/body/i)) {
                    var obj = document.getElementsByTagName('BODY')[0];
                } else {
                    var objcontinue = document.getElementById(htmlObj);
                }
            } else {
                var obj = htmlObj;
            }
            
            if(window.getComputedStyle) {
                var val = window.getComputedStyle(obj,'').getPropertyValue(name);

                if(val) {
                    return val;
                }
                
            } else {
            
                if(obj.currentStyle && obj.currentStyle[name]){
                    return obj.currentStyle[name];
                }
                
            }
            
            return 0;
            
        }, // end cssValue
        
        /** get Element count from Object 1 lvl 
                         *
                         * @access public
                         * @param Object object to count
                         * @param String key muss �bergeben werden wenn ein Objekt mit 
                         *               der for(key in object) schleife durchlaufen wird
                         *               damit der Schl�ssel wieder vom Object zur�ck gesetzt
                         *               werden kann
                         * @return int object size
                         */
        objSize:function (obj,skey) {
            var count = 0;
            for(key in obj) count++;
            if(skey) key = skey;
            return count;
            
        }, // end objSize
        
        /**
                        * clone objects 
                        * startkey muss �bergeben werden wenn ein objekt durchlaufen wird
                        * in einer for key in Schleife damit der schl�ssel wieder auf 
                        * den Urspr�nglichen Wert zur�ck gesetzt wird.
                        * 
                        * @access public
                        * @param Object obj to clone
                        * @param String key from object
                        * @return Object clonedObject
                        */
        clone:function(obj,startKey) {  
            function cloneObject(objToClone) {   
                var subObj = new Object();
                
                for(var key in objToClone) {
                
                    if(objToClone[key].constructor &&  objToClone[key].constructor == Object) {
                    
                        subObj[key] = cloneObject(objToClone[key]);

                    } else {
                    
                        subObj[key] = objToClone[key];
                    
                    }
                    
                }
                
                if(startKey) key = startKey;
                
                return subObj;
            }
            return cloneObject(obj);
            
        }, // end clone
        getBorder:function(obj) {
        
            var b = {
                t:0,
                r:0,
                b:0,
                l:0
            };

            if(/msie/i.test(navigator.userAgent)) {
                b.t = parseInt(Element.cssValue(obj,"borderTopWidth"));
                b.r = parseInt(Element.cssValue(obj,"borderRightWidth"));
                b.b = parseInt(Element.cssValue(obj,"borderBottomWidth"));
                b.l = parseInt(Element.cssValue(obj,"borderLeftWidth"));

                b.t = (isNaN(b.t))?0:b.t;
                b.r = (isNaN(b.r))?0:b.r;
                b.b = (isNaN(b.b))?0:b.b;
                b.l = (isNaN(b.l))?0:b.l;
                
            } else {
                b.t = parseInt(Element.cssValue(obj,"border-top-width"));
                b.r = parseInt(Element.cssValue(obj,"border-right-width"));
                b.b = parseInt(Element.cssValue(obj,"border-bottom-width"));
                b.l = parseInt(Element.cssValue(obj,"border-left-width"));
            }
            return b;
        }
        ,
        getPadding:function (element,value) {    
        
            var align = value || "padding";
        
            var paddingValue = Element.cssValue(element,align);
            
            var padding = {
                top:0,
                right:0,
                bottom:0,
                left:0
            };
                
            if(navigator.userAgent.match(/(firefox|webkit)/gi)) { 
            
                // firefox,safari und Opera bekommen das padding , funktioniert nicht im  IE 
                padding.top    = parseInt(Element.cssValue(element,align+"-top"));
                padding.right  = parseInt(Element.cssValue(element,align+"-right"));
                padding.bottom = parseInt(Element.cssValue(element,align+"-bottom"));
                padding.left   = parseInt(Element.cssValue(element,align+"-left"));
                
            } else {
                // Element.cssValue gibt 0 zurück
            	if(!paddingValue) return padding;
                
            	// Opera und IE geben das Padding als String zurück Bsp "3px 0px 4px 2px"
                var paddingPattern = /([\d]+)/g;
                var paddingMatches = [];
                if(paddingMatches = paddingValue.match(paddingPattern)) {
                    switch(paddingMatches.length) {
                        case 2:
                            padding.top    = parseInt(paddingMatches[0]);
                            padding.right  = parseInt(paddingMatches[1]); 
                            padding.bottom = parseInt(paddingMatches[0]);
                            padding.left   = parseInt(paddingMatches[1]); 
                        break;
                        case 3:
                            padding.top    = parseInt(paddingMatches[0]);
                            padding.right  = parseInt(paddingMatches[1]); 
                            padding.bottom = parseInt(paddingMatches[2]);
                            padding.left   = parseInt(paddingMatches[1]); 
                        break;
                        case 4:
                            padding.top    = parseInt(paddingMatches[0]);
                            padding.right  = parseInt(paddingMatches[1]); 
                            padding.bottom = parseInt(paddingMatches[2]);
                            padding.left   = parseInt(paddingMatches[3]); 
                        break;
                        default:
                            padding.top    = parseInt(paddingMatches[0]);
                            padding.right  = parseInt(paddingMatches[0]);
                            padding.bottom = parseInt(paddingMatches[0]);
                            padding.left   = parseInt(paddingMatches[0]);
                    };
                }
            }
            
            return padding;
        },
        getMargin:function(element){
            var margin = this.getPadding(element,'margin');
            return [margin.top,margin.right,margin.bottom,margin.left];
        },
        getBorderColor:function(){
            
        }
    }
);
var Load = {
    send:true,
    imageFile:function(object) {
        var lIF_Values = new Array();
        var lIF_onProcess = false;
        var lIF_inProgress = null;
        var lIF_loaded    = null;
        var lIF_pS        = null;
        var lIF_pI        = null;
        var callback      = null;
        var callBackError = null;
        var returnparams  = null;
        var rpError       = null;

        if(typeof object == 'string') 
            lIF_Values.push(object);
        else 
            for(var i = 0 ; i < object.length ; i++) lIF_Values.push(object[i]);

        function loadSingleImage () {
            var imgFile = new Image(); 
                imgFile.onload = function () {
                    if(lIF_Values.length > 1) {
                        lIF_Values.shift();
                        window.setTimeout(loadSingleImage,25);
                    } else {
                        if(lIF_pS) Element.unlink(lIF_pS);

                        if(callback) callback.call(callback,object,(returnparams)?returnparams:null);
                    } 
                    imgFile.onload = function () {}; //war so bei der Lightbox2 gemacht
                }

                imgFile.onerror = function () {

                    if(callBackError) callBackError.call(callBackError,imgFile.src,(rpError)?rpError:'');

                    if(lIF_Values.length > 1) {
                        lIF_Values.shift();
                        window.setTimeout(loadSingleImage,25);
                    } else {
                        if(lIF_pS) Element.unlink(lIF_pS);
                    }
                }

            imgFile.src = lIF_Values[0];
        };

        this.initLoad = function (preloadlayer,cb,rp) {
            returnparams = rp;
            callback     = cb;
            lIF_pS       = preloadlayer;
            loadSingleImage();
        };

        this.callOnError = function (func,rp) {
            callBackError = func;
            rpError       = rp;
        };
    },
    ajaxContent:function (configFile) {    
        var config       = configFile;
        var callback     = null;
        var lAC_pS       = null;
        var returnparams = null;
        var http_request = null;

        function addPostParams(paramsObj) {
            var postParams = null;

            for(key in paramsObj) {
                if(!postParams) {
                    var g = null;

                    if(g = /(.*)(_isGroup)/.exec(key)) {

                        for(var j = 0 ; j < paramsObj[key].length;j++) {
                            if(postParams)
                                postParams += "&"+g[1]+"[]="+paramsObj[key][j];
                            else {
                                postParams = g[1]+"[]="+paramsObj[key][j];
                            }
                        }
                    } else {
                        postParams = key+"="+escape(paramsObj[key]);
                    }

                }
                else
                {
                    if(g = /(.*)(_isGroup)/.exec(key)) {
                        for(var j = 0 ; j < paramsObj[key].length;j++) {
                            postParams += "&"+g[1]+"[]="+paramsObj[key][j];
                        }
                    } else {
                        postParams += "&"+key+"="+escape(paramsObj[key]);
                    }

                }
            }

            return (postParams)?postParams:'';
        };

        function addGetParams (paramsObj) {
            var getParams = "";
            for(key in paramsObj) {
                if(!getParams && !(/\?/.test(config.path)) )
                    getParams = "?"+key+"="+escape(paramsObj[key]);
                else
                    getParams += "&"+key+"="+escape(paramsObj[key]);
            }
            return (getParams)?getParams:'';
        };

    function getAjaxContent(){
    
            if(window.XMLHttpRequest) 	
                http_request = new XMLHttpRequest();
            else 
                http_request = new ActiveXObject("Microsoft.XMLHTTP");

            if(config.method == 'POST') {
                http_request.open(config.method,config.path,true);
                http_request.setRequestHeader("Content-Type","application/x-www-form-urlencoded;");
                http_request.setRequestHeader("accept-charset","UTF-8;");
                http_request.setRequestHeader("X-Requested-With","xmlhttprequest");
                http_request.send(addPostParams(config.params));
            } else {
                var getParams = addGetParams(config.params);
                /*
                 * IE Fix:
                 * Der Internet Explorer cacht die Datei und läd sie neu so das die HTTP XML Request nie 
                 * ausgeführt wird. Somit noch einen Timestamp mit anhängen so das die Seite jedesmal
                 * neu geladen wird
                 */
                if(navigator.appName == 'Microsoft Internet Explorer') {  
                    var t = new Date();
                    if(getParams || config.path.match(/\?/gi)) {
                        getParams += '&'+Element.generateId(10)+'='+t.getTime();
                    } else {
                        getParams += '?'+Element.generateId(10)+'='+t.getTime();
                    }
                }

                http_request.open('GET',config.path+''+getParams,true);
                http_request.send(null);
            }

        http_request.onreadystatechange = function () {
            try {
                switch ( http_request.readyState ){
                    case 2:
                    break;
                    case 4:                    
                        if(http_request.status == 200) {
                            var requestVal = unescape(http_request.responseText);

                            /*Preloader entfernen soweit vorhanden */
                            if(lAC_pS) { 
                                Element.unlink(lAC_pS); 
                                lAC_pS = null;
                            }

                            if(callback) {
                                callback.call(callback,requestVal,returnparams);
                            }
                        }
                    break;
                }
                
           } catch (e) {
           }
        }
    };

        this.cancelRequest = function () {
            if(lAC_pS) {
                Element.unlink(lAC_pS);
                lAC_pS = null; 
            }
            http_request.abort();
            http_request = false;
        }
        
        this.initLoad = function (preloadlayer,cb,rp) {
            callback     = cb;
            returnparams = rp;
            lAC_pS       = preloadlayer;
            getAjaxContent();
        }
    },
    XMLDocument:function (file,callback,sync) {    
        var xmlRequest;
        var ie = false;
        
        try {
                       
            xmlRequest = new XMLHttpRequest();
            
            xmlRequest.open('GET',file,((sync || sync == "undefined" )?true:false));
            xmlRequest.send(null);
            
        } catch (e) {
            try {
                if(ActiveXObject) {
                    ie = true;
                    
                    xmlRequest = new ActiveXObject("Microsoft.XMLDOM");
                    xmlRequest.load(file);
                    
                } else {
                    return;
                }
                
            } catch (e) {
            }
            
        }    

        if( xmlRequest ) {             
            if(!sync && sync != "undefined") {
                callback(xmlRequest.responseXML);
            } else {
                xmlRequest.onreadystatechange = getData;
            }
        }
        
        function getData(){  
            if(xmlRequest.readyState == 4) {
                if(!ie) {
                    callback(xmlRequest.responseXML);
                } else {
                    callback.call(callback,xmlRequest);
                }
            }
        };
    }
}

/*
var Preloader = {
    createPreloadScreen:function (screenConfig) {

        var ground = Element.create('DIV');
        try{
            for(key in screenConfig.attrib) {
                Element.attrib(ground,key,screenConfig.attrib[key]);
            }

            for(key in screenConfig.subObj){
                var obj = Element.create(key);

                with(screenConfig.subObj[key]) {
                    for(val in attrib) {
                        Element.attrib(obj,val,attrib[val]);
                    }
                }
                Element.bind(obj,ground);
            }
        }catch(e){}

        return ground;
    },
    addPreload:function (loaderObject,preloadScreen,callback,rp) {
        var preloadContainer = Preloader.createPreloadScreen(preloadScreen);
            preloadContainer.style.display = "none";
        
        var c = Element.get(preloadScreen.addTo);
        Element.bind(preloadContainer,preloadScreen.addTo);

        if(preloadScreen.position == 'center') {
            c.style.position = 'relative';

            var pCW = parseInt(Element.cssValue(preloadContainer,'width'));
            var pCH = parseInt(Element.cssValue(preloadContainer,'height'));

            dCW = Element.get(preloadScreen.addTo).offsetWidth;
            dCH = Element.get(preloadScreen.addTo).offsetHeight;

            Element.attrib(preloadContainer,'style',{
                                                    position:'absolute',
                                                    top:(dCH/2-pCH/2)+'px',
                                                    left:(dCW/2-pCW/2)+'px',
                                                    display:'block'
                                                    });

        } else if (preloadScreen.position == 'appendbefore') {
            var container = Element.get(preloadScreen.addTo);
            container.parentNode.insertBefore(preloadContainer,container);
        }

        var loader = loaderObject;
            loader.initLoad(preloadContainer,Preloader.onReadyState,{cb:callback,rP:rp});

        this.cancelPreload = function () {
            loader.cancelRequest();
            loader = null;
        }
    },
    onReadyState:function (returnValue,returnObject) {
		try {
			returnObject.cb.call(returnObject.cb,returnValue,returnObject.rP);
		}catch (e) {
            alert(e);
        }
    }
}
*/

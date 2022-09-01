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

    function getAjaxContent() {
    
            if(window.XMLHttpRequest) 	
                http_request = new XMLHttpRequest();
            else 
                http_request = new ActiveXObject("Microsoft.XMLHTTP");

            if(config.method == 'POST') {
                http_request.open(config.method,config.path,true);
                http_request.setRequestHeader("Content-Type","application/x-www-form-urlencoded;");
                http_request.setRequestHeader("accept-charset","UTF-8;");
                http_request.setRequestHeader("x-requested-with","xmlhttprequest");
                http_request.send(addPostParams(config.params));
            } else {
                var getParams = addGetParams(config.params);

                /*
                 * IE Fix:
                 * Der Internet Explorer cacht die Datei und l�d sie neu so das die HTTP XML Request nie 
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
            
                console.log ( http_request.readyState );
            
                switch ( http_request.readyState ){
                    case 2:
                        console.log ( "hier" ) ;
                    break;
                    case 4:                    
                        if(http_request.status == 200) {
                            var requestVal = unescape(http_request.responseText);

                            console.log ( http_request.getAllResponseHeader() );
                            console.log ( requestVal );

                            if(callback) {
                                callback.call(callback,requestVal,returnparams);
                            }
                        }
                    break;
                }
                
           } catch (e) {
              //sollte der Request abgegbrochen werden über http_request.abort( )
             //wirft der FF aktuell eine Exception die wir hier mal gekonnt abfangen
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
            
            xmlRequest.open('GET',file,((sync || sync==undefined)?true:false));
            xmlRequest.send(null);
            
                if(!sync && sync != undefined) {
                    callback(xmlRequest.responseXML);
                } else {
                    xmlRequest.onreadystatechange = getData;
                }
            
        } catch (e) {
            if(ActiveXObject) {
                ie = true;
                
                xmlRequest = new ActiveXObject("Microsoft.XMLDOM");
                xmlRequest.onreadystatechange = getData;
                xmlRequest.load(file);
                
            } else {
                return;
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
var PreloaderInterface = {
    loaderStarted:function(){},
    loaderUpdate:function(){},
    loaderFinished:function(){},
    currentLoading:function(){}
};

// Preloader Model
function PreloaderModel(){
    BaseModel.call(this);
    
    var self        = this;
    var _files      = null;
    var _count      = 0;
    var loadedCount = 0;
    
    var scriptQueue = [];
    var imgQueue    = [];
    
    var fileArray = [];
    
    var _onReady  = null;

    function isImage(file){
        var p = /.*(jpg|png|gif)$/i;
        
        if( file.match(p) )
            return true;
        else 
            return false;
    };
        
    function isScript(file){
        var p = /.*\.js$/i;
        
        if( file.match(p) )
            return true;
        else 
            return false;
    };

    function merge(array1,array2) {
        var newArray = [];
        
        for(var i = 0 ; i < arguments.length;i++) {
            for(var j = 0; j < arguments[i].length;j++)
                newArray.push(arguments[i][j]);
        };
        
        return newArray;
    };
    
    function loadScriptFile(file){
        if(PreloaderModel.DOM_READY) { // DOM ist geladen
            var head = document.getElementsByTagName('head')[0];
            
            var newScript = document.createElement('script');
                newScript.type = "text/javascript";
                newScript.src  = file;
                
            head.appendChild(newScript);
            loadNextFile();
        } else { // DOM ist noch nicht bereit
        }
    };
    
    function loadImageFile(file){
        var img = new Image();
            img.src = file;
        
        fileArray.push(img);   
        
        if(!img.complete) {
            img.onload = function(){
                loadNextFile();
            };
        } else 
            loadNextFile();
    };
    
    function loadFile(file){
        var _obs = self.getObserver(); 
        
        for(var i = 0 ; i < _obs.length;i++)
            _obs[i].currentLoading( file.match(/[^\/]+$/i)[0] );
            
        if( isImage(file) )
            loadImageFile(file);
        else 
            if( isScript(file) ) 
                loadScriptFile(file);
    };        
    
    function loadNextFile(){
        loadedCount++;
        
        var _obs = self.getObserver(); 
        
        for(var i = 0 ; i < _obs.length;i++)
            _obs[i].loaderUpdate( Math.round(loadedCount*100/_count) );
        
        if(loadedCount < _count)       
            window.setTimeout(function(){ loadFile(_files[loadedCount]);},PreloaderModel.DELAY);
        else
            window.setTimeout(function(){
                for(var i = 0 ; i < _obs.length;i++) {
                    _obs[i].loaderFinished(fileArray);
                }
                
                if(_onReady) _onReady.call( {loadedFiles:fileArray} );
            },100);
    };
    
    this.addToQueue = function(newFile,mask){
        if(newFile.constructor == Array) {
            for(var i = 0 ; i < newFile.length;i++) {
                if(mask == PreloaderModel.SCRTPT_FILES) 
                    scriptQueue.push(newFile[i]);
                else 
                    imgQueue.push(newFile[i]);
            }
        } else {
            if(mask == PreloaderModel.SCRTPT_FILES) 
                scriptQueue.push(newFile[i]);
            else 
                imgQueue.push(newFile[i]);
        }
    };
       
    this.loadImageFiles = function(img){   
        _files   = img;
        _count = img.length;
        
        var _obs = self.getObserver();    
        for(var i = 0 ; i < _obs.length;i++)
            _obs[i].loaderStarted();
        
        loadFile(_files[0]);
    };
    
    this.loadScriptFiles = function(script){
        _files = script;
        _count = script.length;
        
        var _obs = self.getObserver();    
        for(var i = 0 ; i < _obs.length;i++)
            _obs[i].loaderStarted();
        
        loadFile(_files[0]);
    };
    
    this.initQueue = function(){
        _files = merge(scriptQueue,imgQueue);
        _count = _files.length;
        
        var _obs = self.getObserver();
        
        for(var i = 0;i<_obs.length;i++)
            _obs[i].loaderStarted();
            
        loadFile(_files[0]);
    };
    
    this.onReady = function(func){
        _onReady = func;
    };
};

PreloaderModel.DOM_READY    = false;
PreloaderModel.DELAY        = 75;
PreloaderModel.SCRIPT_FILES = 0;
PreloaderModel.IMAGE_FILES  = 1; 
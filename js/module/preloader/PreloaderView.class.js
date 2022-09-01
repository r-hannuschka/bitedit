function PreloaderView(){

    var preloaderFrame = null;
    
    var processDisplay = null;
    var processGears = null;
    
    var processText    = new BitLabel();
    
    function updateProcessbar(value){
    
        var percentInPx = Math.round((91*value)/100)+40;
        
        processDisplay.style.height = percentInPx+"px";
        processDisplay.style.top    = (145-percentInPx)+"px";
        
        processGears.innerHTML      = value+"%";
        
        processText.getComponent().innerHTML += 'geladen';
    };
        
    function getPreloaderBar(){
        var pBar = new BitPanel();
            pBar.setSize(170,145);
            pBar.setAttribute('position','relative');
            
        processDisplay                  = document.createElement('div');
        processDisplay.style.position   = 'absolute';
        processDisplay.style.top        = "145px";
        processDisplay.style.height     = "0px";
        processDisplay.style.width      = "144px";
        processDisplay.style.overflow   = "hidden";
        processDisplay.style.background = "url(img/processbar_loaded_gear.png) no-repeat 0px bottom";
        
        processGears              = document.createElement('div');
        processGears.style.height     = "95px";
        processGears.style.width      = "59px";
        processGears.style.top        = "0px";
        processGears.style.left       = "0px";
        processGears.style.position   = "absolute";
        processGears.style.background = "url(img/preload_bar_gear.png) no-repeat";
        processGears.innerHTML        = "0%";
        processGears.style.padding    = "50px 85px 0 0";
        processGears.style.textAlign  = "right";
        processGears.style.fontSize   = "10pt";
        processGears.style.fontFamily = "Verdena";
        
        pBar.getComponent().appendChild(processDisplay);
        pBar.getComponent().appendChild(processGears);
        
        return pBar;
    };
    
    function init(){
        preloaderFrame = new BitFrame();
        preloaderFrame.setUndecorated(true);
        preloaderFrame.setResizeAble(false);
        preloaderFrame.setFixed(true);
        
        preloaderFrame.setSize(379,145);        
        preloaderFrame.getHeadBar().setSize(0,0);
        preloaderFrame.getFootBar().setSize(0,0);
        
        preloaderFrame.setLayout( new BorderLayout() );
        
        preloaderFrame.add(getPreloaderBar(),'WEST');
        preloaderFrame.add(processText,'CENTER');
        
        processText.setAttribute('lineHeight','4em');
        processText.setAttribute('fontFamily','Verdana');
        processText.setAttribute('color','#4a453a');
        processText.setAttribute('fontSize','10pt');
        
        preloaderFrame.getContentPane().setBackground("url(img/preloader_screen.png)");
    };
    
    this.loaderStarted  = function(){
        if(!preloaderFrame)
            init();
    
        preloaderFrame.setVisible(true);
        WindowManager.centerWindow(preloaderFrame);
    };
    
    this.currentLoading = function(fileName){
        processText.getComponent().innerHTML = fileName+"...";
    };
    
    this.loaderUpdate = function(val){
        updateProcessbar(val);
    };
    
    this.loaderFinished = function(files){
        preloaderFrame.closeWindow();
    };
   
};
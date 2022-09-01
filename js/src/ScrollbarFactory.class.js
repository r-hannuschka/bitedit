/**
* Abstrakte Fabrik weil es zum lernen war
* eine einfache Fabrik hätte sicher gereicht
*/
function ScrollbarFactory(){
    this.createVerticalScrollbar = function(){
        throw "not implemented yet createVerticalSlider";
    };
    
    this.createHorizontalScrollbar = function(){
        throw "not implemented yet createHorizontalSlider";
    };
    
    this.createGround = function(){
        var track = new BitPanel();
            track.setLayout(new BorderLayout());
            
        return track;
    };
};

/** 
* Konkrete FABRIKEN 
*/
function WindowScroller(){
    ScrollbarFactory.call(this);
    
    this.createVerticalScrollbar = function(){
        return new VerticalScroller( this.createGround(), new WindowsVerticalScroller() );
    };
    
    this.createHorizontalScrollbar = function(){
        return new HorizontalScroller( this.createGround(), new WindowsHorizontalScroller() );
    };
};

function MacScroller(){
    ScrollbarFactory.call(this);                
    
    this.createVerticalScrollbar = function(){
        return new VerticalScroller( this.createGround(), new MacVerticalScroller()  );
    };               

    this.createHorizontalScrollbar = function(){
        return new HorizontalScroller( this.createGround(), new MacHorizontalScroller() );
    };
};

/**
 * Abstrakte PRODUKTE 
 */
function Scroller(){
    this.addSlider = function(){
        throw "not implemented yet addSlider";
    };
    
    this.getScrollbar = function(){
        throw "not implemented yed::getScrollbar";
    };
    
    this.createSliderTrack = function() {
        var sliderTrack = new BitPanel();
            sliderTrack.setLayout(null);
            sliderTrack.setClassName("slider_track");
                
        return sliderTrack;
    };
};

/* Scrollbalken
=====================================================*/
function VerticalScroller(track,sliderLayout){
    Scroller.call(this);
    
    var oSlider = null;
    var uButton = null;
    var dButton = null;
    var _track = track;
    var _sliderTrack = null;
    
    var _slider = false;
    
    this.setDimension = function(int_w,int_h){
        dim = new Dimension(int_w,int_h);
    };
    
    function createButtonUp(){
        if(!uButton) {
            uButton = new BitButton();
            uButton.setSize(12,13);
            uButton.setClassName("scroll_up");
        }
        return uButton;
    };
    
    function createButtonDown(){
        if(!dButton) {
            dButton = new BitButton();
            dButton.setSize(12,13);
            dButton.setClassName("scroll_down");
        }
        return dButton;
    };
    
    this.addSlider = function(slider) {
        oSlider = slider;
        oSlider.getSlider().setClassName("vertical");
        _slider = true;
    };                
    
    this.getScrollbar = function() {
    
        _track.setClassName("verticalScrollbar");
    
        if(!_slider)
            this.addSlider( new DefaultSlider() );
        _sliderTrack = this.createSliderTrack();
        _sliderTrack.add( oSlider.getSlider() );
        
        sliderLayout.createSlider(_track,createButtonUp(),createButtonDown(),_sliderTrack);
            
        return _track;
    };
    
    this.getScrollbarComponents = function(){    
        return {
            scrollContainer:_track.getComponent(),
            scrollButtons:[uButton.getComponent(),dButton.getComponent()],
            scrollGround:_sliderTrack.getComponent(),
            scrollLayer:oSlider.getSlider().getComponent()
        };
    };
};

function HorizontalScroller(track,sliderLayout){                
    Scroller.call(this);
    
    var oSlider = null;
    var lButton = null;
    var rButton = null;
    var _track = track;
    var _sliderTrack = null;
    
    var _slider = false;
    
    this.setDimension = function(int_w,int_h){
        dim = new Dimension(int_w,int_h);
    };
    
    function createButtonLeft() {
        if(!lButton) {
            lButton = new BitButton();
            lButton.setSize(13,12);
            lButton.setClassName("scroll_left");
        }
        return lButton;
    };
    
    function createButtonRight(){
        if(!rButton) {
            rButton = new BitButton();
            rButton.setSize(13,12);
            rButton.setClassName("scroll_right");
        }
        return rButton;
    };    
    
    this.addSlider = function(slider) {
        oSlider = slider;
        _slider = true;
    };   
      
    this.getScrollbar = function() {
    
        _track.setClassName("horizontalScrollbar");
    
        if(!_slider)
            this.addSlider( new DefaultSlider() );
            
        oSlider.getSlider().setClassName("horizontal");
        _sliderTrack = this.createSliderTrack();
        _sliderTrack.add( oSlider.getSlider() );
        sliderLayout.createSlider(_track,createButtonLeft(),createButtonRight(),_sliderTrack);
            
        return _track;
    };    
    
    this.getScrollbarComponents = function(){    
        return {
            scrollContainer:_track.getComponent(),
            scrollButtons:[lButton.getComponent(),rButton.getComponent()],
            scrollGround:_sliderTrack.getComponent(),
            scrollLayer:oSlider.getSlider().getComponent()
        };
    };
};

/* Scrollbalken Layouts
=====================================================*/
function WindowsVerticalScroller(){
    
    function buildSlider(ground,btn1,btn2,sliderTrack){
        ground.add( btn1        ,'NORTH');
        ground.add( sliderTrack ,'CENTER');
        ground.add( btn2        ,'SOUTH');
        
        return ground;
    };    
    
    this.createSlider = function(g,b1,b2,s){
        return buildSlider(g,b1,b2,s);
    };
};

function WindowsHorizontalScroller(){    
    function buildSlider(ground,btn1,btn2,sliderTrack){
        ground.add( btn1        ,'WEST');
        ground.add( sliderTrack ,'CENTER');
        ground.add( btn2        ,'EAST');
        
        return ground;
    };  
    
    this.createSlider = function(g,b1,b2,s) {    
        return buildSlider(g,b1,b2,s);
    };
};
            
function MacVerticalScroller(){
    function buildSlider(ground,btn1,btn2,sliderTrack) {
        var east = new BitPanel();
            east.setSize(12,26);
            east.setLayout(new GridLayout(1,2,0,0));
            
            east.add( btn1 );
            east.add( btn2 );
            
        ground.add(sliderTrack,'CENTER');
        ground.add(east,'SOUTH');
        
        return ground;
    };
                          
    this.createSlider = function(g,b1,b2,s){
        return buildSlider(g,b1,b2,s);
    };
};           

function MacHorizontalScroller() {

    function buildSlider(ground,btn1,btn2,sliderTrack) {
        var east = new BitPanel();
            east.setSize(26,12);
            east.setLayout(new GridLayout(2,1,0,0));
            
            east.add( btn1 );
            east.add( btn2 );
            
        ground.add(sliderTrack,'CENTER');
        ground.add(east,'EAST');
        
        return ground;
    };
    
    this.createSlider = function(g,b1,b2,s){
        return buildSlider(g,b1,b2,s);
    };
};

/* SLIDER LAYOUTS 
=====================================================*/
function SlidingDoorSlider(){ 

    var slider = null;

    function createSlider(){
    
        slider = new BitPanel();
        slider.setLayout(null);
        slider.setClassName("slider")
           
        var inner = document.createElement('div');
            inner.className = 'slider_inner';
            
        slider.getComponent().appendChild(inner);
            
    };
    
    this.getSlider = function(){
        if(!slider)
            createSlider();
            
        return slider;
    };
};

function DefaultSlider(){  
    var slider = null;
    
    function createSlider(){
        slider = new BitPanel();
        slider.setLayout(new FlowLayout(0,0,"left"));
        slider.setClassName("slider")
    };
    
    this.getSlider = function(){        
        if(!slider)
            createSlider();
            
        return slider;
    };
};
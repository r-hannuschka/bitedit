// Haupt GUI Frame
// Baut Grundstruktur zusammen
function GUIFrame(frame) {
        
    var _frame = frame;
    
    var _ctrl  = null;
    
    var right       = new BitSplitPanel('horizontal');
    var contentPane = new BitSplitPanel();
    
    _frame.setLayout(new BorderLayout(2,2));
    _frame.setBackground("#000");  
    
    function initBorderLayout(){

        var menuPanel = MainMenu.getMenu();
            menuPanel.setSize(20,20);
        
        MainMenu.onClick (function(){
           _ctrl.addController ( this.control );
        });
        
        right.setMaxSize(270,20);
        contentPane.rightComponent( right );
        
        _frame.add(contentPane,'CENTER');
        _frame.add(menuPanel,'NORTH');
    };
    
    this.setController = function(ctrl){
        _ctrl = ctrl;
    };
    
    this.addPanel = function(panel,replace) {
        switch(replace) {
            case 'doc':
                contentPane.leftComponent(panel);
                break;
            case 'navigator':
                right.leftComponent(panel);
                break;
            case 'file':
                right.rightComponent(panel);
                break;
        }
    };
    
    this.setModel = function(model){
        _model = model;
    };
    
    this.addFrame = function(frame){
        _frame.add(frame);
    };
    
    this.init = function(){
        initBorderLayout();
    };
};
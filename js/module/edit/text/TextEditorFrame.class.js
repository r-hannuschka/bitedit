function TextEditorFrame(ctrl, model){

    var frame  = null;
    
    var _ctrl  = ctrl;

    var _model = model;
        _model.addObserver( this );

    var toolPanel = new BitPanel();

    function createFrame(){
        frame = new BitFrame("Text Editor");
        frame.setResizeAble(false, true);
        frame.setBackground("#333");
        frame.getContentPane().setSize(241,101);
        frame.setLayout(new BorderLayout(0,1) );
        frame.setPosition(100,100);

        frame.add(toolPanel , "center");
        frame.add(createButtonPanel()  , "south" );
    }

    function createButtonPanel(){

        var editModeOn = new BitButton('Textbearbeitung starten');
            editModeOn.setSize(0,20);
            editModeOn.setClassName("enableEditMode");

            editModeOn.addAction('click', function(){
                _model.enableEditMode();
            });

        return editModeOn;
    }

    this.getFrame = function (){

        if(!frame) {
            createFrame();
        }

        if(!frame.inDocument() ) {
            frame.setVisible( true );
        }

        return frame;
    }

    this.editorLoaded = function (){
        toolPanel.getComponent().innerHTML = "";
        toolPanel.setClassName("mceEditor defaultSkin");
        toolPanel.getComponent().appendChild( _model.getToolBar() );
    }
    
    this.editorFinished = function( modification ){}
}
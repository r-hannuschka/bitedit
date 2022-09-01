// View 
function BitEditView(){
    var mainFrame = null;
    
    function createFrame(){
        mainFrame = new BitFrame("JS-BitEdit beta");
        mainFrame.setClassName("bit_edit_frame");
        mainFrame.setSize(600,480);

        WindowManager.centerWindow(mainFrame);
    };
    
    this.getFrame = function(){
        if(!mainFrame) 
            createFrame();
        
        return mainFrame;
    };
};

function BitEditModel(){
    
    this.getScriptFiles = function(){    
        var scriptFiles = [
            "js/src/Slider.class.js",
            "js/src/Scrollbar.class.js",
            "js/src/Load.class.js",
            "js/src/ScrollbarFactory.class.js",
            "js/src/Treemenu.class.js",
            
            "js/base/template/document/DocumentView.class.js",
            "js/base/template/navigator/Navigator.class.js",
            "js/base/template/overview/LayerOverview.class.js",
            "js/base/file/FileView.class.js",
            "js/base/file/FileController.class.js",

            "js/base/GUIFrame.class.js",
            "js/base/GUIModel.class.js",
            "js/base/GUIController.class.js",
            "js/base/template/TemplateController.class.js",
            "js/base/ActionEvent.class.js",
            "js/base/dragdrop/DragDropController.class.js",
            "js/base/dragdrop/DragDrop.class.js",
            "js/base/Modification.class.js",
            "js/base/TreeModel.class.js",
            
            // MainMenu
            "js/base/mainmenu/MainMenu.class.js",
            
            "js/base/template/Template.class.js",
            "js/base/template/Scale.js",            
            "js/base/file/File.class.js",
            "js/base/tree/TreeNode.class.js",
            "js/base/tree/LayerNode.class.js",
            "js/base/tree/ImageNode.class.js",
            "js/base/tree/HTMLNode.class.js",

            // Module laden
            "js/module/edit/colorpicker/Colorpicker.class.js",
            "js/module/edit/colorpicker/ColorPickerController.class.js",

            "js/module/edit/layer/LayerEditorView.class.js",
            "js/module/edit/layer/LayerController.class.js",
            "js/module/edit/layer/LayoutEditorFactory.js",
            "js/module/edit/layer/AbstractLayoutEditor.js",
            "js/module/edit/layer/AbstractEditorView.js",
            "js/module/edit/layer/BorderLayoutEditor/BorderLayoutEditor.js",
            "js/module/edit/layer/BorderLayoutEditor/BorderLayoutEditorView.js",
            "js/module/edit/layer/GridLayoutEditor/GridLayoutEditor.js",
            "js/module/edit/layer/GridLayoutEditor/GridLayoutEditorView.js",
            "js/module/edit/layer/FlowLayoutEditor/FlowLayoutEditor.js",
            "js/module/edit/layer/FlowLayoutEditor/FlowLayoutEditorView.js",

            "js/module/edit/image/ImageEditController.class.js",
            "js/module/edit/image/ImageWindow.class.js",

            "js/module/edit/text/TextEditor.class.js",
            "js/module/edit/text/TextEditorController.class.js",
            "js/module/edit/text/TextEditorFrame.class.js",

            "js/module/help/HelpWindow.js",
            "js/module/help/HelpController.js",
            
            "js/module/importexport/ImportExportWindow.class.js",
            "js/module/importexport/ImportExportController.class.js",
        ];
        
        return scriptFiles;
    };
    
    this.getImageFiles = function(){
        var imageFiles = [
            // Template Vorlagen
            // "http://www.schoenitzer.de/images/Erde_Mond.jpg",
            "img/layouts/layout1.jpg",
            "img/layouts/layout2.jpg",
            "img/layouts/layout3.jpg",
            "img/layouts/layout4.jpg",
            "img/layouts/layout5.jpg",
            "img/layouts/layout6.jpg",
            "img/layouts/layout7.jpg",
            "img/layouts/layout8.jpg",
            "img/layouts/layout9.jpg",
            "img/layouts/layout10.jpg",
            "img/layouts/layout11.jpg",
            "img/layouts/layout12.jpg",
            "img/icons.jpg",
            "img/bild_edit_vorschau.jpg"
            
        ];
        
        return imageFiles;
    };
};

// Controller und Einstiegspunkt
function BitEdit() {        

    var _model = new BitEditModel();
    var _view  = new BitEditView();
        
    function createPreloader(){
        
        var pm = new PreloaderModel();

        pm.addObserver( new PreloaderView() );
        pm.addToQueue( _model.getScriptFiles(), PreloaderModel.SCRIPT_FILES );
        pm.addToQueue( _model.getImageFiles() , PreloaderModel.IMAGE_FILES  );
        
        pm.onReady(function(){
            pm = null;
        
            // BitScrollPanel.SCROLLBAR  = new MacScroller();
            BitScrollPanel.SCROLLBAR  = new WindowScroller();
            BitScrollPanel.SLIDER     = 1;
        
            var viewController = new GUIController();
                viewController.setView( _view.getFrame() );
                viewController.init();
            
            var f = _view.getFrame();
            f.setVisible(true);
        });
                    
        pm.initQueue();
    };
        
    this.setView = function (view) { 
        _view = view; 
    };   
        
    this.init = function (){   
        /** 
         * scripte alle vorladen
         */
        createPreloader();
    };
};

BitEdit.main = function(){
    var bitEdit = new BitEdit();    
    bitEdit.init();
};

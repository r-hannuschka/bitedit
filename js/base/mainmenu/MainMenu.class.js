var MainMenu = (function(){

    var menu = null;
    
    var callback = null;
    
    var buttons = {color:null, layer:null, image:null, text:null,importexport:null ,help:null };
    
    function MainMenu(){

        menu = new BitPanel();
        menu.setClassName("mainmenu");
        menu.setLayout( new FlowLayout(7,0,"left") );
        menu.setBackground("#FFF");
                
        /**
         * könnte man als Konstruktutor Funktion betrachten
         */ 
        (function(){            
            for(var key in buttons) {
                var name = "";
                
                switch (key) {
                    case 'color':
                        name = "Farben";
                        break;
                    case 'layer':
                        name = "Ebenen Editor";
                        break;
                    case 'image':
                        name = "Bilder Editor";
                        break;
                    case 'text':
                        name = 'Text Editor';
                        break;
                    case 'importexport':
                        name = 'Import / Export';
                        break;
                    case 'help':
                        name = "Hilfe";
                        break;
                }

                var btn = new BitButton(name);
                    btn.setClassName(key);
                    
                menu.add( btn );
                
                /**
                 * Closure um die Action zwischen zu speichern
                 * bei einen Klick wird die zuständige Action an 
                 * loadController weiter gegeben 
                 */
                (function(){
                    var action = key;
                
                    btn.addAction('click',function( evt ){
                        var e = evt || window.event;                        
                        Element.stopEvent(e);                        
                        loadController(action);
                    });
                    
                })();
            }            
        })();        
        
        /* den zuständigen Controller laden falls notwendig
         * und als KindController hinzufügen
         */
        function loadController( action ){            
            if(!buttons[action]) {
                switch (action) {
                    case 'layer':
                        buttons[ action ] = new LayerController();
                        break;
                    case 'color':
                        buttons[action] = new ColorPickerController();
                        break;
                    case 'image':
                        buttons[action] = new ImageEditController();
                        break;
                    case 'text':
                        buttons[action] = new TextEditorController();
                        break;
                    case 'importexport':
                        buttons[action] = new ImportExportController();
                        break;
                    case 'help':
                        buttons[action] = new HelpController();
                        break;
                }
            }
            callback.call ( {control:buttons[action] });
        };
    }
    
    return {
        getMenu:function(){
            if(!menu) 
                new MainMenu();
                
            return menu;
        },
        onClick:function( cb ){
            callback = cb;
        }
    }    
})();
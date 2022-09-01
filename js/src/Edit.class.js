/**
* Edit Klasse mit Singleton Pattern
* verarbeitet das modifizieren von Flächen
*/
(function(){
    var edit            = null;
    
    var component       = null;
    
    var type            = null;
    
    var scale_obj       = null;
    
    var edit_in_process = false;
    
    var can_edit        = false;
    
    var edit_mode       = "";
        
    var Edit = window.Edit = function(co) {
    
        if(co) {
            component = co;
            type = (component.constructor == BitPanel)?'panel':'image';
            can_edit = true;
        } else 
            can_edit = false;
        
        if(!edit)
            edit = new EditClass();
                
        return edit;
    };

    // Code 1  alle Richtungen
    // Code 2 nur unten
    // Code 3 nur oben     
    // Code 4 nur links
    // Code 5 nur rechts
    // Code 6 links und rechts
    function scaleComponent(code,layer,onFinish){
        
        if(!scale_obj) {
            scale_obj = new Scale(layer);
                    
            switch(code) {
                case 2:
                    scale_obj.blockScaleDirection('top');
                    scale_obj.blockScaleDirection('left');
                    scale_obj.blockScaleDirection('right');
                    break;
                case 4: case 5:
                    scale_obj.blockScaleDirection('bottom');
                    scale_obj.blockScaleDirection('top');
                                                        
                    if(code == 5) scale_obj.blockScaleDirection('left');
                    if(code == 4) scale_obj.blockScaleDirection('right');
                    break;
                case 3:                        
                    scale_obj.blockScaleDirection('bottom');
                    scale_obj.blockScaleDirection('left');
                    scale_obj.blockScaleDirection('right');
                    break;
                case 6:
                    scale_obj.blockScaleDirection('bottom');
                    scale_obj.blockScaleDirection('top');
                break;
            }
            
            scale_obj.init().onScale(function (){
                // aufrufen der Callback Funktion und übergeben 
                // selbigen das Objekt welches von der Klasse Scale übergeben wird
                onFinish.call(this);
                
                // skalierung beenden
                scale_obj.endScale();
                delete scale_obj;
                scale_obj = null;
                edit_in_process = false;
                BitEditGUIEvents.handleEvent('repaint_workpane');
                edit_mode = "";
            });
            
            edit_in_process = true;
        }
        edit_mode = 'scale';
    };
    
    /**
            * bearbeiten einer Komponente beenden
            *@access private
            *@param boolean 
            *@return void
            */
    function finishEditComponent(complete_edit){
    
        switch(edit_mode) {
            case 'scale':
                if(scale_obj) {
                    if(complete_edit)
                        scale_obj.finishScale();
                    else {                
                        scale_obj.endScale();
                        delete scale_obj;
                        scale_obj = null;
                        edit_in_process = false;
                    }
                }
                    
                scale_obj = null;
                break;
            case 'text':
            
                var html = "";
                var id = text_edit_panel.id;
                
                tinyMCE.execCommand('mceRemoveControl',false,id);
            
                if(complete_edit) html = text_edit_panel.innerHTML;
                else              html = text_before_edit;
                
                Element.unlink(text_edit_panel);
                
                text_edit = false;

                component.getComponent().innerHTML = html;
                
                var img = Element.getElements(component.getComponent(),'img');
                
                if(img.length > 0) {                
                    for(var i = 0 ; i < img.length;i++) {
                        var p = img[i].parentNode;
                        p.parentNode.insertBefore(img[i],p);
                    }
                }
                
                html = component.getComponent().innerHTML;
                
                /*
                * alle leeren HTML Tags löschen
                * tinymce erstellt <br> tags so , so das wir d akeine Sorge haben sollten nun noch bilder abprüfen
                */
                var pattern = /(<([\w]+)[^>]*>)(&nbsp;|\s){0,}<\/\2>/i;
                
                do {
                    with(component.getComponent()) {
                        var matches = innerHTML.match(pattern);
                        
                        if(!matches)
                            break;
                            
                        switch(matches[2].toLowerCase() ) {
                            case 'img': 
                                continue;
                                break;
                            default:
                                innerHTML = innerHTML.replace(pattern,"");
                        }
                    }
                    
                }while(true);
                
                // alte Bilder aus dem Array löschen da sie nun nicht mehr benötigt werden , 
                // TinyMCE hat diese wohl geclont und neu eingefügt
                BitEditGUIEvents.handleEvent('deleteOldImages');
                
                // Bilder nun neu hinzufügen
                for(var i = 0 ; i < img.length;i++)
                    BitEditGUIEvents.handleEvent('add_image',img[i]);
                
                // Drag Drop Container aktualisieren
                BitEditGUIEvents.handleEvent('update_image_drag_drop',component);
                break;
        }
        
        BitEditGUIEvents.handleEvent('edit_completed');
        
        edit_in_process = false;
        edit_mode = "";
    };
    
    /**
           * innere Klasse EditClass
           * verwaltet das komplette Editieren
           */
    function EditClass(){
    
        function scale() {
            if(!can_edit) return;
            
            if(edit_in_process) {
                if(edit_mode == 'scale'){   
                    finishEditComponent(true); 
                    return;   
                } else {
                    finishEditComponent(true);
                }   
            }
                        
            if(type == "panel") {
            
                var parent = component.getParentComponent();
                
                var layout = parent.getLayoutManager().getName().toLowerCase();
                
                switch(layout) {
                    case 'flowlayout':
                        break;
                        
                    case 'borderlayout':
                        // wo  liegt das Panel
                        var code = 0;
                        
                        var layout_components = parent.getLayoutManager().getLayoutComponents();
                        
                        for(var key in layout_components) {
                            
                            if(layout_components[key] == component) {
                                
                                switch(key.toLowerCase()) {
                                    case 'north':
                                        code = 2; 
                                        break;
                                    case 'center':
                                        if(layout_components.EAST && layout_components.WEST)
                                            code = 6
                                        else if (layout_components.EAST)
                                            code = 5
                                        else if (layout_components.WEST)
                                            code = 4
                                        else 
                                            return;
                                        break;
                                    case 'east':
                                        code = 4;
                                        break;
                                    case 'west':
                                        code = 5
                                        break;
                                    case 'south':                                        
                                        code = 3;
                                        break;
                                }
                                
                                break; // for schleife abbrechen
                            }
                        }
                        
                        // Callback wenn das Borderlayout skaliert wurde
                        scaleComponent(code,component.getComponent(),function () {
                            var scaled_by = this.scaledBy();
                            
                            switch(key.toLowerCase()) {
                                case 'north':
                                    var bottom = scaled_by.bottom;
                                    var nd = layout_components.NORTH.getSize();
                                    layout_components.NORTH.setSize(nd[0],nd[1]+bottom);
                                     break;
                                case 'south':
                                    var top = scaled_by.top;
                                    var sd = layout_components.SOUTH.getSize();
                                    layout_components.SOUTH.setSize(sd[0],sd[1]+top);
                                    break;
                                case 'west':
                                    var right  = scaled_by.right;
                                    var wd = layout_components.WEST.getSize();
                                    layout_components.WEST.setSize(wd[0]+right,wd[1]);
                                    break;
                                case 'east':
                                    var left  = scaled_by.left;
                                    var ed = layout_components.EAST.getSize();
                                    layout_components.EAST.setSize(ed[0]+left,ed[1]);
                                    break;
                                default:
                                    var left  = scaled_by.left;
                                    var right = scaled_by.right;
                                    
                                    if(layout_components.WEST && left != 0) {
                                        var wd = layout_components.WEST.getSize(); 
                                        layout_components.WEST.setSize(wd[0]-left,wd[1]);
                                    }
                                        
                                    if(layout_components.EAST && right != 0) {
                                        var ed = layout_components.EAST.getSize();
                                        layout_components.EAST.setSize(ed[0]-right,ed[1]);
                                    }
                            }
                        });
                        
                    default:
                        // bleibt ja nur noch das Gridlayout erstmal
                        return;
                }
            } else { // bilder
                scaleComponent(1,component,function(){
                    BitEditGUIEvents.handleEvent("finished_scale",[type,this.dimension()]);
                });
            }
        };
        
        /**
                        * Einstellen der Abstands nach außen über Slider
                        */        
        function margin(){
            if(!can_edit) return;
            
            if(type == "panel")
                return;
        };
        
        /**
                        * Einstellen der Abstands nach innen über Slider
                        */
        function padding(){
            if(!can_edit) return;
        };
        
        /**
                        * einfügen des TinyMCE Editors
                        */
        function text(){
            if(!can_edit || type != 'panel') return;
            
            if(edit_in_process && edit_mode == 'text') {
                finishEditComponent(true);
                // BitEditGUIEvents.handleEvent('update_container');
                return false;
            } else {
                finishEditComponent(true);
                
                text_edit_panel = Element.create('div');
                var id  = Element.generateId(5);
                text_edit_panel.id = id;
                
                var w = component.getDimension().availDimension()[0]+"px";
                var h = component.getDimension().availDimension()[1]+"px";
                
                Element.attrib(text_edit_panel,'style',{
                    height:h,
                    width:w
                });
                
                text_before_edit = component.getComponent().innerHTML;
                text_edit_panel.innerHTML = text_before_edit;
                component.getComponent().innerHTML = "";
                Element.bind(text_edit_panel,component.getComponent());
                
                tinyMCE.execCommand('mceAddControl',false,id);
                
                edit_mode     = "text";
                edit_in_process = true;
                
            }
            edit_mode = 'text';
        };
        
        function colorize(new_color){
            if(!can_edit) return;
            
            component.setBackground(new_color);
            component.setVisible(true);
            BitEditGUIEvents.handleEvent("edit_completed");
        };
        
        function colorText(new_color){
            component.getComponent().style.color = new_color;
            BitEditGUIEvents.handleEvent("edit_completed");
        }
        
        /**
                        * beenden des editierens
                        */
        function finishEdit(){
            finishEditComponent(arguments[0]);
        };
        
        function inProcess(){
            return edit_in_process;
        };
        
        function del(){
            if(type == "image") {
                var key = component.getAttribute('image_key');
                BitEditGUIEvents.handleEvent('delete_image',key);
                BitEditGUIEvents.handleEvent("edit_completed");
            }
        };
                
        this.colorize  = colorize;
        
        this.colorText = colorText;
        
        this.scale     = scale;
        
        this.margin    = margin;
        
        this.padding   = padding;
                
        this.text      = text;
        
        this.finishEdit = finishEdit;
        
        this.inProcess = inProcess;
        
        this.del       = del;
    };
})();
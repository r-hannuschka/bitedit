/**
*@private Class SplitLayout
* speziell dafür angelegt das das Layoutfür das SplitPanel angepasst wird
*/
function SplitLayout(){
    Layout.call(this);

    var split_layer_set = false;
    
    var split_width = 5;
    
    var components = {
        left:new BitPanel(),
        right:new BitPanel()
    }
    
    /** 
     * liefert min und maximale Werte der linken seite zurück 
     * bzw vom oberen Container
     */ 
    function getLeftSize( dim ) {
        // min weite betrachten
        // max weite betrachten

        var leftContainer = components.left;
        
        var min_width = leftContainer.getMinSize()[0] || 0;
        var max_width = leftContainer.getMaxSize()[0] || dim[0];
        
        return [min_width, max_width];
    };
    
    /**
     * liefert min und maximalen wert von rechter Seite zurück 
     * bzw von unten
     */    
    function getRightSize() {
        // min weite betrachten
        // max weite betrachten
        
        var rightContainer = components.right;
        
        var min_width = rightContainer.getMinSize()[0] || 0;
        var max_width = rightContainer.getMaxSize()[0] || dim[0];
        
        return [min_width, max_width];
    };
    
    function prepareSize( dimension ){
    
        var left_dim  = getLeftSize(  dimension  );
        var right_dim = getRightSize( dimension );
        
        // bekommt linke und rechte minimal dimension
        if( left_dim[0] + right_dim[0] > dimension[0] ) {
            // linke Dimension wirkt stärker
            components.left.setSize( left_dim[0], dimension[1] );
            components.right.setSize( dimension[0] - left_dim[0] - split_width );
        }
        
    };
    
    /**
    *Kind Komponenten anordnen und positionieren
    *sowie Eigenschaften zuweisen wie Weite und Höhe der Componenten
    *@access public
    *@param Object Container
    *@return void
    */
    this.prepareLayout = function(container) {
        // die maximale Dimension die es erreichen kann
        prepareSize( container.getDimension().getAvailDimension() );
    };

    /**
    * dem Container der das Layout besitzt ein Element hinzufügen 
    * wird aufgerufen in der Container.loadComponents
    *@access public
    *@param Object Container wo soll es rein
    *@param Object Component was soll rein
    *@return void
    */
    this.addComponent = function (container,component,position){
        if( position.toLowerCase() == "left") {
            components.left  = component;
        } else {
            components.right = component;
        }
    };
    
    this.getLayoutDimension = function(container){
    };
        
    this.getName = function(){
        return "SplitLayout";
    };
    
};

/**
*Class BitSplitPanel
*@access public
*@param String [vertical|horizontal]
*@param[ String id]
*
* Klasse um ein Panel zu teilen
* nimmt 2 neue Panels auf
*/
function BitSplitPanel(split,elementId){

    BitPanel.call(this,elementId);

    var split = (split && split.match(/horizontal/gi))?split.toLowerCase():"vertical";
    
    var split_layer     = Element.create("div");
    
    var self = this;

    /**
    * in welche Richtung wurde gesplittet
    *  1 == vertikaler Balken also linke und rechte Seite
    * -1 == horizontaler Balken also oben und unten 
    */
    var split_direction = (split == "vertical")?1:-1;

    /**
    * weite oder höhe des Splitbalkens
    */
    var split_width     = 5;

    /**
    * split_layer aufgenommen 
    */
    var split_dragged = false;

    /**
    * unser drag und drop dummy
    */
    var split_layer_dummy = Element.create('div');
    
    /**
   * die Mauskoordinaten für Drag und Drop werden hier abgespeichert
   */
    var old_mouse_coords = null;
    var new_mouse_coords = null;
    
    this.setLayout(new SplitLayout() );
            
    /**
    * mousedown Event fired
    * resize starten , alte Position des Split Layers speichern
    * alte Position der Maus speichern
    *@access private
    *@param Event mouseevent
    *@return void
    */
    function start_resize(evt){
    
        var e = evt || window.event;
        Element.stopEvent(e);
    
        split_dragged = true;
        
        Element.addEvent(document,'mousemove',move_split_layer);
        Element.addEvent(document,'mouseup',stop_resize);
        
        old_mouse_coords  = Element.getMouseCoords(e);
        
        split_layer_coord = Element.getCoords(split_layer);
        split_panel_coord = Element.getCoords(split_panel.getComponent());
        
        Element.attrib(split_layer_dummy,"style",{
            position:"absolute",
            left:split_layer_coord.posX+"px",
            top:split_layer_coord.posY+"px",
            zIndex:1000000
        });
        
        Element.bind(split_layer.cloneNode(true),split_layer_dummy);
        Element.bind(split_layer_dummy,"body");
    };

    /**
    * mousemove Event fired
    * neue Position berechnen und Split Layer Dummy platzieren
    * abspeichern wie weit sich das Element in der größe geändert hat
    *@access private
    *@param Event mouseevent
    *@return void
    */
    function move_split_layer(evt){
        var e = evt || window.event;
        Element.stopEvent(e);
        
        var new_mouse_coords = Element.getMouseCoords(e); 

        var new_x;
        var new_y;
            
        if(split == "vertical") {
            var move_x = new_mouse_coords.mousex-old_mouse_coords.mousex;
            new_x  = split_layer_coord.posX+move_x;
            new_y  = split_layer_coord.posY;
            
            if(new_x-split_panel_coord.posX < split_range[0])
                new_x = split_panel_coord.posX+split_range[0];
                
            if(new_x-split_panel_coord.posX > split_range[1])
                new_x = split_panel_coord.posX+split_range[1];
                
        } else {
            var move_y = new_mouse_coords.mousey-old_mouse_coords.mousey;
            
            new_x  = split_layer_coord.posX;
            new_y  = split_layer_coord.posY+move_y;
            
            if(new_y-split_panel_coord.posY < split_range[0])
                new_y = split_panel_coord.posY+split_range[0];
                
            if(new_y-split_panel_coord.posY > split_range[1])
                new_y = split_panel_coord.posY+split_range[1];
        }
        
        split_layer_pos = [new_x,new_y];
        
        Element.attrib(split_layer_dummy,'style',{
            left:new_x+'px',
            top:new_y+'px'
        });
    };

    /**
    * resize stoppen
    * neue Dimensionen für die Untercontainer werden bestimmt
    * und dann das Layout neu geschrieben
    *@access private
    *@param Event mouseup
    *@return void
    */
    function stop_resize(evt){
        var e = evt || window.event;
        Element.stopEvent(e);
        
        Element.unlinkEvent(document,"mousemove",move_split_layer);
        Element.unlinkEvent(document,"mouseup",stop_resize);
        
        var split_dim = split_panel.getDimension().getSize();
        
        if(split == "vertical")
            right_size = split_dim[0]-(split_layer_pos[0]-split_panel_coord.posX);
        else
            right_size = split_dim[1]-(split_layer_pos[1]-split_panel_coord.posY);
            
        split_layer_dummy.innerHTML = "";
        split_layer_coord = {};
        split_panel_coord = {};
        
        split_changed = true;
        
        split_panel.setVisible(true);
    };
};
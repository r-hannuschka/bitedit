/**
*BitGUI Framework
*zum erstellen von Fenstern und Layouts
*@autor Ralf Hannuschka
*last modified Date: 24.08.2010
*
*Version 1.25
*/
function Layout(hg,vg){
    
    this.hgap = (hg && hg !== "undefined")?hg:0;
    this.vgap = (vg && vg !== "undefined")?vg:0;

    var _callBack = null;
    
    this.setHGap = function (hg){
        this.hgap = (hg)?parseInt(hg, 10):0; 
    };
    
    this.setVGap = function(vg){
        this.vgap = (vg)?parseInt(vg, 10):0;
    };
    
    this.getHGap = function(){
        return this.hgap;
    };
    
    this.getVGap = function(){
        return this.vgap;
    };

    this.removeComponent = function (){};

    this.onRemoveComponent = function( callback ) {
        _callBack = callback;
    }

    this.componentRemoved = function ( component ) {
        if(_callBack)
            _callBack( component );
    }

};

/**
*FlussLayout Klasse 
*Elemente werden nebeneinander angereit mittels floating
*/
function FlowLayout(hg,vg,floating){
    
    Layout.call(this,hg,vg);
    
    var inner_box = Element.create("div");
    
    var inner_box_insert = false;

    var _float = floating;
    
    var self = this;
    
    /**
    *dem Container der das Layout besitzt ein Element hinzufügen
     *wird aufgerufen in der Container.loadComponents
    *@access public
    *@param <BitContainer> container wo soll es rein
    *@param <BitComponent> component was soll rein
    *@param String floating festlegen [left|right]
    *@return void
    */
    this.addComponent = function(container,component) {
    
        if(!inner_box_insert && !_float) {
            Element.attrib(inner_box,"style",{
                margin:'auto'
            });
            
            inner_box.className = "innerbox clearfix";
            Element.bind(inner_box,container.getComponent());
            inner_box_insert = true;
        }

        if(inner_box_insert) {
            Element.bind(component.getComponent(),inner_box);
        } else {
            Element.bind( component.getComponent(), container.getComponent() );
        }
        
    };

    /**
    * Kind Komponenten anordnen und positionieren
    * sowie Eigenschaften zuweisen wie Weite und Höhe der Componenten
    *@access public
    *@param <BitContainer> Container
    *@return void
    */
    this.prepareLayout = function (container){
        var width_set = false;
        
        var margin_v = (self.vgap)?self.vgap+"px":0;
        var margin_h = (self.hgap)?self.hgap+"px":0;

        container.setClassName("clearfix");

        if(_float == "right") 
            var margin = margin_v+" "+margin_h+" 0 0";
        else 
            var margin = margin_v+" 0 0 "+margin_h;
        
        Element.attrib(inner_box,'style',{
            width:'',
            height:''
        });
        
        var width     = 0;
        var cont_dim  = container.getDimension().availDimension();
        var temp_width = 0;
        
        var c_length = container.contains().length;
        
        for(var i = 0  ; i < c_length ;i++) {
            
            var child = container.contains()[i];
            var comp_dim = child.getDimension().getComponentDimension();
            
            if(c_length > 1 || _float)
                Element.attrib(child.getComponent(),"style",{
                    cssFloat:(_float || 'left')
                });
            
            if(!_float) {
                // weite für den inneren Container vom Layout wurde allgemein noch nicht gesetzt
                // der innere Container soll dafür sorgen das die Elemente zentriert werden können
                // wenn kein floating angegeben ist
                if( !width_set ) {
                    // componenten weite ist größer als die Hauptcontainer weite
                    if(comp_dim[0] > cont_dim[0]) {
                        Element.attrib(inner_box,'style',{
                            width:comp_dim[0]+"px"
                        });
                        width_set = true;
                    } else {
                        // weite vom Floatcontainer zuzüglich der Componenten Weite
                        // ergibt die Floatcontainer weite                        
                        width += comp_dim[0];
                        
                        temp_width = (temp_width < comp_dim[0])?comp_dim[0]:temp_width;
                        
                        // ist die neue Weite nun größer als die Hauptcontainer Weite 
                        // dann setze die Floatcontainer Weite aif die temporäre Weite
                        // welche die Weite des größten Elements ist
                        if(width > cont_dim[0]) {
                            Element.attrib(inner_box,'style',{
                                width:temp_width+"px"
                            });

                            width_set = true;
                        }
                    }
                } 
            }

            if(i > 0 && (self.hgap || self.vgap) ) {
                child.setAttribute("margin",margin);
            }
        }
        
        if(!width_set) {
            var h_gap_width  = 0;
            
            if(self.hgap)
                h_gap_width = container.contains().length*self.hgap;
                
            Element.attrib(inner_box,'style',{
                width:(width+h_gap_width)+"px"
            });
        }
    };

    /**
     * Berechnet die Hauseigenen Layout Dimensionen
     * die Weite wird bestimmt durch alle Weiten der Kindelemente
     * die Höhe wird bestimmt durch das höchste Element im Layout
     *@access public
     *@param Container mit dem Layout
     *@return Array [width,height]
     */
    
    this.getLayoutDimension = function(container){
        
        var width  = container.getSize()[0];
        var height = container.getSize()[1];

        var w = null;
        var h = null;
        
        var full_height = height;
        var full_width  = width;
                
        var c_length = container.contains().length;
        
        for(var i= 0; i < c_length ;i++) {
            with(container.contains()[i]) {

                var d = getDimension().getComponentDimension();
                
                if(width == null) {
                    w = d[0]; 
                    full_width += d[0];
                }
                
                if(height == null) {
                    h = d[1];
                    if(full_height < h) full_height = h;
                }
            }

        }        
        
        if(!full_width && !full_height) {
            var full_height = container.getComponent().offsetHeight;
            var full_width  = container.getComponent().offsetWidth;

            if(!full_height && !full_width)
                return [0,0];
        }
            
        var p = container.getAttribute('padding');

        if(self.hgap) full_width  += self.hgap*container.contains().length;
        
        if(self.vgap) full_height += self.vgap;
        
        full_width  += p.left+p.right;
        full_height += p.top+p.bottom;

        container.setSize(full_width,full_height);
        
        return [full_width,full_height];
    };

    this.removeComponent = function( component ) {};
    
    this.removeComponents = function(){}

    this.getName = function () {
        return "FlowLayout";
    };
	
    this.cloneLayout = function( clonedLayer ){
        clonedLayer.setLayout( new FlowLayout(self.getHGap(), self.getVGap(), _float ) );
		
        for(var i = 0 ; i < this.contains().length; i++) {
            var clonedChild = this.contains()[i].clone();
            clonedLayer.add( clonedChild );
        }
		
    };
	
};

/**
*BorderLayout Klasse 
*das klassische 3 Spalten Layout
*@access public
*@param int hgap
*@param int self.vgap
*/
function BorderLayout(hg,vg){
    
    Layout.call(this,hg,vg);
    
    /**
            *Reinfolge in der die Panels durchlaufen werden
            */
    var PANEL = {
        NORTH:null,
        WEST:null,
        CENTER:null,
        EAST:null,
        SOUTH:null
    };
    
    var self = this;
    
    var clear = false;
    
    /**
            *dem Container der das Layout besitzt ein Element hinzufügen 
            *wird aufgerufen in der Container.loadComponents
            *@access public
            *@param Object Container wo soll es rein
            *@param Object Component was soll rein
            *@param String wo soll es rein [WEST|NORTH|EAST...]
            *@return void
            */
    this.addComponent = function(container,component,direction) {
     
        var dir = direction.toUpperCase();
        
        if(PANEL[dir]) {
            try {
                Element.unlink(PANEL[dir].getComponent());
            } catch (e) {};
        }

        PANEL[dir] = component;
        
        if(!clear) {
            container.setClassName("clearfix");
            clear = true;
        }
        
        var before = null;
        var found = false;

        if(container.getComponent().childNodes.length > 0) {
            for(var key in PANEL) {
                
                if(key != dir && !found) 
                    continue; 
                else 
                    found = true;

                if( PANEL[key] && key != dir ) {
                    before = PANEL[key].getComponent();
                    break;
                }
            }
        }

        if(!dir.match(/north/gi)) {
            Element.attrib(component.getComponent(),"style",{
                cssFloat:"left"
            });
        }

        if(before)
            container.getComponent().insertBefore(component.getComponent(),before);
        else
            Element.bind( component.getComponent(), container.getComponent() );
    };

    /**
     * entfernt eine Komponente aus dem Layout
     */
    this.removeComponent = function(component){

        var _delete = null;

        if(component.constructor === String ) {

            var key = component.toUpperCase();

            _delete = PANEL[key];
            PANEL[key] = null;
            
        } else {
            
            for(var key in PANEL){
                if(PANEL[key] == component) {
                    _delete = PANEL[key];
                    PANEL[key] = null;
                }
            }
            
        }

        self.componentRemoved( _delete );
    };

    /**
            * Kind Komponenten anordnen und positionieren
            * sowie Eigenschaften zuweisen wie Weite und Höhe der Componenten
            *@access public
            *@param Object Container
            *@return void
            */
    this.prepareLayout = function (container) {
    
        var dim = container.getDimension().getComponentDimension();
        var is_min_dimension = false;
        
        if(dim[0] == null || dim[1] == null) {
            // da der äußere Container keine Weite hat 
            // ist es nun eine mindest höhe
            is_min_dimension = true;
        } else {
            d = container.getDimension().availDimension();
        }
                
        /*Margin Werte speichern
        ========================*/
        var reduce_by = [0,0];
        
        if(self.hgap && PANEL.EAST)   reduce_by[0] += self.hgap;
        if(self.hgap && PANEL.WEST)   reduce_by[0] += self.hgap;

        if(self.vgap && PANEL.NORTH)  reduce_by[1] += self.vgap;
        if(self.vgap && PANEL.SOUTH)  reduce_by[1] += self.vgap;
                
        /* Weiten / bzw Höhen abspeichern
        ==================================*/
        var sh = (PANEL.SOUTH)?PANEL.SOUTH.getDimension().getComponentDimension()[1]:0;
        var nh = (PANEL.NORTH)?PANEL.NORTH.getDimension().getComponentDimension()[1]:0;

        var ew = (PANEL.EAST)?PANEL.EAST.getDimension().getComponentDimension()[0]:0;
        var ww = (PANEL.WEST)?PANEL.WEST.getDimension().getComponentDimension()[0]:0;
                
        /* Panels durchlaufen und die Größen anpassen 
        ==============================================*/
        for(key in PANEL) {

            if(!PANEL[key]) continue;

            switch(key) {
                case "NORTH":
                    // margin unten setzen 
                    PANEL.NORTH.setAttribute("margin","0 0 "+self.vgap+"px");
                    
                    if(is_min_dimension) {
                        PANEL.NORTH.setSize(null,null);
                        PANEL.NORTH.setMinSize(d[0],nh);
                    } else {
                        PANEL.NORTH.setSize(d[0],nh);
                    }
                    
                    break;
                case "SOUTH":
                    // margin oben setzen
                    PANEL.SOUTH.setAttribute("margin",self.vgap+"px 0 0");

                    var dim = new Dimension(PANEL.SOUTH);
                    dim.setSize(d[0],sh);
                    PANEL.SOUTH.setSize(dim);
                    
                    break;
                case "WEST":
                    // margin rechts setzen
                    PANEL.WEST.setAttribute("margin","0 "+self.hgap+"px 0 0");
                    
                    var h = d[1]-(nh+sh)-reduce_by[1];
                    
                    h = (h<0)?0:h;                    
                    
                    if(is_min_dimension) {
                        PANEL.WEST.setSize(null,null);
                        PANEL.WEST.setMinSize(ww,h);
                    } else {
                        PANEL.WEST.setSize(ww,h);
                    }
                    
                    break;
                case "EAST":
                    // margin links setzen
                    PANEL.EAST.setAttribute("margin","0 0 0 "+self.hgap+"px");
                    
                    var h = d[1]-(nh+sh)-reduce_by[1];
                                        
                    h = (h<0)?0:h;
                    
                    if(is_min_dimension) {
                        PANEL.EAST.setSize(null,null);
                        PANEL.EAST.setMinSize(ew,h);
                    } else {
                        PANEL.EAST.setSize(ew,h);
                    }
                    
                    break;
                default:

                    var w = d[0]-(ww+ew);
                    var h = d[1]-(nh+sh);
                    var cd = null; // CENTER DIMENSION

                    w -= reduce_by[0];
                    h -= reduce_by[1];
                                        

                    w = (w<0)?0:w;
                    h = (h<0)?0:h;
                    
                    if(is_min_dimension) {
                        PANEL.CENTER.setSize(null,null);
                        PANEL.CENTER.setMinSize(w,h);
                    } else {
                        PANEL.CENTER.setSize(w,h);
                    }

                    cd = PANEL.CENTER.getDimension().availDimension(); // center Dimension
                    
                    // alle Kindelemente anpassen vom Zentrum
                    if(PANEL.CENTER.contains) {
                        var childs = PANEL.CENTER.contains();
                        
                        if(!PANEL.CENTER.hasLayoutManager() ) {
                            for(var i = 0; i < childs.length;i++) {
                                childs[i].setSize(cd[0],cd[1]);
                            }
                        } 
                    }
            }
        }
    };

    this.removeComponents = function() {
        PANEL = {
            NORTH:null,
            WEST:null,
            CENTER:null,
            EAST:null,
            SOUTH:null
        }
    };

    /**
     * Berechnet die Hauseigenen Layout Dimensionen 
     * die Weite wird bestimmt durch alle Weiten der Kindelemente
     * die Höhe wird bestimmt durch das höchste Element im Layout
     * @access public
     *@param Container mit dem Layout
     *@return Array [width,height]
     */
    this.getLayoutDimension = function (container){

        // full container width and height 
        var full_height = 0;
        var full_width  = 0;
        
        var ns_width    = 0; // north south width
        var ns_height   = 0; // north south height
        
        var ew_width    = 0; // east west width 
        var ew_height   = 0; // east west height
                
        // padding values
        var padding     = container.getAttribute('padding');
        
        for(key in PANEL)  {
            if(PANEL[key]) {
                // Nord und Süd Container bestimmen die Weite
                if(key.match(/(sou|nor)th/gi)) {
                    var p_dim = PANEL[key].getDimension().getComponentDimension();
                    
                    ns_height  += p_dim[1]+((self.vgap)?self.vgap:0);
                    
                    if(ns_width  < p_dim[0]) {
                        ns_width = p_dim[0];
                    }
                    
                }
                                
                // die Höhe bestimmt sich aus dem höchsten Element
                if(key.match(/(ea|we)st/gi)) {
                    var p_dim = PANEL[key].getDimension().getComponentDimension();
                    
                    if(ew_height < p_dim[1]) 
                        ew_height  = p_dim[1];
                        
                    // berechnen der weiten der einzelnen Container
                    ew_width += p_dim[0]+((self.hgap)?self.hgap:0);
                }
            }
        }
                
        if(PANEL.CENTER) {
            var center_dim = PANEL.CENTER.getDimension().getComponentDimension();
            // zentrums Dimension mit Ost und West vergleichen was die Höhe angeht 
            if(center_dim[1] > ew_height)
                full_height = center_dim[1]+ns_height;
            else 
                full_height = ew_height+ns_height;
                
            full_width = ew_width+center_dim[0];
        }
        
        if(full_height == 0) full_height = 19;
        
        if( ns_width > full_width)  full_width = ns_width;

        // Padding hinzufügen
        full_width  += padding.right+padding.left;
        full_height += padding.top  +padding.bottom;
            
        // Container Dimensionen setzen
        container.setSize(full_width,full_height);
        
        return container.getSize();
    };
    
    this.getLayoutComponents = function () {
        return PANEL;
    };
    
    this.getName = function () {
        return "BorderLayout";
    };

    this.cloneLayout = function( clonedLayer ){
        clonedLayer.setLayout ( new BorderLayout( self.getHGap(), self.getVGap() ) );
		
        for(var key in PANEL) {
            if(!PANEL[key]) continue;
			
            var clonedChild = PANEL[key].clone();
            clonedLayer.add( clonedChild , key);
        }
    };
	
};

/**
* Class GridLayout
* erstellt ein GitterLayout wo jede Zelle gleichgroß ist
*@access public
*@param int Zeilen
*@param int Reihen
*@param [int hGap]
*@param [int hVap]
*/
function GridLayout(cols,rows,hg,vg){

    Layout.call(this,hg,vg);

    // zeilen
    var rows = rows;

    // spalten
    var cols = cols;

    // eingefügte Elemente als Zahl damit nicht zuviele reingehaun werden
    // default 0
    var elements = 0;
    
    var self = this;
    
    var clear_box_set = false;

    var panels = [];

    /**
    *dem Container der das Layout besitzt ein Element hinzufügen
     *wird aufgerufen in der Container.loadComponents
    *@access public
    *@param Object Container worin es eingefügt wird
    *@param Object component was eingefügt wird
    *@return void
    */
    this.addComponent = function(container,component){
        
        var full = ((rows)?rows:1)*((cols)?cols:1);
        
        if(elements == full || (!cols && !rows) ) return;

        if(!clear_box_set) {
            clear_box_set = true;
            container.getComponent().className = "clearfix";
        }
        
        panels.push(component);
        
        Element.bind(component.getComponent() , container.getComponent() );
        component.setAttribute("cssFloat","left");  

        elements++;
    };
    
    function getInnerDimensions(container){
        var h = 0;
        var w = 0;
        
        for(var i = 0 ; i < container.contains().length;i++) {
            var panel_dim = container.contains()[i].getSize();
            
            if(panel_dim[0] > w)  w = panel_dim[0];
            if(panel_dim[1] > h)  h = panel_dim[1];
        }

        w = w*((cols)?cols:1)+((cols-1)*self.hgap);
        h = h*((rows)?rows:1)+((rows-1)*self.vgap);
                        
        return [w,h]
    };

    /**
    * das Layout vorbereiten wird aufgerufen in der Container.loadComponents
    *@access public
    *@param Object Container
    *@return void
    */
    this.prepareLayout = function (container) {
        var dim = container.getDimension().availDimension();
        
        /*
                        * Das Element suchen welches am höchsten ist bzw am weitesten ist und abspeichern
                        * sofern keine Dimension vom aktuellen Container gegeben ist welcher das Layout enthält
                        */
        if(!dim[0] && !dim[1]) {
            dim = getInnerDimensions(container);
            container.setSize(dim[0],dim[1]);
        }

        // Anpassung der gesamt Weite und gesamt Höhe
        // spalten weite = 
        // gesammt weite MINUS
        // Anzahl der Spalten MINUS
        // (linkes und rechts Element da diese am Rand liegen) PLUS 
        // 1 mehr um die Anzahl der mittleren Elemente anzupassen MULTIPLIZIERT MIT
        // horizontales margin | vertikales Margin
        // 
        // Bsp:
        // [   1  ]hgap[   2   ]hgap[   3  ]
        //  self.vgap          self.vgap          self.vgap
        // [   4  ]hgap[   5   ]hgap[  6   ]
        dim[0] -= (cols-1)*self.hgap;
        dim[1] -= (rows-1)*self.vgap;
        
        var element_width  = dim[0]/((cols)?cols:1);
        var element_height = dim[1]/((rows)?rows:1);

        var rest_horizontal = dim[0]%((cols)?cols:1);
        var rest_vertikal   = dim[1]%((rows)?rows:1);

        var row_count = 1;
        var passed_row = 0;

        for(var i = 0,k=0; i < container.contains().length;i++,k++){
        
            var margin = {
                top:0,
                right:0,
                bottom:0,
                left:0
            };
        
            if(row_count%rows != 0 || row_count == 0 && row_count < rows) {
                // margin unten setzen
                margin.bottom = self.vgap;
            }
        
            if( ((i+1)%cols != 0 || i == 0) ) {
                margin.right = self.hgap;
            } else {
                row_count++;
            }
            
            container.contains()[i].setAttribute("margin", margin);

            // die größe von den Kindelement setzen
            with(container.contains()[i]) {
                if(k != 0 && k%cols == 0) k = 0;
                if(i%cols == 0 && i != 0) passed_row++;

                if(rest_horizontal > 0) {
                    element_width  = dim[0]/((cols)?cols:1);

                    if(k < rest_horizontal) element_width = Math.ceil(element_width);
                    else                    element_width = Math.floor(element_width);
                }

                // sind wir in der letzten Reihe 
                if(rest_vertikal > 0) {
                    element_height = dim[1]/((rows)?rows:1);
                    
                    if(passed_row < rest_vertikal) 
                        element_height = Math.ceil(element_height);
                    else
                        element_height = Math.floor(element_height);
                }
                
                setSize(element_width,element_height);
            }
        }
    };

    /**
    * gibt die Dimension des GridLayout's zurück
    * hierbei wird das weiteste Element bestimmt
    * und dann noch das höchste so das alle gleichgroß werden
    */
    this.getLayoutDimension = function (container){
    
        var d = getInnerDimensions(container);
        var p = container.getAttribute("padding");
        
        var w = parseInt( d[0]+p.right+p.left, 10);
        var h = parseInt( d[1]+p.top+p.bottom, 10);
        
        return [w,h];
    };
    
    this.getRows = function(){
        return rows;
    };
    
    this.getCols = function(){
        return cols;
    };

    this.getName = function () {
        return "GridLayout";
    };

    this.setRows = function( rowNum ){
        rows = parseInt( rowNum, 10);
    }

    this.setCols = function( colNum){
        cols = parseInt( colNum, 10);
    }

    this.removeComponent = function( component ) {

        var panelsLen = panels.length;
        
        for(var i = 0 ; i < panelsLen;i++) {
            if(panels[i] === component) {
				
                var remove = panels[i];
                panels.splice(i,1);
                elements--;

                self.componentRemoved( remove );
                break;
            }
        }
    };

    this.removeComponents = function() {
        panels   = [];
        elements = 0;
    };

    this.cloneLayout = function( clonedLayer ){
		
        clonedLayer.setLayout ( new GridLayout(cols, rows, self.getHGap(), self.getVGap() ) );
		
        for(var i = 0 ; i < this.contains().length; i++) {
            clonedLayer.add( this.contains()[i].clone() );
        }
		
    };
};

function Dimension(){

    var width  = null;
    var height = null;

    var min_height = null;
    var min_width  = null;
    
    var max_height = null;
    var max_width  = null;
    
    var dimension_set = false;
    
    var component    = arguments[0];
    
    function getComponentDimension(c) {
    
        var cd_width  = 0;
        var cd_height = 0;
    
        if(typeof width == "number" && typeof height == "number")  {        
            return getSize();
        } else {        
            // hat das Element einen Layout Manager
            if(component.hasLayoutManager()) {
            
                // hat es einen Layout Manager dann überlassen wir dem LayoutManager das
                // berechnen der Höhen und Weiten
                var d = component.getLayoutManager().getLayoutDimension(component);
                
                if(!d[0] && !d[1]) {
                
                    cd_width  = parseInt(Element.cssValue(component.getComponent(),'width'));
                    cd_height = parseInt(Element.cssValue(component.getComponent(),'height'));
                    
                    var p = component.getAttribute("padding");
                    
                    if(!cd_width)  cd_width  = 0;
                    if(!cd_height) cd_height = 0;
                    
                    component.setSize(cd_width+p.left+p.right,cd_height+p.top+p.bottom);
                    
                } else {
                    cd_width  = d[0];
                    cd_height = d[1];
                }
                
            } else {
                // das aktuelle Element kann keine Kindelemente haben (BitLabel | BitButton)
                if(!component.contains) {    
                
                    // für den IE die Höhen und weiten parsen
                    if(navigator.userAgent.match(/msie/gi)) {
                        Element.trim(component.getComponent());
                        
                        if(component.getComponent().innerHTML == "") {
                        
                            cd_width  = 0;
                            cd_height = 0;
                            
                        } else {
                        
                            if ( !Dimension.dummy ) {
                                Dimension.dummy = Element.create("span");
                                Element.bind( Dimension.dummy , "body" );
                            }
                            
                            Dimension.dummy.appendChild( component.getComponent().cloneNode( true ) );
                        
                            /*
                            function getHeightDimension(compo){
                                var childs = compo.childNodes.length;
                                
                                for(var i = 0 ; i < childs;i++) {
                                    if(compo.childNodes[i].nodeName == "#text")  {
                                        return compo.childNodes[i].parentNode.offsetHeight;
                                    } else {
                                        if(compo.childNodes[i].childNodes.length > 0)
                                            return getHeightDimension(compo.childNodes[i]);
                                    }
                                }
                                return 0;
                            };
                            */
                        
                            var p = component.getAttribute("padding");
                            
                            cd_height = Dimension.dummy.offsetHeight + p.top  + p.bottom;
                            cd_width  = Dimension.dummy.offsetWidth  + p.left + p.right;
                            
                            width  = cd_width; 
                            height = cd_height; 
                            
                            Dimension.dummy.innerHTML = ""; 
                        }
                        
                    } else {
                        var padding = component.getAttribute("padding");
                        
                        cd_height = component.getComponent().offsetHeight;
                        cd_width  = component.getComponent().offsetWidth;

                        cd_height += padding.top  + padding.bottom;
                        cd_width  += padding.left + padding.right;

                        width  = cd_width;
                        height = cd_height;
                    }
                    
                    component.setMinSize(cd_width,cd_height);
                } else {
                    var p = component.getAttribute("padding");

                    for(var i = 0 ; i < component.contains().length;i++) {
                        
                        with(component.contains()[i]) {
                            var child_dimension = getDimension().getComponentDimension();
                            
                            // das Element selbst hat eine Höhe und eine Weite
                            if(child_dimension[1] != null)
                                cd_height += child_dimension[1]+(p.top+p.bottom);
                                
                            if(child_dimension[0] != null)
                                cd_width += child_dimension[0]+(p.left+p.right);
                                
                        }
                    }
                }
            }
            return [cd_width,cd_height];
        }
    };
    
    function availDimension() {
        
        var padding = component.getAttribute('padding');
        
        var new_width  = null;
        var new_height = null;
                
        var aw = (width)?width:(min_width)?min_width:null;
        var ah = (height)?height:(min_height)?min_height:null;
        
        if(aw != null) new_width  = aw-(padding.left+padding.right) ;
        if(ah != null) new_height = ah-(padding.top+padding.bottom);
        
        var w = 0;
        var h = 0;
                
        if( aw != null ) w = (new_width  < 0)?0:new_width;
        if( ah != null ) h = (new_height < 0)?0:new_height;

        return [w,h];
    }
    
    function setSize(){
        if(arguments[0] != null && arguments[0].constructor == Dimension) {
            width  = arguments[0].getSize()[0];
            height = arguments[0].getSize()[1];
        } else {
            width  = arguments[0];
            height = arguments[1];
        }
    };
    
    function setMinSize(w,h){
        min_height = h;
        min_width  = w;
    };
    
    function setMaxSize(w,h){
        max_width  = w;
        max_height = h;
    };
    
    /**
            * gibt die minimalen größen einer Componente zurück
            *@access public
            *@return Array[int width , int height]
            */
    function getMinSize(){
        return [min_width,min_height];
    };

    /**
            * gibt die maximalen größen einer Componente zurück
            *@access public
            *@return Array[int width , int height]
            */    
    function getMaxSize(){
        return [max_width,max_height];
    };

    function getSize(){
        return [width,height];
    };
    
    function dimensionSet () {
        return dimension_set;
    }

    this.setSize               = setSize;
    
    this.setMaxSize            = setMaxSize;
    
    this.setMinSize            = setMinSize;
    
    this.getSize               = getSize;
    
    this.getMinSize            = getMinSize;
     
    this.getMaxSize            = getMaxSize;
        
    this.availDimension        = availDimension;
    
    this.dimensionSet       = dimensionSet;
    
    this.getComponentDimension = getComponentDimension;
};

Dimension.dummy = null;

/**
* Class BitComponent
*/
function BitComponent(){

    var left   = null;
    var right  = null;

    var layoutSet  = false;
    
    var uid        = Element.generateId(8);
    
    var component  = null;
    
    var background = null;

    var component_attribute = {};
        
    var content_from  = null;
        
    var dimension     = null;
    
    var parent_object = null;
    
    var observer      = [];
	
    var cloned        = null;
    
    var htmlContentSet = false;
    
    /**
           * die Komponente vorbereiten und CSS Attribute zuweisen
           *@access public
           *@return void
           */
    function prepareComponent(){        
        var d = this.getDimension().availDimension();
        
        this.setAttribute('width',d[0]+"px");
        this.setAttribute('height',d[1]+"px");
        this.setAttribute('overflow',"hidden");
               
        Element.attrib(component,"style",component_attribute);
    };
            
    function setBackground(color){
        background = color;
        component_attribute['background'] = color;
    };
    
    function getBackground(color){
        return background;
    };
    
    /**
            *legt den CSS Klassennamen fest
            *@access public
            *@param String
            *@return void
            */
    function setClassName(cssName){        
        if(Element.trim(component.className) != "") {
            
            var regExp = new RegExp('\\s?'+cssName+'\\s?');

            if(!regExp.test(component.className))
                component.className += " "+cssName;
        } else
            component.className = cssName;
    };
    
    /**
          *legt den CSS Klassennamen fest
         *@access public
         *@param String
         *@return void
         */    
    function removeClassName(cssName){
        var pattern = new RegExp("([\\s]+)?"+cssName,"gi");
        component.className = component.className.replace(pattern,'');
    };
    
    /**
            *legt eine ID für das Element fest
            *muss eindeutig sein sonst Fehler
            *@access public
            *@param String
            *@return void
            */
    function setId(id){
        if(!Element.get(id)) component.id = id;
        else alert("id :"+id+" ist schon vergeben");
    };
    
    function getId(){
        return component.id;
    };
    
    /**
            *setzt die Componente fest HTML Element
            *@access public
            *@param HTML Element 
            *@return void
            */
    function setComponent(c){
        component = c;
        dimension = new Dimension(this);
    };
    
    /**
     * ein CSS Attribute festlegen
     * position , weite , höhe etc
     *@access public
     *@param String
     *@param String | int | float 
      *@return void
      */
    function setAttribute(cssAttribute,value){

        if(cssAttribute == "padding" && typeof value == "string") {
            value = value.split(" ");

            switch ( value.length ) {
                case 1:
                    var p =  parseInt( value[0], 10 );
                    value = { top:p, right:p, bottom:p, left:p };
                    break;
                case 2:
                    var p_t_b = parseInt( value[0],10);
                    var p_l_r = parseInt( value[1],10);

                    value = { top:p_t_b, right:p_l_r, bottom:p_t_b, left:p_l_r };
                    break;

                case 3: 
                    var p_t   = parseInt( value[0], 10);
                    var p_b   = parseInt( value[2], 10);
                    var p_l_r = parseInt( value[1], 10);
                    
                    value = { top:p_t, right:p_l_r, bottom:p_b, left:p_l_r };
                    break;

                case 4:
                    value = {
                        top   : parseInt(value[0], 10),
                        right : parseInt(value[1], 10),
                        bottom: parseInt(value[2], 10),
                        left  : parseInt(value[3], 10)
                    };
                    break;
            }
        }

        component_attribute[cssAttribute] = value;
    };
    
    function getUID (){
        return uid;
    };
    
    function getDimension(){
        return dimension;
    }
    
    function setSize (w,h) {
        if(!dimension) 
            dimension = new Dimension(this);

        dimension.setSize(w,h);
    };
    
    function setMinSize (w,h){
        dimension.setMinSize(w,h);
    };
    
    function setMaxSize (w,h){
        dimension.setMaxSize(w,h);
    };
    
    function getSize () {
        return dimension.getSize();
    };
    
    function getMinSize(){
        return dimension.getMinSize();
    };
    
    function getMaxSize(){
        return dimension.getMaxSize();
    };
    
    /**
            * gibt die aktuelle HTML Componente zurück
            *@access public
            *@return void
            */
    function getComponent(){
        return component;
    };
    
    function getContentFrom(id_html_obj) {
        content_from = Element.get(id_html_obj).innerHTML; 
        Element.get(id_html_obj).innerHTML= ""
    };
    
    function isSlaveFrom(parent) {
        parent_object = parent;
    };
    
    function getParentComponent() {
        return parent_object;
    };
    
    function loaded(){};
    
    this.notifyObserver = function (){
        for(var i = 0 ; i < observer.length;i++)
            observer[i].ready();
    };
    
    this.addObserver = function(obs){
        observer.push(obs);
    };
    
    this.setAttribute = setAttribute;

    this.getAttribute = function( attribute){
        if( !component_attribute[attribute] ) {
            switch ( attribute ) {
                case 'padding':
                    this.setAttribute(attribute, Element.getPadding( component ) );
                    component.style.padding = "0px";
                    break;
            }
        }
        return component_attribute[attribute];
    }

    /** 
     */
    this.setContent = function( contentNode ){
        
        if ( contentNode.nodeName == "#document-fragment" )
            component.appendChild ( contentNode.cloneNode( true ) ); 
        else
            component.appendChild ( contentNode );
            
        htmlContentSet = true;
    };
    
    this.getHtmlContent = function() {
        return htmlContentSet;
    };    
    
    this.clearHtmlContent = function() {
        htmlContentSet = false;
    };
    
    this.getUID = getUID;

    this.setComponent = setComponent;

    this.getComponent = getComponent;

    this.setBackground = setBackground;
    
    this.getBackground = getBackground;
        
    this.prepareComponent = prepareComponent;
    
    this.setClassName = setClassName;
    
    this.removeClassName = removeClassName;

    this.hasLayoutManager = function () {
        return false;
    };

    this.setId = setId;
    
    this.getId = getId;
    
    this.setSize        = setSize;
    
    this.setMinSize     = setMinSize;
    
    this.setMaxSize     = setMaxSize;
    
    this.getDimension   = getDimension;
    
    this.getContentFrom = getContentFrom;
    
    this.getSize        = getSize;
    
    this.getMinSize     = getMinSize;
    
    this.getMaxSize     = getMaxSize;
    
    this.isSlaveFrom    = isSlaveFrom;
    
    this.getParentComponent = getParentComponent;
    
    this.loaded = loaded;
      
    this.init = function(){};

    this.clone = function(){
        if(!cloned) {
            var dim = this.getSize();
		
            cloned = this.cloneComponent();
            cloned.setSize(dim[0], dim[1]);
            cloned.setBackground( this.getBackground() );
				
            var lm = null; // Layout Manager
			
            if( lm = this.getLayoutManager() ) {
                lm.cloneLayout.call(this, cloned);
            } else {
                for(var i = 0 ; i < this.contains().length ; i++) {
                    cloned.add ( this.contains()[i].clone() );
                }
            }
        }
        return cloned;
    };
	 
    this.hasContentFrom  = function (){
        return content_from;    
    };
};

/**
* Class BitContainer
* erbt von BitComponent
* erstellt einen DIV Layer welches als Container dient
* Basis für BitPanel und BitFrame
*/
function BitContainer(){
    // Vererbung mittels Apply realisieren
    BitComponent.apply(this);

    var childComponents = [];
	
    var layoutManager   = new FlowLayout();
    
    this.setComponent(Element.create("div"));

    /**
     * Componenten alle Laden dabei befinden wir uns im Container Objekt welches eben bearbeitet wird
     * das aktuelle kindobjekt wird nun im Panel eingebunden und dann auf Kinder geprüft
     * sollte das Kind weitere Objekte besitzen dann rufen wir die Funktion loadComponents im Contextes des Kind Objektes auf
     * und prüfen wieder nach Kindelementen
     *@access private
     *@return void
     */
    function loadComponents(){
        
        if(this.hasContentFrom()) {
            this.getComponent().innerHTML = this.hasContentFrom(); 
        }
        
        this.init();
        
        if(this.hasLayoutManager()) {
            this.getLayoutManager().prepareLayout(this);
        } 
        
        // Elternelement vorbereiten
        this.prepareComponent();    
        
        // dann Kindelemente vorbereiten
        if(this.contains) {            
            for(var i = 0 ; i < this.contains().length;i++) {
                loadComponents.call(this.contains()[i]); 
            }            
        }     
        
        this.notifyObserver();
        
        this.loaded.call(this);
    };

    /**
            * Sichtbarkeit gewährleisten 
            * sollte es sich beim aktuellen Element um ein Frame handeln dann wird es im Body eingebunden
            * und die Componenten werden geladen
            *@access public
            *@param boolean 
            *@return void
            */ 
    function show(visible){
        
        loadComponents.call(this);

        if(visible) Element.show(this.getComponent());
        else        Element.hide(this.getComponent());
    };

    /**
            * gibt die Kindelemente zurück
            *@access public
            *@return array
            */
    function contains(){
        return childComponents;
    };

    /**
            * eine Componente zum aktuellen Container hinzufügen
            *@access public
            *@param Component
            *@return void
            */       
    function add(component,d){
        if(layoutManager) {
            layoutManager.addComponent(this,component,d);
        } else {
            Element.bind(component.getComponent(),this.getComponent());
        }
        
        component.isSlaveFrom(this);
        childComponents.push(component);
    };

    /**
     * entfernt eine einfache Komponente
     * @access public
     * @param Component
     */
    this.removeComponent = function (layer ){

        if(layoutManager) {
            layoutManager.removeComponent( layer );
            layoutManager.componentRemoved( function ( node ) {
                for(var i = 0 ; i < contains().length;i++) {
                    if(contains()[i] == node ) {
                        Element.unlink(contains()[i].getComponent());
                        childComponents.splice(i, 1);
                        node = null;
                        break;
                    }
                }
            });
        }
    };

    function removeComponents(){
        for(var i = 0 ; i < contains().length;i++) {
            
            if( layoutManager )
                layoutManager.removeComponents();

            Element.unlink(contains()[i].getComponent());
        }
    
        childComponents = [];
    };

    /**
     * ein Layout zu einen aktuellen Container hinzufügen
     *@access public
            *@param Layout
            *@return void
            */
    function setLayout(LayoutManager){
        layoutManager = LayoutManager;

        if(layoutManager) {
            layoutManager.onRemoveComponent(function( layer ){
                for(var i = 0 ; i < contains().length;i++) {
                    if(contains()[i] == layer) {
                        Element.unlink(contains()[i].getComponent());
                        childComponents.splice(i, 1);
                        break;
                    }
                }
            });
        }
    };

    /**
            * gibt den LayoutManager zurück vom aktuellen Container
            *@access public
            *@return [FlowLayout|BorderLayout|GridLayout]
            */   
    function getLayoutManager(){
        return layoutManager;
    };

    /**
            * gibt die aktuellen Container Werte wieder wie Höhe , Weite , position von Links , position von Oben
            *@access public
            *@return Object
            */
    function getContainerProperties(){
        return Element.getCoords(this.getComponent());
    };

    /**
            * gibt zurück ob ein Container einen Layoutmanager besitzt
            *@access public
            *@return boolean
            */
    function hasLayoutManager(){
        if(getLayoutManager()) return true;

        return false;
    };
    
    /**
            * wird in der Methode show aufgerufen
            * wenn der Container fertig geladen wurde
            *@access public
            *@return void
            */
    function loaded(){};

    this.contains = contains;

    this.add = add;

    this.show = show;

    this.setLayout = setLayout;

    this.hasLayoutManager = hasLayoutManager;
    
    this.getLayoutManager = getLayoutManager;
    
    this.removeComponents = removeComponents;
        
    this.getContainerProperties = getContainerProperties;
      
    this.repaint = function () {};
};

/**
* Klasse BitLabel
* erstellt einen Absatz und fügt diesem Text hinzu
*/
function BitLabel(text){
    BitComponent.apply(this);
    this.setComponent(Element.create("span",(text)?text:""));
};

function BitButton(text, slideButton){
    BitComponent.apply(this);

    this.setComponent(Element.create("a", 
        (function(){
            if(slideButton) {
                return "<span class='sprite'>"+((text)?text:"")+"</span>";
            }
            return (text)?text:"";
        })()
        ));

    this.setClassName("sprite"+( (slideButton)?" slide_button":"" ) );
    
    Element.attrib(this.getComponent(),"style",{
        cssFloat:"left",
        overflow:"hidden"
    })
    this.getComponent().href = "#";
    
    function addAction(event,callback){
        Element.addEvent(this.getComponent(),event,callback);
    };
    
    function removeAction(event,callback){
        Element.unlinkEvent(this.getComponent(),event,callback);
    };
    
    this.addAction = addAction;
    
    this.removeAction = removeAction;
};

/**
* Class BitFrame
* ein einfaches Fenster
*@param [String title]
*/
function BitFrame(title){
    BitContainer.apply(this);
    WindowManager.addWindow(this);

    // ist das Fenster vergrößerbar default ja
    var resizeAble = true;
    
    // Fenster Title
    var title = title;

    // das eigene Objekt 
    var frame = this;
    
    // sobald dem Fenster ein eigenes Layout zugewiesen wurde
    // wird die ContentPane nicht mehr überschrieben sondern bleibt bestehen
    // und bekommt das Layout
    var hasOwnLayout = false;
    
    // alte Fenster Dimensionen werden hier gespeichert
    // wenn Vollbild gemacht werden soll
    // oder das Fenster vergrößert verkleinert wird
    var old_dim     = null;
    
    var full_screen = false;
    
    // ist das Fenster schon im Dokument eingebunden und nur unsichtbar
    var in_document  = false;
    
    // sollen Buttons etc zum Fenster hinzugefügt werden
    var undecorated = false;
    
    // der Titel des Fensters , wenn keiner über den Konstruktor kam
    // dann erstmal BitFrame kann noch über die öffentliche Methode
    // BitFrame.setTitle(angegeben werden)
    var frame_title  = (title)?title:"BitFrame";
    
    // Frame Koordinaten zwischengespeichern
    // bei Resize und Drag Drop
    var frame_coords = null;
    
    // der Frame wurde aufgehoben und wird nun bewegt
    var frame_dragged = false;
    
    // Kopfleiste des Fensters
    var head        = new BitPanel();
        head.setClassName("head_window");
    
    // hauptzeichenfläche des Fensters
    var contentPane = new BitPanel();
    
    // Statusleiste des Fensters
    var foot        = new BitPanel();
        foot.setClassName("foot_window");
        foot.setSize(0,0);
    
    // die Methoden speichern damit sie nicht überschrieben werden
    // da der Rahmen erst später ausgeschalten werden kann ist es 
    // notwendig die Methoden zu erhalten da sie sonst bereits überschrieben 
    // waren wenn die Methode createFrame aufgebaut wurde
    var f_layout = frame.setLayout;
    var f_add    = frame.add;

    var frame_fixed = false;
        
    /*
    * Fenster Rahmen erstellen ich glaube ne eigene Window Klasse wäre fast besser dafür
    * setzt sich zusammen aus 3 Teilen links , zentrum und rechts
    */
    var corners = {};
    
    // in welche richtung soll resized werden
    // mögliche Kombinationen
    
    // [ 0,0] kein resize
    
    // [ 1,0]  resize nach rechts ( E )
    // [-1,0]  resize nach links ( W ) 
    
    // [0, 1]  resize nach oben ( N ) 
    // [0,-1]  resize nach unten ( S )
    
    // [ 1,1]  resize nach rechts oben ( NE )
    // [-1,1]  resize nach links oben ( NW )
    
    // [ 1,-1]  resize nach rechts unten ( SE )
    // [-1,-1]  resize nach links unten ( SW )
    var resize_direction = [0,0];
    
    // der resize Dummy für vergrößern bzw verkleinern vom Fenster
    var resize_dummy = Element.create("div");
    
    var showBorder = true;

    var inner_frame = new BitPanel();

    var close,min,maxi = null;
    
    var posx = 0;
    
    var posy = 0;

    /**
            * Das Frame vorbereiten
            */
    function createFrame(){

        inner_frame.setLayout(new BorderLayout());

        inner_frame.add(contentPane,"CENTER");
        inner_frame.add(foot,"SOUTH");
        inner_frame.add(head,"NORTH");  
        
        f_layout(new BorderLayout(0,0)); 
                
        if(resizeAble || showBorder) {
            corners.tlc = new BitPanel(); // top_left_corner
            corners.trc = new BitPanel(); // top_right_corner 
            corners.tc  = new BitPanel();  // top_center
            corners.blc = new BitPanel(); // bottom_left_corner
            corners.brc = new BitPanel(); // bottom_right_corner
            corners.bc  = new BitPanel();  // bottom_center
            corners.rb  = new BitPanel();  // right_border
            corners.lb  = new BitPanel();   // left_border
            
            corners.tlc.setClassName("top_left_border");
            corners.trc.setClassName("top_right_border");
            
            corners.blc.setClassName("bottom_left_border");
            corners.brc.setClassName("bottom_right_border");
            
            corners.tc.setClassName("horizontal_border");
            corners.bc.setClassName("horizontal_border");
            
            corners.rb.setClassName("vertical_border");
            corners.lb.setClassName("vertical_border");
            
            //Fenster Haupt Rahmen erstellen
            var top_border = new BitPanel();
            top_border.setLayout(new BorderLayout(0,0));
            top_border.setSize(4,4);

            var bottom_border = new BitPanel();
            bottom_border.setLayout(new BorderLayout(0,0));
            bottom_border.setSize(4,4);
                
            corners.lb.setSize(4,4); // linke Seite größe festlegen
            corners.rb.setSize(4,4); // rechte Seite größe festlegen
                
            corners.tlc.setSize(6,4); // top left corner größe festlegen
            corners.trc.setSize(6,4); // top right corner einsetzen festlegen

            //oberen Rahmen erstellen
            //setzt sich zusammen aus 3 Teilen
            // linke obere Ecke 
            // oberes Zentrum
            // rechte obere Ecke
            top_border.add(corners.tlc,"WEST"); 
            top_border.add(corners.tc,"CENTER");
            top_border.add(corners.trc,"EAST"); 

            //unteren Rahmen erstellen
            //setzt sich zusammen aus 3 Teilen links , zentrum und rechts
            corners.blc.setSize(6,3);
            corners.brc.setSize(6,3);

            bottom_border.add(corners.blc,"WEST");
            bottom_border.add(corners.bc,"CENTER");
            bottom_border.add(corners.brc,"EAST");

            f_add.call(frame,top_border,"NORTH");
            f_add.call(frame,corners.lb,"WEST");
            f_add.call(frame,corners.rb,"EAST");
            f_add.call(frame,bottom_border,"SOUTH");
        } 
                
        f_add.call(frame,inner_frame,"CENTER");
    };

    /**
    *Buttons wie schließen , Minimieren und Maximieren erstellen sowie einbinden
    *@access private
    *@return void
    */
    function prepareButtons() {
        if(!undecorated) {
            var buttonPanel = new BitPanel();
            buttonPanel.setLayout(new FlowLayout(4,0,'left'));
        
            close = new BitButton();
            close.setSize(15,20);
            close.setClassName("close_window");
            
            if(resizeAble) {
                // die Frame Buttons
                maxi  = new BitButton();
                mini  = new BitButton();
                
                maxi.setSize(15,20);
                mini.setSize(15,20);
     
                maxi.setClassName("maximize_window");
                mini.setClassName("collapse_window");
                
                buttonPanel.add(mini);
                buttonPanel.add(maxi);
            }
            
            buttonPanel.add(close);
            head.add(buttonPanel,'EAST');
        }
    };

    /**
            * allgemeine Fensterevents festlegen 
            *@access private
            *@return void
            */
    function addWindowEvents(){
    
        if(!undecorated) {
            close.addAction("click",closedWindow);
            
            if(resizeAble) {
                maxi.addAction("click",maximizeWindow);
                mini.addAction("click",minimizeWindow);
            }
            
        }

        if(!frame_fixed)
            Element.addEvent(head.getComponent(),"mousedown",dragWindow);
    };

    /**
            *allgemeine Fensterevents wieder entfernen
            *@access private
            *@return void
            */
    function removeWindowEvents(){
        // alle Events löschen
        if(!undecorated) {
            close.removeAction("click",closeWindow);
            
            if(resizeAble) {
                maxi.removeAction("click",maximizeWindow);
                mini.removeAction("click",minimizeWindow);
            }
        }
        
        Element.unlinkEvent(head.getComponent(),"mousedown",dragWindow);
        Element.unlinkEvent(head.getComponent(),"mouseup",dropWindow);
        
    };
    
    function minimizeWindow(){};

    /**
            * Fenster maximieren wird durch einen Event ausgelöst
            *@access private
            *@param Object Event
            *@return void
            */
    function maximizeWindow(evt){
        var e = evt || window.event;
        Element.stopEvent(e);
    
        var t = e.srcElement || e.target;
            
        var w = 0;
        var h = 0;
    
        if(!full_screen) {
            var x = window.pageXOffset || document.documentElement.scrollLeft;
            var y = window.pageYOffset || document.documentElement.scrollTop;
            
            old_dim = frame.getContainerProperties();
                        
            // fenster Attribute setzen
            frame.setAttribute("left",x+"px");            
            frame.setAttribute("top",y+"px");   
            
            w = document.documentElement.clientWidth;
            h = document.documentElement.clientHeight;
                        
            full_screen = true;

            maxi.removeClassName("maximize_window");
            maxi.setClassName("minimize_window");
        } else {
            w = old_dim.w+2;
            h = old_dim.h+2;
            
            // fenster Attribute setzen
            frame.setAttribute("left",old_dim.posX+"px");            
            frame.setAttribute("top",old_dim.posY+"px"); 
                        
            full_screen = false;

            maxi.removeClassName("minimize_window");
            maxi.setClassName("maximize_window");
        }
        
        frame.setSize(w-2,h-2);   
        frame.show(true);
    };
            
    /**
            * Fenster entfernen nur der DIV wird gelöscht 
            * Events entfernt
            *@access private
            *@param Object Event
            *@return void
            */
    function closedWindow(evt){
        var e = evt || window.event;
        Element.stopEvent(e);
        
        WindowManager.closeWindow(frame.getUID());
    };
        
    /**
            * Fenster aufnehmen Drag and Drop starten
            *@access private
            *@param Object Event
            *@return void
            */
    function dragWindow(evt){
        var e = evt || window.event;
        // Element.stopEvent(e);
        
        // mousemove Event zum document hinzufügen 
        Element.addEvent(document,"mousemove",moveWindow);
        Element.addEvent(document,"mouseup",dropWindow);
        
        var fc = frame.getContainerProperties();
        frame_coords = Element.getMouseCoords(e);
        
        Object.extend(frame_coords,{
            frame_x:fc.posX,
            frame_y:fc.posY
        });
        
        frame_dragged = true;
    };
    
    /**
            * Fenster ablegen Drag und Drop stoppen
            *@access private
            *@param Object Event
            *@return void
            */
    function dropWindow(evt){    
        var e = evt || window.event;
        Element.stopEvent(e);
        
        // mousemove Event vom Document entfernen
        Element.unlinkEvent(document,"mousemove",moveWindow);
        Element.unlinkEvent(document,"mouseup",dropWindow);
        frame_dragged = false;
    };
    
    /**
            * Fenster bewegen
            *@access private
            *@param Object Event
            *@return void
            */
    function moveWindow(evt) {    
        if(!frame_dragged) return;
        
        var e = evt || window.event;
        Element.stopEvent(e);
        
        var newCoords = Element.getMouseCoords(e);
        
        var new_x = frame_coords.frame_x+(newCoords.mousex-frame_coords.mousex);
        var new_y = frame_coords.frame_y+(newCoords.mousey-frame_coords.mousey);
                     
        Element.attrib(frame.getComponent(),"style",{
            left:new_x+"px",
            top:new_y+"px"
        });
        
        // Selektion aufheben
        try {
            window.getSelection().removeAllRanges();
        } catch (e) {
            document.selection.clear();
        }
    };
    
    /**
           * Cursor über den Container ändern
           *@access private
           *@param Object Event mousdown
           *@return void
           */
    function startResize(evt){
        // events mousemove und mouse down anlegen
        var e = evt || window.event;
        Element.stopEvent(evt);

        // aktuelles Ziel
        var target = e.srcElement || e.target;

        // in welche Richtung muss resized werden
        for(key in corners) 
            if(corners[key].getComponent() == target) break;
            
        // code festlegen
        switch (key) {
            case "lb":
                resize_direction = [-1,0];
                break;
            case "rb":
                resize_direction = [ 1,0];
                break;
            
            case "trc":
                resize_direction = [ 1,1];
                break;
            case "tlc":
                resize_direction = [-1,1];
                break;
            case "tc":
                resize_direction = [ 0,1];
                break;
            
            case "blc":
                resize_direction = [-1,-1];
                break;
            case "brc":
                resize_direction = [ 1,-1];
                break;
            case "bc":
                resize_direction = [ 0,-1];
                break;
        }
        
        // Fenster Koordinaten zwischenspeichern
        frame_coords = Element.getCoords(frame.getComponent());
        
        // Mauskoordinaten holen und dem Object frame_coords hinzufügen
        Object.extend(frame_coords,Element.getMouseCoords(e));
        
        // dummy einbinden
        Element.attrib(resize_dummy,"style",{
            position:"absolute",
            top:frame_coords.posY+"px",
            left:frame_coords.posX+"px",
            height:frame_coords.h+"px",
            width:frame_coords.w+"px",
            border:"1px dashed"
        });
                
        Element.bind(resize_dummy,"body");
        
        Element.addEvent(document,"mouseup",stopResize);
        Element.addEvent(document,"mousemove",resizeDummy);
    };
    
    /**
           * resize stoppen und Event Listener für das Document wieder entfernen
           *@access private
           *@param Object Event mousehover
           *@return void
           */
    function stopResize(evt){
        var e = evt || window.event;
        Element.stopEvent(e);
              
        Element.unlinkEvent(document,"mouseup",stopResize);
        Element.unlinkEvent(document,"mousemove",resizeDummy);
        
        resize_direction = [0,0];
        frame_coords = {};
        
        Element.unlink(resize_dummy);
        
        frame.show(true);
    };
    
    /**
           * das Fenster vergrößern und verkleinern je nachdem
           *@access private
           *@param Object Event mousedown
           *@return void
           */
    function resizeDummy(evt){
        var e = evt || window.event;
        Element.stopEvent(e);
        
        var moved_x_by = 0;
        var moved_y_by = 0;
        
        // fenster neu berechnen nun
        var new_mouse_coords = Element.getMouseCoords(e); // die neuen Mauskoordinaten holen
        
        // neue frame koordinaten sind erstmal die alten frame koordinaten
        var new_frame_x = frame_coords.posX;
        var new_frame_y = frame_coords.posY;
                
        // horizontale Richtung
        switch (resize_direction[0]) {
            case -1: // links
                moved_x_by   = frame_coords.mousex-new_mouse_coords.mousex;
                new_frame_x -= moved_x_by; 
                break;
            case 1:  // rechts
                // hier ändert sich nur die Weite
                moved_x_by = new_mouse_coords.mousex-frame_coords.mousex;
                break;
        };
        
        // vertikale Richtung
        switch (resize_direction[1]) { 
            case -1: // unten
                // es ändert sich nur die Höhe
                moved_y_by = new_mouse_coords.mousey-frame_coords.mousey;
                break;
            case 1:  // oben
                moved_y_by   = frame_coords.mousey-new_mouse_coords.mousey;
                new_frame_y -= moved_y_by;
                break;
        };
        
        var new_width  = frame_coords.w+moved_x_by;
        var new_height = frame_coords.h+moved_y_by;
        
        Element.attrib(resize_dummy,"style",{
            width:new_width+"px",
            height:new_height+"px",
            left:new_frame_x+"px",
            top:new_frame_y+"px",
            zIndex:1000000
        });
        
        frame.setAttribute("top" ,new_frame_y+"px");
        frame.setAttribute("left",new_frame_x+"px");
        
        frame.setSize(new_width,new_height);
        
        frame_coords['buffer'] = [new_frame_x,new_frame_y];
    };
    
    /**
           * dem Fenster einen Titel hinzufügen  
           *@access public
           *@param String
           *@return void
           */     
    function setTitle(title){
        frame_title = title
    };

    /**
     * Methode Container.add überschreiben 
     * neue Elemente werden nun der Componente contentPane hinzugefügt
     *@access public
     *@param Container component
     *@return void
     */
    function add(component ){
        if(component.constructor == BitFrame) {
            WindowManager.addWindowToGroup(component.getUID(),this.getUID());
        } else {
            if(!hasOwnLayout) {
                contentPane = component;

                if ( in_document ) {
                    inner_frame.removeComponent ( "center" );
                    inner_frame.add ( component, "center" );
                    inner_frame.setVisible ( true );
                }

            } else
                contentPane.add(component,arguments[1]);
        }        
    };

    function setLayout(LayoutManager){
        contentPane.setLayout(LayoutManager);
        hasOwnLayout = true;
    };

    /**
            * Rückgabe der Hauptzeichenfläche des Fensters
            *@access public
            *@return Object Container
            */ 
    function getContentPane(){
        return contentPane;
    };

    /**
    *Überschriebene Methode setVisible von der Klasse Container ??? 
    *@access public
    *@param boolean
    *@return void
    */
    function setVisible(visible){

        if(!in_document) {
        
            // Fenster vorbereiten 
            createFrame();
            head.setLayout(new BorderLayout(2,0));

            if(!undecorated) {
                var title = new BitPanel();
                    title.setClassName("window_title");

                var title_outer = new BitPanel();
                    title_outer.setLayout(new FlowLayout(0,0,'left'));
                    title_outer.setClassName("window_title_outer");
                
                var title_text = new BitLabel ( frame_title );
                    title_text.setClassName("window_title_text");
                
                title_outer.add( title_text);
                title.add(title_outer);
                
                var window_icon = new BitPanel();
                window_icon.setClassName("icon_window");
                
                head.add(window_icon,"WEST");
                head.add(title,"CENTER");
                
                prepareButtons();
            } else {
                if( isNaN( head.getSize()[0] ) && isNaN( head.getSize()[1] ) )
                    head.setSize(15,15);
            }
            
            Element.bind(this.getComponent(),"body");
                        
            this.setAttribute("position","absolute");
            
            this.setAttribute("left",posx+"px");
            this.setAttribute("top",posy+"px");

            in_document = true;
            
            if(resizeAble) {
                for(key in corners)
                    Element.addEvent(corners[key].getComponent(),"mousedown",startResize);
                    
                corners.tlc.setAttribute("cursor","nw-resize");
                corners.trc.setAttribute("cursor","ne-resize");
                corners.tc.setAttribute("cursor","n-resize");
                
                corners.blc.setAttribute("cursor","sw-resize");
                corners.brc.setAttribute("cursor","se-resize");
                corners.bc.setAttribute("cursor","s-resize");
                
                corners.rb.setAttribute("cursor","w-resize");
                corners.lb.setAttribute("cursor","w-resize");
            }
                        
            addWindowEvents();
        }
        
        this.setAttribute('position','absolute');
        this.show(visible,resizeAble );            
    };

    /**
            * einstellen ob das Fenster vergrößerbar ist oder nicht
            * wenn das Fenster nicht vergrößerbar ist werden die Rahmen abgeschalten
            * übergibt man als 2. Parameter true werden die Rahmen wieder aktiviert
            *@access public
            *@param boolean resize
            *@param boolean showBorders (werden nur ausgeschalten sofern kein Resize)
            *@return void
            */
    function setResizeAble(resize,showBorders){
    
        if(!resize && showBorders)
            showBorder = true;
        else 
            showBorder = false;
                        
        resizeAble = resize;
    };

    function closeWindow(){
    
        if(!in_document) return;
    
        removeWindowEvents();
        
        // alle Komponenten entefernen wenn das fenster geschlossen wird
        // sonst kommt es zu einen Überlauf bei innerframe sind es 3 Komponenten Kopf , Body , Fuß
        // bei jeden mal wo das fenster angezeigt werden soll wird es neu hinzufügt so das beim 2. durchlauf 
        // bereits 6 Komponenten da sind
        // beim 3. Durchlauf schon 9 Kindkomponenten
        // ähnliches beim Kopf und frame selber
        head.removeComponents();
        
        inner_frame.removeComponents();
        
        frame.removeComponents();
        
        Element.unlink(frame.getComponent());
        in_document = false;
    };
    
    /**
            * Fenster Dekoration entfernen wie Buttons
            *@access public
            *@return void
            */ 
    function setUndecorated(){
        undecorated = true;
    };

    /**
    * frame fixieren , kann dann nicht mehr verschoben werden
    *@access public
    *@param boolean
    *@return false
    */
    function setFixed(fixed){
        frame_fixed = fixed;
    };

    /**
    *Fensterposition festlegen
    *@access public
    *@param int position von links
    *@param int position von oben
    *@return void
    */
    function setPosition(px,py){
        posx = px;
        posy = py;
        
        if(inDocument()) {
            Element.attrib(this.getComponent(),'style',{
                left:posx+"px",
                top:posy+"px"
            });
        }
    };
    
    function getHeadBar(){
        return head;
    };
    
    function getFootBar(){
        return foot;
    };

    function inDocument(){
        return in_document;
    };
    
    function isResizeAble(){
        return resizeAble;
    };
    
    this.getTitle = function (){
        return frame_title;
    };
    
    this.setTitle = setTitle;
    
    this.getContentPane = getContentPane;

    this.setVisible = setVisible;

    this.setUndecorated = setUndecorated;

    this.setResizeAble = setResizeAble;
    
    this.isResizeAble = isResizeAble;

    this.add = add;

    this.setLayout = setLayout;
    
    this.setPosition = setPosition;
    
    this.setFixed = setFixed;
    
    this.getHeadBar = getHeadBar;
    
    this.getFootBar = getFootBar;
    
    this.closeWindow = closeWindow;
    
    this.inDocument = inDocument;
};

/**
* wenn eine ID gegeben ist , dann nimmt er automatisch die ID als Grundfläche an
* ansonsten wird eine Grundfläche erstellt , und diese muss dann noch eingebunden werden
*@access public
*@param String id vom HTML Element
*/
function BitPanel(elementId){
    BitContainer.apply(this);
    
    var inDocument = false;
    var root  = (Element.exists(elementId))?Element.get(elementId):null;
    var _self = this;

    this.setVisible = function (visible){

        if(root && !inDocument) {

            var ad = this.getDimension().availDimension();

            if(!ad[0] || !ad[1]) {
            
                var root_dimension = Element.getCoords(root);

                var p = Element.getPadding(root);
                
                var width  = root_dimension.w-(p.left+p.right);
                var height = root_dimension.h-(p.top+p.bottom);

                this.setSize(width ,height);

            } else {
                var d = this.getSize();
            
                Element.attrib(root,'style',{
                    height:d[1]+"px",
                    width:d[0]+"px"
                });
                
            }

            Element.bind(this.getComponent(),root);
            inDocument = true;
        }

        _self.show(visible,true);
    };
    
    this.bindToElement = function (element) {
        root = (Element.exists(element))?Element.get(element):null;
        this.setVisible(true);
    };
    
    this.cloneComponent = function (){
        return new BitPanel();
    };
	
};

/**
* Class BitScrollPanel
* erstellt ein Panel mit welchen der Inhalt scrollbar ist
*@access public
*@param [String element  id wo es eingefügt werden soll]
*/
function BitScrollPanel(elementId){
    BitPanel.call(this,elementId);
    
    var scroll_panel = this;
    var self = this;
    
    var full_loaded      = false;
    var scrollbar_loaded = false;
    
    var vsb = null; // vertikaler scroll balken   FACTORY
    var hsb = null; // horizontaler scroll balken FACTORY
    
    var scroller_v = null; // scrollbalken Objekt der Klasse Scrollbar
    var scroller_h = null; // scrollbalken Objekt der Klasse Scrollbar
    
    var sSouth = null;
    
    var display_pane   = new BitPanel();
        display_pane.setLayout( null );
        display_pane.setAttribute("position","relative");
        
    var inner_document = new BitPanel();
    display_pane.add(inner_document);
    
    var update_on_scroll = null;
    
    // Construktor Funktion
    (function(){
        // bekommt ein BorderLayout zugewiesen
        self.setLayout( new BorderLayout(0,0) );
        
        // das innere Dokument ist ein BitPanel
        inner_document.setClassName('inner_docu');
        
        // anzeige Fläche muss eine relative Positionierung besitzen
        // display_pane.setAttribute("position","relative");
              
        if(!BitScrollPanel.SCROLLBAR)
            var sbf = new WindowScroller();
        else 
            var sbf = BitScrollPanel.SCROLLBAR;
        
        hsb = sbf.createHorizontalScrollbar();
        vsb = sbf.createVerticalScrollbar();
        
        switch(BitScrollPanel.SLIDER) {
            case 1:
                hsb.addSlider( new SlidingDoorSlider() );
                vsb.addSlider( new SlidingDoorSlider() );
                break;
            default:
                hsb.addSlider( new SlidingDoorSlider() );
                vsb.addSlider( new SlidingDoorSlider() );
        }
        
        var spacer = new BitLabel(); 
        spacer.setSize(vsb.getScrollbar().getDimension().getComponentDimension()[0],12);
        
        sSouth = new BitPanel();
        sSouth.setLayout( new BorderLayout() );
        sSouth.add(hsb.getScrollbar() , 'CENTER');
        sSouth.add(spacer, 'EAST');
        sSouth.setSize(0,0); // verstecken die horizontalen Scrollbalken werden nur 
        // dann angezeigt wenn es nötig ist
        
        self.add(display_pane       ,'CENTER');
        self.add(vsb.getScrollbar() ,'EAST'  );
        self.add(sSouth             ,'SOUTH' );
    })();
    
    function generateIds(obj){   
        for(var element in obj) {
        
            if(obj[element].constructor == Array) {
                for(var i = 0; i < obj[element].length;i++) {
                    obj[element][i].id = Element.generateId(10);
                    obj[element][i]    = obj[element][i].id; 
                }
            } else {
                obj[element].id = Element.generateId(10);
                obj[element]    = obj[element].id; 
            }
        }
    };
    
    /**
    * Scrollbalken werden erstellt
    * dazu bekommt jedes Scrollbalken Element eine ID 
    * sowie die Anzeige Fläche und das innere Dokument (eigentlicher Inhalt)
    *@access private
    *@return void
    */
    function createScrollbar(){
    
        if(!scrollbar_loaded) {
            var vertical   = vsb.getScrollbarComponents();
            var horizontal = hsb.getScrollbarComponents()
        
            generateIds(  vertical    );
            generateIds(  horizontal  );
                     
            display_pane.getComponent().id   = Element.generateId(10);
            inner_document.getComponent().id = Element.generateId(10);   

            var scrollbar_cfg = {
                displayWindow:display_pane.getComponent().id,
                innerDocument:inner_document.getComponent().id,
                lineHeight:20
            };
            
            var vertical_scrollbar_cfg   = Element.clone(scrollbar_cfg);
            var horizontal_scrollbar_cfg = Element.clone(scrollbar_cfg);
        
            Object.extend(vertical_scrollbar_cfg, {
                direction:'vertical'
            } );
            Object.extend(vertical_scrollbar_cfg, vertical );
            
            Object.extend(horizontal_scrollbar_cfg,{
                direction:'horizontal'
            });
            Object.extend(horizontal_scrollbar_cfg, horizontal );
            
            // Scrollbalken werden initialisiert 
            scroller_v = new Scrollbar(vertical_scrollbar_cfg);
            scroller_v.updateOnScrolled(update_on_scroll); 
            scroller_v.initScrollbar();    

            scroller_h = new Scrollbar(horizontal_scrollbar_cfg);
            scroller_h.updateOnScrolled(update_on_scroll); 
            scroller_h.initScrollbar();
            
            scrollbar_loaded = true;   
            checkScrollHorizontal(); 
        } else  
            checkScrollHorizontal(); 
    };
    
    /**
    * prüfen ob der horizontale Scrollbalken angezeigt werden soll
    * dafür wird dann die Scrollbalken Höhe auf 15px gesetzt wenn 
    * der Viewport kleiner sein sollte als der scrollbare Bereich
    */
    function checkScrollHorizontal(){
        
        try {
            var viewport_width = inner_document.contains()[0].getDimension().getSize()[0];
            
            if( viewport_width > inner_document.getDimension().getSize()[0] ) {  
                sSouth.setSize(1,12);                    
                scroll_panel.setVisible(true);
            } else {
                if(sSouth.getDimension().getSize()[1] > 0) {
                    sSouth.setSize(1,0);
                    scroll_panel.setVisible(true);
                }
            }         
        } catch (e) {
            sSouth.setSize(1,0);
        } finally {
            full_loaded = false;    
            
            scroller_v.reloadScrollbar(); 
            scroller_h.reloadScrollbar();  
        } 
    };

    /**
            * dieser Container wurde eben geladen 
            * aufgerufen in Container.loadComponents()
            *@access public
            *@return void
            */
    function loaded(){
        display_pane.getComponent().style.overflow = "hidden";
        
        var dp = display_pane.getDimension().availDimension();
        
        Element.attrib(inner_document.getComponent(),'style',{
            height:"",
            overflow:"",
            width:""
        });
        
        if(inner_document.contains().length > 0)
            var w  = inner_document.contains()[0].getDimension().getSize()[0];
        else 
            var w = 0;
        
        if(dp[0] < w) {
            Element.attrib(inner_document.getComponent(),'style',{
                width:w+"px"
            });
        }
        
        var msie_p = /(msie)\s(\d)\.(\d)/im;
        var browser = navigator.userAgent;
        var msie    =  msie_p.exec(browser);
        
        var p = inner_document.getAttribute("padding");
        
        if(!msie || msie[1] && msie[2] >= 7) {
            inner_document.getComponent().style.minHeight = dp[1] - (p.top + p.bottom) +"px";
        } else {
            inner_document.getComponent().style.height    = dp[1] - (p.top + p.bottom) +"px";
        }
        
        if(!full_loaded){
            full_loaded = true;
            createScrollbar();
        }
        
    };
    
    function setClassName(cssName) {
        display_pane.setClassName(cssName);
    };
    
    /**
     *überschreibt die methode setLayout
     *so das es nicht mehr möglich ist dem Container ein layout zu verpassen
     *@access public
     *@param Object LayoutManager
     *@return void
     */
    function setLayout(layout_manager){
        inner_document.setLayout(layout_manager);
    };
    
    /**
            * dem Panel eine Komponente hinzufügen
            *@access public
            *@param Object Panel [Layer]
            *@return void
            */
    function add(component){
        inner_document.add(component);
    };
    
    /**
            * die Methode um festzustellen wann sich der Scrollbalken bewegt hat
            * @param Function callback function
            * @return void
            */
    function updateOnScrolled(cb) {
        if(!scroller_v)
            update_on_scroll = cb;
        else 
            scroller_v.updateOnScrolled(cb);
    };
    
    function removeComponents(){
        inner_document.removeComponents();
    };
    
    /**
            * die Scrollbalken neu laden
            *@access public
            *@return void
            */
    function reloadScrollbar(){
        scroller_v.reloadScrollbar(); 
        scroller_h.reloadScrollbar();
    };

    function getContentPane(){
        return display_pane.contains()[0];
    };
    
    this.updateOnScrolled = updateOnScrolled;
    
    this.add = add;
    
    this.setLayout = setLayout;
    
    this.setClassName = setClassName;

    this.loaded = loaded;
    
    this.reload = reloadScrollbar;
    
    this.getContentPane = getContentPane;
    
    this.removeComponents = removeComponents;
};

BitScrollPanel.SCROLLBAR = null;
BitScrollPanel.SLIDER    = null;

/**
*@private Class SplitLayout
* speziell dafür angelegt das das Layoutfür das SplitPanel angepasst wird
*/
function SplitLayout( direction ){

    Layout.call(this);

    var split_layer_set = false;
    
    var sw = 8;
    
    // array key 0 für weite 1 für höhe
    var split_key = (direction === 1)?0:1;
    
    var splitset  = false;
    
    var split = document.createElement("div");
    
    var code = [0,0,0,0];
    
    var fixed_size = false;
    
    var move_range = [0, 0];
    
    var components = {
        left:new BitPanel(),
        right:new BitPanel()
    }
        
    /**
     * wandelt die binär zahl in einen Integer Wert um 
     * anhand dessen klar gemacht wird um welche Kombination 
     * es sich handelt
     * @access private
     * @return <int> value
     */
    function codeToInteger(){
        var value = 0;
        
        for(var i = code.length -1, j = 0 ; i >= 0; i--, j++)  {
            value += code[i] * Math.pow (2, j);
        }
                    
        return value;
    };

    function sizeBetween(size, min, max){
        if ( min > size ) 
            return -1;
        else if ( size > max ) 
            return 1;
        else 
            return 0;
    };
    
    /** 
     * berechnet Größen von den Containeren
     * bzw vom oberen Container
     *
     * Code Table 
     * 0  0  0  0 =  0 = keine min und max weiten 
     * 0  0  0  1 =  1 = links hat min
     * 0  0  1  0 =  2 = links hat max  
     * 0  0  1  1 =  3 = links hat max und min 
     * 0  1  0  0 =  4 = rechts hat min   
     * 0  1  0  1 =  5 = rechts hat min       , links hat min  
     * 0  1  1  0 =  6 = rechts hat min       , links hat max  
     * 0  1  1  1 =  7 = rechts hat min       , links hat min + max  
     * 1  0  0  0 =  8 = rechts hat max  
     * 1  0  0  1 =  9 = rechts hat max       , links hat min 
     * 1  0  1  0 = 10 = rechts hat max       , links hat max 
     * 1  0  1  1 = 11 = rechts hat max       , links hat min + max 
     * 1  1  0  0 = 12 = rechts hat max + min  
     * 1  1  0  1 = 13 = rechts hat max + min , links hat min
     * 1  1  1  0 = 14 = rechts hat max + min , links hat max 
     * 1  1  1  1 = 15 = rechts hat max + min , links hat min + max
     * 
     * über Minimierung der Gleichung nachdenken wenn dies denn geht
     */     
    function prepareSize( dimension ) {  
    
        var leftContainer = components.left;
        var rightContainer = components.right;      
        
        Element.attrib ( split , "style" , {
            cssFloat:"left",
            background:"#000",
            cursor:"col-resize"
        });
        
        var right_size = [];
        var left_size  = [];
        
        if( leftContainer.getMinSize()[ split_key] > 0)   code[3] = 1;
        if( leftContainer.getMaxSize()[ split_key] > 0 )  code[2] = 1;
        if( rightContainer.getMinSize()[ split_key] > 0)  code[1] = 1;
        if( rightContainer.getMaxSize()[ split_key] > 0 ) code[0] = 1; 
        
        var left_size_cur = components.left.getDimension().getComponentDimension();
        var left_size_min  = components.left.getDimension().getMinSize();
        var left_size_max  = components.left.getDimension().getMaxSize();
        
        var right_size_cur = components.right.getDimension().getComponentDimension();
        var right_size_min = components.right.getDimension().getMinSize();
        var right_size_max = components.right.getDimension().getMaxSize();
        
        if( split_key == 1) {
            
            Element.attrib ( split, "style" , {
                width:dimension[0]+"px",
                height:sw+"px",
                cursor:"row-resize"
            });
            
            left_size_cur.reverse();
            left_size_min.reverse();
            left_size_max.reverse();
            
            right_size_cur.reverse();
            right_size_min.reverse();
            right_size_max.reverse();
            
            dimension.reverse();
            
        } else {
            Element.attrib ( split, "style" , {
                width:sw+"px",
                height:dimension[1]+"px"
            });
        }
        
        switch ( codeToInteger(code) ) {
        
            case 0: // keine min oder max weiten
                
                if ( left_size_cur[0] >= 0) {
                    left_size  = [ left_size_cur[0] , dimension[1] ];
                    right_size = [ dimension[0] - sw - left_size_cur[0] , dimension[1] ];
                } else {
                    left_size  = [ Math.floor( dimension[0]/2 ) - 10 , dimension[1] ];
                    right_size = [ Math.ceil( dimension[0]/2 )      , dimension[1] ]; 
                }

                move_range = [0, dimension[0] - sw];
                break;
            case 1: // links min weite
                var width = 0;
                
                if ( left_size_min[0] > dimension[0] )
                    left_size_cur[0] = dimension[0] - sw;
                
                switch ( sizeBetween ( left_size_cur[0], left_size_min[0], dimension[0] ) ) {
                    case -1: width = left_size_min[0]; break;
                    case 1:  width = dimension[0] - sw; break;
                    default: 
                        width = left_size_cur[0];
                        
                        if ( width >= dimension[0] )
                            width = dimension[0] - sw;
                }
                
                left_size  = [ width                   , dimension[1] ];
                right_size = [ dimension[0] - width - sw, dimension[1] ];   
                
                move_range = [left_size_min[0], dimension[0] - sw];
            break;       
            case 2: // links hat ne max weite
                var width = 0;
                
                switch ( sizeBetween ( left_size_cur[0], 0, left_size_max[0] ) ) {
                    case 1:  width = left_size_max[0]; break;
                    default: 
                        width = left_size_cur[0]; 
                
                        if ( width >= dimension[0] )
                            width = dimension[0] - sw;
                }
                
                left_size  = [ width                   , dimension[1] ];
                right_size = [ dimension[0] - width - sw, dimension[1] ];
                
                move_range = [0, left_size_max[0] ];
            break;
            case 3: // links hat min und max weite
                var width = 0;
                
                if ( left_size_min[0] > dimension[0] )
                    left_size_cur[0] = dimension[0] -sw;
                
                switch ( sizeBetween ( left_size_cur[0], left_size_min[0], left_size_max[0] ) ) {
                    case -1: width = left_size_min[0]; break;
                    case 1:  width = left_size_max[0]; break;                            
                    default: 
                        width = left_size_cur[0]; 
                        
                        if ( width >= dimension[0] )
                            width = dimension[0] - sw;
                }
                
                left_size  = [ width                   , dimension[1] ];
                right_size = [ dimension[0] - width - sw, dimension[1] ];
                
                var start = left_size_min[0];
                var end   = left_size_max[0];
                
                if ( end > dimension[0] )
                    end = dimension[0] - sw ;
                
                move_range = [ start, end];
            break;
            case 4:  // rechts min weite
                var width = 0;
                                
                if ( right_size_min[0] > dimension[0] )
                    right_size_cur[0] = dimension[0] -sw;
                
                switch ( sizeBetween ( right_size_cur[0], right_size_min[0], dimension[0] ) ) {
                    case -1: width = right_size_min[0]; break;
                    case 1 : width = dimension[0] - sw;  break;
                    default: width = right_size_cur[0];
                }
                                
                left_size  = [ dimension[0] - width - sw, dimension[1] ];
                right_size = [ width                   , dimension[1] ];   
                
                move_range = [0, dimension[0] - right_size_min[0] - sw];
                
            break;
            case 5: // rechts sowie links haben min weite
            
                if ( left_size_min[0] > dimension[0] )
                    left_size_cur[0] = dimension[0] - sw;
            
                switch ( sizeBetween ( left_size_cur[0], left_size_min[0], dimension[0] - right_size_min[0] ) ) {
                    case -1: width = left_size_min[0]; break;
                    case 1:  
                        width = dimension[0] - right_size_min[0] - sw;
                        
                        if (width < left_size_min[0] )
                            width = left_size_min[0];
                    break;
                    default: 
                        width = left_size_cur[0];
                        
                        if ( width > dimension[0] )
                            width = dimension[0] - sw;
                            
                }
                
                left_size  = [ width                    , dimension[1] ];
                right_size = [ dimension[0] - width - sw , dimension[1] ];  
                
                if ( left_size_min[0] + right_size_min[0] > dimension[0] )
                    move_range = [left_size_min[0], left_size_min[0]];
                else
                    move_range = [left_size_min[0], dimension[0] - right_size_min[0] -sw];
            break;
            case 6: // rechts hat min weite , links hat max weite
                var width = 0;
                               
                switch ( sizeBetween ( left_size_cur[0], 0, left_size_max[0] ) ) {
                    case 1:  width = left_size_max[0]; break;
                    default: width = left_size_cur[0];
                }
             
                if ( dimension[0] - width  < right_size_min[0] )
                    width = dimension[0] - right_size_min[0];
                    
                left_size  = [ width                    , dimension[1] ];
                right_size = [ dimension[0] - sw - width , dimension[1] ];
                
                if ( right_size[0] > dimension[0] ) {
                    left_size  = [ 0               , dimension[1] ]; 
                    right_size = [ dimension[0] - sw, dimension[1] ];
                }   
                
                if ( left_size_max[0] + right_size_min[0] > dimension[0] )
                    move_range = [0, dimension[0] - right_size_min[0] -sw];
                else 
                    move_range = [0, left_size_max[0]];
                    
            break;
            case 7: // rechts hat min, links hat min und max   
                var width = 0;
                
                if ( left_size_min[0] > dimension[0] )
                    left_size_cur[0] = dimension[0] -sw;
                
                switch ( sizeBetween ( left_size_cur[0], left_size_min[0], left_size_max[0] ) ) {
                    case -1: width = left_size_min[0]; break;
                    case 1:  width = left_size_max[0]; break;                            
                    default: 
                        width = left_size_cur[0]; 
                        
                        if ( width >= dimension[0] )
                            width = dimension[0] - sw;
                }
                
                if ( dimension[0] - width  < right_size_min[0] ) {
                    width = dimension[0] - right_size_min[0];
                
                    if ( width < left_size_min[0] ) {
                        width = left_size_min[0];
                    }                    
                }
                
                left_size  = [ width                   , dimension[1] ];
                right_size = [ dimension[0] - width - sw, dimension[1] ];
            
                if ( left_size_max[0] + right_size_min[0] >= dimension[0] ) {
                    move_range = [left_size_min[0], dimension[0] - right_size_min[0] -sw];
                } else {
                    move_range = [left_size_min[0], left_size_max[0] ];
                }
                                
            break;
            case 8:  // rechts hat max       
                var width = 0;
                
                switch ( sizeBetween ( right_size_cur[0], 0, right_size_max[0] ) ) {
                    case 1:  width = right_size_max[0]; break;
                    default: 
                        width = right_size_cur[0]; 
                
                        if ( width >= dimension[0] )
                            width = dimension[0] - sw;
                }
                
                left_size  = [ dimension[0] - width - sw, dimension[1] ];
                right_size = [ width                   , dimension[1] ];
                
                move_range = [dimension[0] - right_size_max[0] -sw, dimension[0] -sw];
            break;
            case 9: // rechts hat max und links min    
                var width = 0;
                
                // zuerst rechte seite prüfen
                switch ( sizeBetween ( right_size_cur[0], 0, right_size_max[0] ) ) {
                    case 1:  
                        width = right_size_max[0]; 
                     break;
                    default: 
                        width = right_size_cur[0]; 
                }
                
                left_size  = [ dimension[0] - sw - width , dimension[1] ];
                right_size = [ width                    , dimension[1] ];
                                
                // linke seite prüfen
                switch ( sizeBetween ( left_size[0], left_size_min[0], dimension[0] ) ) {
                    case -1:
                        width = dimension[0] - left_size_min[0];
                        
                        if ( width <= sw )
                            width = sw;
                        
                        left_size  = [ left_size_min[0] , dimension[1] ]; 
                        right_size = [ width - sw        , dimension[1] ]; 
                        
                        if ( left_size[0] + sw > dimension[0] ) {
                            left_size[0]  = dimension[0] - sw;
                            right_size[0] = 0;
                        }
                        
                    break;
                    default:    
                        left_size  = [ dimension[0] - right_size[0] -sw , dimension[1] ]; 
                        right_size = [ right_size[0]                   , dimension[1] ]; 
                }
                
                if( left_size_min[0] + right_size_max[0] > dimension[0] ) {
                    move_range = [ left_size_min[0],  dimension[0] - sw];
                } else {
                    move_range = [dimension[0] - right_size_max[0] - sw , dimension[0] -sw];
                }
                
            break;
            case 10: 
                var width = 0;
                    
                // rechts max und links max 
                // bilden Schnittmenge
                if(  left_size_max[0] + right_size_max[0] >= dimension[0] ) {
                    
                    switch ( sizeBetween ( left_size_cur[0], dimension[0] - right_size_max[0], left_size_max[0] ) ) {
                        case -1: width = dimension[0] - right_size_max[0]; break;
                        case  1: width = left_size_max[0];                 break;
                        default: width = left_size_cur[0];
                    }
                    
                    move_range = [dimension[0] - right_size_max[0], left_size_max[0] - sw];
                } else { // links bekommt maximalen wert rechts hat eben Pech und wächst mit
                    
                    switch ( sizeBetween( left_size_cur[0], 0, left_size_max[0] ) ) {
                        case -1: width = 0;                break;
                        case  1: width = left_size_max[0]; break;
                        default: width = left_size_cur[0];
                    }
                    
                    move_range = [ 0, left_size_max[0] ];
                }     
                    
                left_size  = [ width                   , dimension[1] ];
                right_size = [ dimension[0] - width - sw, dimension[1] ];    
            break;
            case 11: // rechts max , links min + max 
            
                if( left_size_max[0] + right_size_max[0] >= dimension[0] ) {
                    // beide Ebenen überlagern sich, daher Schnittmenge berechnen und durch 2 teilen
                    var width =  Math.abs ( (dimension[0] - (left_size_max[0] + right_size_max[0]) ) / 2 );

                    left_size  = [ left_size_max[0]  - Math.floor( width ) - sw , dimension[1] ];
                    right_size = [ right_size_max[0] - Math.ceil( width)       , dimension[1] ];       
                    
                    if( left_size[0] < left_size_min[0] ) {
                        left_size  = [ left_size_min[0] , dimension[1] ];
                        right_size = [ dimension[0] - sw - left_size_min[0] , dimension[1] ];
                    }   
                    
                } else {  
                    left_size  = [ left_size_max[0] , dimension[1] ];
                    right_size = [ dimension[0] - sw - left_size_max[0] , dimension[1] ];
                }   
            break;
            case 12:  // rechts hat max + min
            
                if( right_size_min[0] > right_size_max[0] ) {
                    width = right_size_max[0];
                } else {
                    width = right_size_min[0];
                }
                
                // rechts hat ne weite
                if ( right_size_cur[0] ){
                
                    left_size  = [ dimension[0] - sw - right_size_cur[0], dimension[1] ];
                    right_size = [ right_size_cur[0]                   , dimension[1] ];
                    
                    if ( right_size[0] > dimension[0] ) {
                        
                        left_size  = [ 0               , dimension[0] ];
                        right_size = [ dimension[0] - sw, dimension[1] ];
                        
                    } else if ( right_size[0] < right_size_min[0] ) {
                        
                        left_size  = [ dimension[0] - sw - right_size_min[0] , dimension[0] ];
                        right_size = [ right_size_min[0]                    , dimension[1] ];
                    
                    }
                    
                } else { // keine Startweite vorgegeben also einfach die mindest weite setzen
                
                    left_size  = [ dimension[0] - sw - right_size_min[0] , dimension[0] ];
                    right_size = [ right_size_min[0]                    , dimension[1] ];
                
                }
            break;
            case 13:  // rechts hat max + min , links hat min
                
                if ( right_size_cur[0] ) {
                    left_size  = [ dimension[0] - right_size_cur[0] - sw , dimension[1] ];
                    right_size = [ right_size_cur[0]                    , dimension[1] ]; 
                } 
                
                // rechte seite hat min weite und ist nun zu klein 
                if ( right_size[0] < right_size_min[0] ) {
                    left_size  = [ dimension[0] - sw - right_size_min[0] , dimension[1] ];
                    right_size = [ right_size_min[0]                    , dimension[1] ];
                }
                
                // wenn die rechte maximal größe erreicht ist anpassen
                if ( right_size[0] > right_size_max[0] ) {
                    left_size  = [ dimension[0] - sw - right_size_max[0] , dimension[1] ];
                    right_size = [ right_size_max[0]                    , dimension[1] ];
                }
                
                // linke seite hat min weite und ist nun zu klein
                if ( left_size[0] < left_size_min[0] ) {
                    left_size  = [ left_size_min[0]                , dimension[1] ];
                    right_size = [ dimension[0] - sw - left_size[0] , dimension[1] ];
                }
            break;
            case 14:  // rechts hat max + min , links hat max
                
                /* ( 2 ) keine Schnittmenge bei den maximalen Weiten oder 
                 *       || maxL u. minR keine Schnittmenge
                 *       -> es zählt maxL 
                 * ( 1 ) Schnittmenge bei den maximalen Weiten  
                 *     ( 3 ) rechte weite gesetzt
                 *         ( 4 ) rechte Weite kleiner als minR || Dimension - maxL < minR 
                 *            -> minR 
                 *         ( sw ) 
                 *            -> leicht runter skalieren bis minR erreicht ist
                 *     ( 6 ) rechte weite nicht gesetzt
                 *        -> minR
                 * ( 7 ) prüfen ob RWidth < maximale Fläche 
                 *     -> wenn ja dann dimension - Split Weite gleich neue Weite
                 *  -> linken wert schreiben                 
                 */
                 
                // ( 2 ) 
                if( left_size_max[0] + right_size_max[0] < dimension[0] ||
                    left_size_max[0] + right_size_min[0] < dimension[0] )
                {
                    right_size = [ dimension[0] - left_size_max[0] - sw, dimension[1] ];
                } else { // ( 1 ) 
                    if ( right_size_cur[0] ) { // ( 3 )
                        if ( right_size_cur[0] < right_size_min[0] ||               // ( 4 )
                             dimension[0] - left_size_max[0] < right_size_min[0] ) 
                        { 
                            right_size = [ right_size_min[0] , dimension[1] ];
                        } else { // ( sw )
                            right_size = [ dimension[0] - left_size_max[0] , dimension[1] ];
                        }            
                        
                    } else { // ( 6 ) 
                        right_size = [ right_size_min[0], dimension[0] ];
                    }
                }
                
                if ( right_size[0] >= dimension[0] ) { // ( 7 )
                    right_size = [ dimension[0] - sw, dimension[1] ];
                }
                    
                left_size  = [ dimension[0] - sw - right_size[0], dimension[1] ];
            break;
            case 15:  // rechts hat max + min , links hat max + min   
                 
                if( left_size_max[0] + right_size_max[0] < dimension[0] ) {  // ( 1 ) 
                    right_size = [ dimension[0] - left_size_max[0], dimension[1] ];
                } else { // ( 2 )
                    if ( left_size_min[0] + right_size_min[0] > dimension[0] ) { // ( 3 )
                        right_size = [ dimension[0] - left_size_min[0], dimension[1] ];
                    } else { // ( 4 )
                        // zuerst rechte weite anpassen bis es sein min wert hat 
                        // das beruht darauf ist rechte weite nicht minimale rechte weite
                        // oder aber gesammt weite - linkes max ist kleiner rechtes minimum
                        if ( right_size_cur[0] < right_size_min[0] ||               
                             dimension[0] - left_size_max[0] < right_size_min[0] ) 
                        { 
                            right_size = [ right_size_min[0] , dimension[1] ];
                        } else { // ( sw )
                            right_size = [ dimension[0] - left_size_max[0] , dimension[1] ];
                        }

                        // das linke minimum darf aber nicht unterschritten werden
                        if ( left_size_min[0] > dimension[0] - right_size[0] - sw ) {
                            right_size = [ dimension[0] - left_size_min[0] ];
                        } 
                        
                    }
                }
                left_size = [ dimension[0] - right_size[0] - sw, dimension[1] ];
            break;
        }
        
        if( split_key == 1) {
            left_size.reverse();
            right_size.reverse();
        }
        
        components.left.setSize  (  left_size[0] , left_size[1] );
        components.right.setSize (  right_size[0], right_size[1] );
    };
    
    /**
    *Kind Komponenten anordnen und positionieren
    *sowie Eigenschaften zuweisen wie Weite und Höhe der Componenten
    *@access public
    *@param Object Container
    *@return void
    */
    this.prepareLayout = function(container){
        // die maximale Dimension die es erreichen kann
        prepareSize( container.getDimension().availDimension() );
    };

    /**
    * dem Container der das Layout besitzt ein Element hinzufügen 
    * wird aufgerufen in der Container.loadComponents
    *@access public
    *@param Object Container wo soll es rein
    *@param Object Component was soll rein
    *@return void
    */
    this.addComponent = function (container,component,position) {
        var before = null;
        
        Element.attrib ( component.getComponent(), "style", { cssFloat:"left" } );
        
        if( !splitset ) {
            container.getComponent().appendChild ( split );
            splitset = true;
        }
    
        if( position.toLowerCase() == "left") {
            if( components.left ) {
                container.removeComponent( component );
            }
            
            components.left  = component;
            
            before = split;
            
        } else {
            if( components.right )
                container.removeComponent( component );
        
            components.right = component;
        }
        
        if( before ) 
            container.getComponent().insertBefore( component.getComponent(), before );
        else 
            container.getComponent().appendChild( component.getComponent() ); 
    };
    
    this.getMoveRange = function () {
        return move_range;
    };
    
    this.getLayoutDimension = function(container) {
        return [300, 400];
    };
        
    this.getName = function(){
        return "SplitLayout";
    };
    
    this.getSplitLayer = function(){
        return split;
    };
    
    this.getLeftComponent = function(){
        return components.left;
    };
    
    this.getRightComponent = function(){
        return components.right;
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
function BitSplitPanel(split,elementId) {

    BitPanel.call(this,elementId);

    var split = (split && split.match(/horizontal/gi))?split.toLowerCase():"vertical";
    
    var self = this;
    
    var event_started = false;

    /**
    * in welche Richtung wurde gesplittet
    *  1 == vertikaler Balken also linke und rechte Seite
    * -1 == horizontaler Balken also oben und unten 
    */
    var split_direction = (split == "vertical")?1:-1;

    /**
    * weite oder höhe des Splitbalkens
    */
    var sw = 7;

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
    var split_coords     = [];
    var container_coords = null;
    var move_distance    = [];
    
    this.setLayout(new SplitLayout( split_direction) );
            
    /**
    * mousedown Event fired
    * resize starten , alte Position des Split Layers speichern
    * alte Position der Maus speichern
    *@access private
    *@param <SplitLayout> layout 
    *@return void
    */
    function start_resize(layout, e){        
        
        container_coords = Element.getCoords( self.getComponent() );
        
        var mouseCoords  = Element.getMouseCoords ( e );
        old_mouse_coords = [mouseCoords.mousex, mouseCoords.mousey];

        Element.addEvent( document, "mousemove", move_split_layer);
        Element.addEvent( document, "mouseup"  , stopResize );
        
        split_dragged = true;
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
        Element.stopEvent( e );
        
        if( !split_dragged ) return;
        
        var new_coords = Element.getMouseCoords( e );
        
        if ( split_direction === 1) { 
        
            split_coords[0] += new_coords.mousex - old_mouse_coords[0];        
        
            if ( split_coords[0] <= move_distance[0] )
                split_coords[0] = move_distance[0];
            else if ( split_coords[0] >= move_distance[1] ) 
                split_coords[0] = move_distance[1];
            
            Element.attrib ( split_layer_dummy, "style",{
                left:split_coords[0]+"px"
            });
        
        } else {
            
            split_coords[1] += new_coords.mousey - old_mouse_coords[1];        
        
            if ( split_coords[1] <= move_distance[0] )
                split_coords[1] = move_distance[0];
            else if ( split_coords[1] >= move_distance[1] ) 
                split_coords[1] = move_distance[1];
                        
            Element.attrib ( split_layer_dummy, "style",{
                top:split_coords[1]+"px"
            });
            
        }
        
        old_mouse_coords = [new_coords.mousex, new_coords.mousey];
    };

    /**
    * resize stoppen
    * neue Dimensionen für die Untercontainer werden bestimmt
    * und dann das Layout neu geschrieben
    *@access private
    *@param Event mouseup
    *@return void
    */
    function stopResize(evt){ 
        Element.unlinkEvent( document, "mousemove", move_split_layer );
        Element.unlinkEvent( document, "mouseup"  , stopResize);
        
        var layout = self.getLayoutManager();
        
        if( split_direction === 1)  {
            var lWidth = split_coords[0] - container_coords.posX;
            var rWidth = container_coords.w - lWidth;
        
            layout.getLeftComponent().setSize ( lWidth     , split_coords[1] );
            layout.getRightComponent().setSize( rWidth - sw, split_coords[1] );
        } else {
            var lHeight = split_coords[1] - container_coords.posY;
            var rHeight = container_coords.h - lHeight;
        
            layout.getLeftComponent().setSize ( split_coords[0], lHeight      );
            layout.getRightComponent().setSize( split_coords[0], rHeight - sw );
        }
        
        Element.unlink ( split_layer_dummy );
        
        self.setVisible( true );
        split_dragged = false;
    };
    
    function prepareSplitDummy( layout ){
    
        var dim = Element.getCoords( layout.getSplitLayer() );
    
        split_coords = [dim.posX, dim.posY];
                
        Element.attrib( split_layer_dummy, "style", {
            width:dim.w+"px",
            height:dim.h+"px",
            left:dim.posX+"px",
            top:dim.posY+"px",
            position:"absolute",
            zIndex:100000,
            background:"#000"
        });
        
        Element.bind ( split_layer_dummy, "body");
    };
    
    function prepareSplitMoving( layout ){
        var dim = Element.getCoords( self.getComponent() );
        
        if( split_direction === 1 ) {
            move_distance[0] = dim.posX + layout.getMoveRange()[0];
            move_distance[1] = dim.posX + layout.getMoveRange()[1];
        } else {
            move_distance[0] = dim.posY + layout.getMoveRange()[0];
            move_distance[1] = dim.posY + layout.getMoveRange()[1];
        }
    };
    
    this.leftComponent = function( component ){
        self.add ( component, "left" );
    }
    
    this.rightComponent = function( component ){
        self.add ( component, "right" );
    }
    
    this.loaded = function(){
        var layout = this.getLayoutManager();
        if ( !event_started ) {
            Element.addEvent(layout.getSplitLayer(), "mousedown", function(evt){
                var e = evt || window.event;
                Element.stopEvent( e );
                
                prepareSplitDummy( layout );
                prepareSplitMoving( layout );
                
                start_resize(layout, e); 
            });
            
            event_started = true;
        }
    };
};

/**
*Class BitTabbedPanel
*erstellt ein Panel mit einen BorderLayout
*Tableiste immer im Norden
*Content Bereich ist im Zentrum
*@access public
*@param [String element  id wo es eingefügt werden soll]
*/
function BitTabbedPanel(elementId){
    BitPanel.call(this,elementId);

    var tabbedPanel = this;

    var tabPane     = new BitPanel();
    var contentPane = new BitPanel();
    
    tabPane.setClassName('tab_pane');
    
    var isActive    = false;
    var last_active = null;

    this.setLayout(new BorderLayout(0,0));
    this.setClassName("tabbed_panel");
 
    this.add(tabPane,"NORTH");
    this.add(contentPane,"CENTER");
    contentPane.setClassName("tab_content_pane");
    
    tabPane.setSize(0,20);
    
    // Contentpane hat erstmal kein Layout mehr 
    // später nochmal überarbeiten aber funktioniert erstmal
    contentPane.setLayout(null);

    tabPane.setLayout(new FlowLayout(null,null,'left'));
    tabPane.getComponent().id = "tab_pane";
    
    var tabobserv = null;
    
    var tabActivated = [];
    
    /*
    * der aktive Tab auf dem geklickt wurde
    * ist der Schlüssel vom tabs Array
    * tabs[
    *     0 = array[
    *                0 = Component tab
    *                1 = Container die der tab enhält
    *              ]
    *     ...
    *     ]
    * 0 bedeutet tabs[0]
    */
    var active_tab = null;

    /*
    * hier werden alle Tabs hinterlegt
    * insklusive ihren Inhalt
    */
    var tabs = new Array();

    /**
    * innere Klasse Tab 
    * da jeder Tab eine Componente ist aber nur in BitTabbedPanel vorkommt
    * ein Tab ist eine Componente und erbt somit von der Klasse Component
    *
    *Class Tab
    *@access private
    *@return void
    */
    function Tab(tabName) {
        BitComponent.apply(this);

        this.setComponent( (function () {
            var tab_outer  = Element.create("span");
            var tab_inner  = Element.create("a",tabName);
            
            tab_outer.className = "tab_outer";
            tab_inner.className = "tab_inner";

            Element.bind(tab_inner,tab_outer);
            
            return tab_outer;
        })());
        
        this.getName = function (){
            return tabName;
        };        
    };

    function setTabSize(){    
        var dummy = document.createElement("span");
        dummy.style.display = "inline-block";
        
        Element.bind(this.getComponent(), dummy);
        Element.bind( dummy , "body" );
        
        var w = dummy.offsetWidth;
        var h = dummy.offsetHeight;
        
        this.setSize(w, h);
        
        Element.unlink( dummy );        
    };
    
    /** 
    * ein neues Tab hinzufügen
    * Struktur des tabs Array ist wie folgt
    * tabs = [  
    *                [ Component tab,container ],
    *                [ Component tab,container ]
    *            ]
    *@access public
    *@param String Tab Name
    *@param  Container
    *@return void
    */
    function addTab(tabName,container) {
        var tab = new Tab(tabName);
        
        setTabSize.call ( tab );
        
        tabPane.add(tab);

        tabs.push(new Array(tab,container));

        Element.addEvent(tab.getComponent(),"click",activateTab);
        
        if(isActive) {        
            tabPane.setSize(1,tab.getComponent().offsetHeight);
            this.setVisible(true);
        }
    };

    function initObservers(tab){
    
        if(tabobserv)
            tabobserv.call({
                tab:tabs[tab][0].getName(),
                panel:tabs[tab][1]
            });
    };
    
    /**
    * Es wurde auf einen tab geklickt
    * somit ist dies der aktive Tab
    *@access private
    *@param Event mouseclick
    *@return void
    */
    function activateTab(evt){
    
        var e = evt || window.event;
        Element.stopEvent(e);
        
        // den aktiven Tab finden nun
        var tab_div = e.srcElement || e.target;

        while(tab_div.nodeName.toLowerCase() != "span"){
            tab_div = tab_div.parentNode;
        } 
        
        for(var i = 0 ; i < tabs.length;i++) {
            if(tabs[i][0].getComponent() == tab_div) {
                active_tab = i; 
                break;
            }
        }
        
        if(tabobserv) 
            tabobserv.call({
                tab:tabs[active_tab][0].getName(),
                panel:tabs[active_tab][1]
            });
        
        displayTab(active_tab);
    };
    
    function displayTab(tab) {
    
        var tab_div = tabs[tab][0].getComponent();
        
        if(last_active) {
            last_active.className = last_active.className.match(/^(.*?)(?=_active)/i)[1];
        };
        
        tab_div.className = tab_div.className.replace(/^(.*)$/i,"$1_active");
        last_active = tab_div;
        
        var content_dim = contentPane.getDimension().availDimension();
        tabs[tab][1].setSize(content_dim[0],content_dim[1]);
        
        contentPane.removeComponents();
        contentPane.add(tabs[tab][1]);
        contentPane.setVisible(true);        
    };

    this.setLayout = function (){};

    this.loaded = function () {
        if(!isActive && tabs[0]) {          

            if(tabobserv) 
                tabobserv.call({
                    tab:tabs[0][0].getName(),
                    panel:tabs[0][1]
                });     
            
            displayTab(0);
        }
        isActive = true;
    };
    
    this.repaint = function () {
        this.setVisible(true);
    };
    
    this.addTab = addTab;
    
    this.tabObserver = function (func) {
        tabobserv = func;
    };
    
};

function BitGUI_XMLTemplate(sFile,oTemplateVars,fLoaded){

    var xml_document = null;
    var line = 1;
    var component_attribute = [];
    var object = null;
    var template_attribute_variables = oTemplateVars;
    var createdObjects = {}; 
    
    var base_attribute = ['css','name'];
    var htmlAttribute  = ['src' ,'class', 'style', 'id', 'title', 'name'];
    
    /* Container Attribute
     * es wird direkt nach diesen Attributen gesucht sollte der Wert ein Objekt 
     * sein dann gilt der Schlüssel im Objekt als Kinknoten Name
     * das Array zum Schlüssel sind dann die Attribute die zum Knoten gehören
     */
    var container_attribute = [
    {
        layout:['type','hgap','vgap','cols','rows'],
        style:[{
            size:['width','height'],
            padding:['value'],
            background:['color']
        }]
    }];
                    
                
    /* Frame Attribute sind alle Attribute von einen Container
     * zusätzliche Attribute hinzufügen  zu den Container Attributen 
     ===============================================================*/
    var frame_base_attribute = base_attribute.clone();
    var frame_attribute      = container_attribute.clone();
    
    // extra standard Attribute vorne einfügen
    frame_base_attribute.push('title','undecorated');
    // extra Kindknoten anhängen 
    frame_attribute.push({
        resize:['resize','border']
    },{
        position:['top','left','fixed']
    });
                                    
    /* Panel Attribute
     */
    var panel_base_attribute = base_attribute.clone();   
    panel_base_attribute.push('direction','contentfrom');
                
    /* XML Document laden
    */
    new Load.XMLDocument(sFile,function (xml_file){
        xml_document = xml_file;
        
        if(/msie/i.test(navigator.userAgent)) 
            object = parseXMLDocument(xml_document.childNodes[1]);
        else
        if (xml_document.childNodes[0].nodeName == "#text")
            object = parseXMLDocument(xml_document.childNodes[1]);
        else
            object = parseXMLDocument(xml_document.childNodes[0]);
                
        if(fLoaded) {
            fLoaded.call({
                instanz:object,
                objects:createdObjects
            });
        }
        
    },false);
               
    function getInstanceName(){
        var $1 = "Bit"+this.matches[1].toUpperCase()+this.matches[2];
        if(this.matches[3])
            $1 += this.matches[3].toUpperCase()+this.matches[4];
        return $1;
    };

    function parseXMLDocument(root_node){
    
        line++;
                
        var element = Element.trim(root_node.getAttribute('type').toLowerCase());

        var sub_panel   = /^(?:bit)?(?!bit)(\w)(.*)(?=panel)(p)(anel)$/i;
        var panel_frame = /^(?:bit)?(\w)(rame|anel)$/i;
        var component   = /^(?:bit)?(\w)(abel|utton)$/i;
                
        var instanz = null;
        var object  = null;
        
        var type = 0;           // 1 = container ( frame  | panel )
        // 2 = component ( button | label )
        var sub_type = 0;       // 1 frame 
        // 2 panel
                    
        /* Container
         */
        if(root_node.nodeName.toLowerCase() == "container") {
            type = 1;

            /* SplitPanels , TabbedPanels usw
            */
            if( sub_panel.test(element) ) {
            
                sub_type = 2;
                instanz = sub_panel.replaceCallback(element,getInstanceName);

            /* Frame, Panel
            */
            } else {
            
                if(panel_frame.exec(element)[2] == "rame") sub_type = 1;
                else                                       sub_type = 2;
                
                if (panel_frame.test(element))
                    instanz = panel_frame.replaceCallback(element,getInstanceName);
            }
                        
        /* Componente
        */
        } else {
            type = 2;

            if (component.test(element)) {
                instanz = component.replaceCallback(element,getInstanceName);
            }
            
        }

        if(instanz) {
        
            try {
                eval("object = new "+instanz+"()");
            } catch (e) {
                var message = "Objekt "+instanz+" konnte nicht instanziert werden\n"+
                "XML Datei: "+sFile+"\nZeile: "+line+"\n";
                Error.log.push(message);
            }
                        
            var configArray = null;
                                                
            with(root_node) {
                /* bestimmen welches Configurations Array genommen wird
                */
                if (type == 1 && sub_type == 1)   configArray = frame_attribute;
                else                              configArray = container_attribute;
                
                if(type == 1 ) {
                    if(sub_type == 1)
                        setAttributeValues(object,getBaseAttribute(frame_base_attribute,root_node));
                    else 
                        setAttributeValues(object,getBaseAttribute(panel_base_attribute,root_node));
                }
                
                // Kindknoten durchlaufen
                var c_length = childNodes.length;
                for(var i = 0; i < c_length;i++) {
                
                    if(childNodes[i].nodeName == "#text") continue;
                       
                    switch(childNodes[i].nodeName.toLowerCase()) {
                        case 'attribute':     
                            setAttributeValues(object,getAttributeValues(root_node,childNodes[i],configArray));
                            if(template_attribute_variables)
                                setTemplateAttributeVariables(root_node,object);
                            break;
                        case 'contains':
                            loadChildComponents(childNodes[i], object);
                            break;
                        case 'content':
                            loadContentChilds (childNodes[i], object );
                            // object.setContent ( xmlToHtml(childNodes[i], document.createDocumentFragment() ) );
                            break;
                    }
                }
            }
        }
                    
        if(type == 1 && sub_type == 1)                    
            object.setVisible(true);
            
        return object;
    };
    
    function loadContentChilds( node, object){
        
        var len = node.childNodes.length;
        
        var fragment = document.createDocumentFragment();
        
        var _style = {};
        
        for(var i = 0; i < len; i++) {
            
            if ( node.childNodes[i].nodeName == "#text") 
                continue;            
            
            var child = node.childNodes[i];

            for ( var j = 0; j < child.childNodes.length; j++) {
            
                if ( child.childNodes[j].nodeName == "style" ) {
                    var styleChild = child.childNodes[j];
                
                    for ( var k = 0; k < styleChild.childNodes.length; k++) {
                    
                        with ( styleChild.childNodes[k] ) {
                        
                            if ( nodeName == "#text" ) 
                                continue;
                        
                            switch ( nodeName ) {
                                case 'size':
                                    _style[ 'width' ]  = getAttribute("width");
                                    _style[ 'height' ] = getAttribute("height");
                                break;
                                default:
                                    _style[ nodeName ] = getAttribute("value");
                            }
                        
                        }
                        
                    }
                }
            }
            
            var cnode = null;
            
            switch ( child.getAttribute("type" ) ) {
                case 'image':
                    cnode     = document.createElement("img");
                    cnode.src = child.getAttribute('src');
                break;
            }
            
            for( var key in _style ) {
                cnode.style[key] = _style[key];
            }
            
            // styles laden
            if ( cnode )
                fragment.appendChild( cnode );
        }
        
        object.setContent( fragment );
    };
    
    /**
     * wandelt einen XML Knoten in HTML Knoten um
     *@access private 
     *@param <xml node> node
     *@return <html> content
     */
    function xmlToHtml ( node, htmlNode ) {
        
        var parent = htmlNode || document.createElement("div");

        for(var i = 0; i < node.childNodes.length; i++) {
        
            var child = node.childNodes[i];
            var cNode = null;
            
            if( child.nodeName == "#text" ) {            
                var text = child.nodeValue.replace(/^\s*(.*)/,"$1");                
                    text = text.replace(/^(.*)\s*$/,"$1");
                if ( text.length == 0) 
                    continue; 
                    
                cNode = document.createTextNode( text ); 
            } else {
                cNode = document.createElement( child.nodeName );
                
                // attribute holen 
                for(var j = 0 ; j < htmlAttribute.length; j++) {
                    if ( child.getAttribute( htmlAttribute[j] ) ) {
                        cNode.setAttribute( htmlAttribute[j], child.getAttribute( htmlAttribute[j] ) ) 
                    }
                }
                
                xmlToHtml(child, cNode);
            }      
            parent.appendChild ( cNode );
        }
        
        return parent;
    }
    
    function getAttributeValues(currentNode,attribute_node,attribute_array) {
        var oAttribute = {};
        
        // Basis Attribute für Container durchlaufen
        with(attribute_array) {
        
            for(var i = 0 ; i < length;i++) {
            
                if(typeof attribute_array[i] == "string") {
                
                    var name = currentNode.getAttribute(attribute_array[i]);
                                          
                    if(name || attribute_array[i]=="title") 
                        oAttribute[attribute_array[i]] = name;
                        
                } else {
                    for(key in attribute_array[i]) {
                        var node = Element.getElements(attribute_node,key);
                        
                        if(node[0])                                     
                            oAttribute[key] = getAttributeValues(node[0],attribute_node,attribute_array[i][key]);
                    }
                }
            }
        }
        
        return oAttribute;
    };

    function getBaseAttribute(aBaseAttribute,nXMLNode) {
        var o = new Object();
        
        var a_length = aBaseAttribute.length;
        
        for(var i = 0 ; i < a_length ;i++) {
            var nodeValue = nXMLNode.getAttribute(aBaseAttribute[i]);
            
            if(nodeValue)
                o[aBaseAttribute[i]] = nodeValue;
        }
        
        return o;
    };
                  
    function setAttributeValues(instanz,attribute){
    
        for(key in attribute) {
        
            switch(key) {
                // basis attribute
                case 'css'           :
                    instanz.setClassName(attribute[key]);
                    break;
                case 'undecorated'   :
                    instanz.setUndecorated();
                    break;
                case 'title'         :
                    instanz.setTitle(attribute[key]);
                    break;
                case 'name'          :
                    saveObject(attribute[key],instanz);
                    break;
                
                // attribut knoten
                case 'layout'        :
                    prepareLayout(instanz,attribute[key]);
                    break;
                case 'position'      :
                    preparePosition(instanz,attribute[key]);
                    break;
                case 'style':
                    prepareStyleValues(instanz, attribute[key]);
                    break;
                case 'resize'        :
                    prepareResize(instanz,attribute[key]);
                    break;
                case 'contentfrom'   :
                    prepareContentFrom(instanz,attribute[key]);
                    break;
            }
        }

    };
    
    function saveObject(sName,oValue){
        createdObjects[sName] = oValue;
    };
    
    function setTemplateAttributeVariables(dNode,oInstanz){        
        if(template_attribute_variables) {
            var component = oInstanz.getComponent();
            
            for(key in template_attribute_variables) {
            
                try {
                    if(typeof dNode.getAttribute(key) == "string" && dNode.getAttribute(key) == "") {    
                        var attribute = template_attribute_variables[key];
                        
                        if(template_attribute_variables[key].constructor == Array && template_attribute_variables[key].length > 0) {
                            attribute = template_attribute_variables[key].shift();
                        }
                        
                        oInstanz.getComponent().setAttribute(key,attribute);
                    }
                } catch (e) {
                    alert("error 1: "+e.message);
                }
            }
        }
    };
    
    function loadChildComponents(contains_node,instanz){                            
    
        var n = contains_node;
    
        // prüfen ob einer der Kindknoten eine XML Datei sein soll wenn ja 
        // werden die anderen Kinder ignoriert 
        
        var nodes_length = n.childNodes.length;
                
        for(var i = 0 ; i < nodes_length;i++) {
            
            if(n.childNodes[i].nodeName == "#text") continue;
            // <xmlfile src="" />
            var element = null;
            if(n.childNodes[i].nodeName == "xmlfile") {
                
                var src  = n.childNodes[i].getAttribute('src');
                var node = n.childNodes[i];
                
                new BitGUI_XMLTemplate(src,template_attribute_variables,function(){
                    element = this.instanz;
                    instanz.add(element,node.getAttribute('direction'));                    
                });
                
            } else {
            
                element = parseXMLDocument(n.childNodes[i]);
                instanz.add(element,n.childNodes[i].getAttribute('direction'));
                
            }
            
        }
        
    };
                    
    function prepareStyleValues(instanz, oAttribute){
        for(var key in oAttribute) {
            switch ( key ) {
                case 'size':
                    instanz.setSize(
                        parseInt( oAttribute[key]['width'] , 10),
                        parseInt( oAttribute[key]['height'], 10)
                    );
                break;
                case 'padding':
                    instanz.setAttribute("padding", oAttribute[key]['value'] );
                break;
                case 'background':
                    instanz.setBackground( oAttribute[key]['color'] );
                break;
            }
        }
        
    };
                
    function prepareLayout(instanz,oAttribute){
        
        with(oAttribute) {
            var pattern = new RegExp("(\\w)(.*)(?=layout)","i");
            var layout_name = pattern.replaceCallback(type,function (){
                return this.matches[1].toUpperCase()+this.matches[2].toLowerCase()+"Layout";
            });
                       
            var params = "";
            
            
            if(layout_name == "GridLayout") {
                params = cols+","+rows;
            }
                        
            if(oAttribute.hgap) params += ((params)?",":"")+hgap;
            if(oAttribute.vgap) params += ","+vgap;
                        
            eval ("instanz.setLayout(new "+layout_name+"("+params+"));");
            }
    };
                
    function preparePosition(instanz,oAttribute){
        with(oAttribute) {
            var posy = (top)?parseInt(top):0;
            var posx = (left)?parseInt(left):0;
            
            instanz.setPosition(posx,posy);
            
            if(oAttribute['fixed'] && oAttribute['fixed'] == "true") instanz.setFixed(true);
            }
    };
                
    function prepareResize(oInstanz,oAttribute){   
        with(oAttribute) {
            if(!resize || resize != "false") return;
            oInstanz.setResizeAble(false,((border=="true")?true:false));
            }
    };
                    
    function prepareContentFrom(oInstanz,oAttribute) {
        oInstanz.getContentFrom(oAttribute);
    }
    
    function getInstantiatedObject() {
        return object;
    };
        
    this.getInstantiatedObject = getInstantiatedObject;
};

/**
* statische Klasse WindowManager
* verwaltet den Fenster zIndex und Gruppen
* sobald ein Frame erstellt wird wird es automatisch dem Fenster Manager hinzugefügt
* wenn ein Frame1 in ein Frame2 gebracht wird gilt das Frame2 als Gruppe 
*@access public
*@return Object 
*/
var WindowManager = (
    function () {
        var root = new Array();

        var window_groups  = {};

        var windows = {};

        var windows_available = 0;
        
        var groups_available  = 0;
                
        var sub_groups = {};
                
        var index = 0;
        
        var last_top_window = null;
        
        function setWindowToTop(window_id){

            if(last_top_window && last_top_window == window_id) 
                return;
        
            var parent_group = windows[window_id].parent_group;            
            var cur_window= window_id;
                    
            if(parent_group != 'root') {    
            
                while(parent_group != 'root') {
                    // Knoten vertauschen
                    window_groups[parent_group].childs = window_groups[parent_group].childs.deleteValue(cur_window);
                    window_groups[parent_group].childs.push(cur_window);
                                
                    cur_window = parent_group;
                    parent_group = windows[cur_window].parent_group;
                }
                
            }
            
            root = root.deleteValue(cur_window);
            root.push(cur_window);
            
            setStartIndex(window_id);

            // Klassen Namen ersetzen 
            if(last_top_window) {
                var last_window = windows[last_top_window].window_component;
                last_window.className = last_window.className.replace(/[\s]*active/gi,'');
            }
            
            var new_window  = windows[window_id].window_component;
            new_window.className  += ' active';
            
            last_top_window = window_id;
        };

        function setStartIndex(window_id){
        
            index = 0;
                               
            for(var i = 0;i < root.length;i++) {
                index++;
                
                windows[root[i]].window_component.style.zIndex = index;

                if(window_groups[root[i]]) setIndex(root[i]);
            }
                        
            function setIndex(node){
            
                for(var j = 0 ; j < window_groups[node].childs.length ; j++){
                    index++;
                    var sub_node = window_groups[node].childs[j];
                                
                    windows[sub_node].window_component.style.zIndex = index;
                    
                    if(window_groups[sub_node]) setIndex(sub_node);
                }
            }
            
        };

        return {
            /**
             * ein einfaches Fensterhinzufügen
             * Fenster Events mousedown um es zu switchen werden automatisch
             * an das Fenster gebunden 
             *@access public
             *@param Object BitFrame
             *@return void
             */
            addWindow:function(window_object){
            
                var id = window_object.getUID();
                var component = window_object.getComponent();

                windows[id] = {
                    parent_group:"root",
                    window_object:window_object,
                    window_component:component,
                    index_level:windows_available
                };
                root.push(id);                            
                
                Element.addEvent(component,"mousedown",function (evt) {
                    var e = evt || window_event;
                    
                    if(e.stopPropagation)
                        e.stopPropagation();
                    else 
                        e.cancelBubble = true;
                    
                    setWindowToTop(id);
                });
                
                setWindowToTop(id);
                last_active_window = id;
            },
            /**
                                  *ein Fenster einer Fenstergruppe hinzufügen
                                  *Fenster Events mousedown um es zu switchen werden automatisch
                                 *an das Fenster gebunden 
                                 *@access public
                                 *@param String id fenster id
                                 *@param String id gruppen id
                                 *@return void
                               */
            addWindowToGroup:function(w_id,group) {
                var window_id = w_id;
                // Fenster ist noch keine Gruppe
                if(!window_groups[group]) {
                    window_groups[group] = {
                        start_index:null,
                        childs:[]
                    };
                }
                            
                // Fenster ist nicht mehr von der Grundfläche abhängig
                // somit wird es dort entfernt und in die Fenstergruppe
                // hinzugefügt
                root = root.deleteValue(window_id);
                window_groups[group].childs.push(window_id);
                windows[window_id].parent_group = group;
                setStartIndex(window_id,group);
            },
            /**
                                 *ein Fenster schließen
                                *@access public
                                *@param String id fenster id
                                *@return void
                                */
            closeWindow:function(window_id){
                if(!windows[window_id].window_object.inDocument())
                    return;
                    
                if(window_groups[window_id]) {
                    with(window_groups[window_id]) {                    
                        for(var i = 0 ; i < childs.length;i++) {
                            this.closeWindow(childs[i]);
                        }
                        }
                }
                
                windows[window_id].window_object.closeWindow();
            },
            addToSubGroup:function(name,frame){
                if(!sub_groups[name]) {
                    sub_groups[name] = [];
                }
            	
                if(!sub_groups[name].inArray(frame.getUID()))
                    sub_groups[name].push(frame.getUID());
            },
            removeFromSubGroup:function(name,frame) {
                if(sub_groups[name]) 
                    sub_groups[name] = sub_groups[name].deleteValue(frame.getUID());
            },
            closeSubGroup:function(name) {
                if(sub_groups[name]) {
                    for(var i = 0 ; i < sub_groups[name].length;i++){
                        this.closeWindow(sub_groups[name][i]);
                    }
                    
                    sub_groups = removeElementFromObject(name,sub_groups);
                    
                }
            },
            centerWindow:function(frame){
                if(!frame) return;
                
                var w = window.innerWidth;
                var h = window.innerHeight;
                
                if(!w && !h) {
                    w = document.body.clientWidth;
                    h = document.body.clientHeight;
                }
                
                var dim = frame.getDimension().getSize();
                
                var posx = w/2-dim[0]/2;
                var posy = h/2-dim[1]/2;
                
                frame.setPosition(posx,posy);
            }
        };
    }
    )();

/**
* Class ConfirmWindow
*
* Ein einfaches Confirm Fenster
* ConfirmWindow.show(message).confirm(function true , function false);
*/
var ConfirmWindow = (function(){

    var confirmWin    = null;
    var confirm_true  = null;
    var confirm_false = null;
    var confirm_msg   = "Achtung Hinweis";
    
    var msg_panel     = null;
    
    function createConfirmWindow(){
    
        confirmWin = new BitFrame("Achtung !");
        
        confirmWin.setResizeAble(false,true);
        confirmWin.setBackground("#fff");
        confirmWin.setLayout(new BorderLayout(1,0));
        
        // Button Panel für Ja / Nein im Süden des BorderLayouts
        var confirm_panel = new BitPanel();
        confirm_panel.setClassName("confirm_panel");
        confirm_panel.setLayout(new FlowLayout(6,2));
        
        var yes = new BitButton("ja");
        var no  = new BitButton("nein");
        
        var message = new BitLabel(confirm_msg);
        
        yes.setSize(60,20);
        no.setSize(60,20);
        
        yes.setBackground('#acacac');
        no.setBackground('#acacac');
        
        yes.addAction('click',confirmTrue);
        no.addAction('click',confirmFalse);
        
        confirm_panel.add(yes,'left');
        confirm_panel.add(no,'left');
        
        msg_panel = new BitPanel();
        msg_panel.setClassName("confirm_body");
        msg_panel.add(message);
        
        confirmWin.add(msg_panel,'CENTER');
        confirmWin.add(confirm_panel,'SOUTH');
    };
    
    function confirmTrue(){
        if(confirm_true) 
            confirm_true();
        
        confirmWin.closeWindow();
    };
    
    function confirmFalse(){
        if(confirm_false) 
            confirm_false();
            
        confirmWin.closeWindow();
    };
    
    return {
        confirm:function(t,f) {
            confirm_true = t;
            confirm_false = f;
            
            return this;
        },
        show:function(msg){  
            if(msg && msg.length > 0)
                confirm_msg = msg;
        
            if(!confirmWin) {
                createConfirmWindow();   

            } else {
            
                msg_panel.removeComponents();
                msg_panel.add(new BitLabel(confirm_msg));
                
            }
            
            if(!confirmWin.inDocument()) {
                
                confirmWin.setVisible(true);
                WindowManager.centerWindow(confirmWin);

            } else
                msg_panel.setVisible(true);
                    
            return this;
        },
        getConfirmWindow:function(){
            if(!confirmWin)
                createConfirmWindow();
                
            return confirmWin;
        }
    }
})();

(function (){
    if(window)
        window.Error = new Error();

    function Error(){
        var error_log = [];

        this.log = {
            push:function (value){
                error_log.push(value);
            },
            toString:function (){
                var sError = "";

                for(var i = 0 ; i < error_log.length;i++) {
                    sError += error_log[i]+"\n";
                }

                return sError;
            }
        }
    }
})();

var winpos = [0,0];

function positionWindow(link,x,y){
    var position = Element.getCoords(link);
    var px = position.posX+x;
    var py = position.posY+y;

    winpos = [px,py];
};
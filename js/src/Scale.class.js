/**
* Klasse um ein  Fläche zu skalieren 
*/
function Scale(panel){

    var root_panel   = panel;
    
    var root_block   = null;
    var inner_block  = null;
    
    var scale_panel  = null;
    var scale_center = new BitPanel();
    
    var scale_direction = { left:true,right:true,top:true, bottom:true };
    var scale_border    = { top:null,left:null,right:null,bottom:null };
    var scale_to        = { top:null,right:null,left:null,bottom:null };
    var scale_blocks    = { top:[],left:[],bottom:[],right:[] };
    
    var old_mouse = 0;
    
    var scale_element = null;
    
    var dragged = false;
    
    var scale_panel_size;
    
    var self = this;
        
    var scaled_by = {
        left:0,
        right:0,
        top:0,
        bottom:0
    };
    
    /**
            * hier wird gespeichert welche Blöcke bereits in 1 Durchgang modifiziert wurden
            * da es halbe Blöcke gibt und 2 halbe Blöcke verweisen auf den selben Elternblock
            * nach jedem moveResizePanel Durchgang wird das Array wieder geleert
            */
    var blocks_modified = [];
    
    /**
            * der Modifikator besagt das wenn ein Element nach oben oder links skaliert werden soll
            * sich die Änderungsgröße umdreht
            * wenn nach links skaliert werden soll und  mit der Maus nach Links gefahren wird
            * muss das Element größer werden andernfalls kleiner
            * für rechts und unten modifikator 1 
            * für links und oben modifikator    -1
            */
    var modifikator = 1;
    
    /**
            * direction sagt nur aus welche Dimension vom Panel genommen werden soll
            * panel.getSize()[0]  === weite
            * panel.getSize()[1]  === höhe
            */
    var direction   = 0;
    
    /**
            * enthält die Richtung in der die Größe verändert wurden
            */
    var scale_element = null;
    
    var attrib      = "width";
    
    function createScaleBorder(w,h){
    
        for(var key in scale_direction) {
        
            scale_border[key] = new BitPanel();
            
            if(scale_direction[key]) {
            
                scale_border[key].setLayout(new BorderLayout());
                
                if(key.match(/(left|right)/i)) {
                
                    var north = new BitPanel();
                    var south = new BitPanel();
                    
                    north.setSize(11,(h-22)/2-5.5);
                    south.setSize(11,(h-22)/2-5.5);
                    
                    north.setBackground('url(img/scale_line_verti.gif) repeat-y center 0');
                    south.setBackground('url(img/scale_line_verti.gif) repeat-y center 0');
                    
                    scale_border[key].add(north,'north');
                    scale_border[key].add(south,'south');
                    
                    north.getComponent().setAttribute('scale','half');
                    south.getComponent().setAttribute('scale','half');
                    
                    if(scale_direction.top)
                        scale_blocks.top.push(north,south);
                        
                    if(scale_direction.bottom) {
                        scale_blocks.bottom.push(north,south);  
                    }
                    
                } else {
                
                    var east = new BitPanel();
                    var west = new BitPanel();
                    
                    east.setLayout(new BorderLayout());
                    west.setLayout(new BorderLayout());
                    
                    east.setSize(w/2-5.5,11);
                    west.setSize(w/2-5.5,11);
                    
                    var east_corner = new BitPanel();
                    var west_corner = new BitPanel();
                    
                    east_corner.setSize(11,11);
                    west_corner.setSize(11,11);
                    
                    var east_center = new BitPanel();
                    var west_center = new BitPanel();
                    
                    east_center.setBackground('url(img/scale_line_hori.gif) repeat-x 0 center');
                    west_center.setBackground('url(img/scale_line_hori.gif) repeat-x 0 center');
                    
                    east_center.getComponent().setAttribute('scale','half');
                    west_center.getComponent().setAttribute('scale','half');
                    
                    east.getComponent().setAttribute('scale','half');
                    west.getComponent().setAttribute('scale','half');
                    
                    if(key == "top") {
                        east_corner.setBackground('url(img/scale_right_upper_corner.gif) repeat-x 0 center');
                        west_corner.setBackground('url(img/scale_left_upper_corner.gif) repeat-x 0 center');
                    } else {
                        east_corner.setBackground('url(img/scale_right_bottom_corner.gif) repeat-x 0 center');
                        west_corner.setBackground('url(img/scale_left_bottom_corner.gif) repeat-x 0 center');
                    }
                    
                    east.add(east_corner,'east');
                    east.add(east_center,'center');
                    
                    west.add(west_corner,'west');
                    west.add(west_center,'center');
                    
                    scale_border[key].add(east,'east');
                    scale_border[key].add(west,'west');
                    
                    if(scale_direction.left)
                        scale_blocks['left'].push(east_center,west_center);
                        
                    if(scale_direction.right)
                        scale_blocks['right'].push(east_center,west_center);
                }
                
                var center = new BitPanel();
                center.setClassName('center');
                center.setSize(11,11);
                center.setBackground('url(img/scale_block.gif) no-repeat');
                center.getComponent().setAttribute('scale',key);
                
                scale_to[key] = [center]; 
                scale_border[key].add(center,'center');
                
            } else {
            
                switch(key) {
                
                    case 'left': case 'right':
                        
                        scale_border[key].setBackground('url(img/scale_line_verti.gif) repeat-y center 0');
                        scale_border[key].setSize(11,h);
                        
                        if(scale_direction.bottom)
                            scale_blocks.bottom.push(scale_border[key]);
                            
                        if(scale_direction.top)
                            scale_blocks.top.push(scale_border[key]);
                        
                        break;
                    case 'top': case 'bottom':
                        scale_border[key].setLayout(new BorderLayout());
                    
                        var east_corner = new BitPanel();
                        var west_corner = new BitPanel();
                        var hori_center = new BitPanel();
                        
                        east_corner.setSize(11,11);
                        west_corner.setSize(11,11);
                        
                        hori_center.setBackground('url(img/scale_line_hori.gif) repeat-x 0 center');
                        
                        if(key == "top") {
                            east_corner.setBackground('url(img/scale_right_upper_corner.gif) repeat-x 0 center');
                            west_corner.setBackground('url(img/scale_left_upper_corner.gif) repeat-x 0 center');
                        } else {
                            east_corner.setBackground('url(img/scale_right_bottom_corner.gif) repeat-x 0 center');
                            west_corner.setBackground('url(img/scale_left_bottom_corner.gif) repeat-x 0 center');
                        }
                        
                        scale_border[key].add(east_corner,'east');
                        scale_border[key].add(west_corner,'west');
                        scale_border[key].add(hori_center,'center');
                                       
                        scale_border[key].setSize(w,11);
                        
                        if(scale_direction.left ) {
                            scale_blocks.left.push(hori_center);
                        }
                            
                        if(scale_direction.right )
                            scale_blocks.right.push(hori_center);
                        
                        break;
                }
            }
        }
        
        scale_panel.add(scale_border.top,'north');
        scale_panel.add(scale_border.left,'west');
        scale_panel.add(scale_border.right,'east');
        scale_panel.add(scale_border.bottom,'south');
        scale_panel.add(scale_center,'center');

        var sb = scale_blocks.left;
    };
    
    function blockScale(direction) {
        scale_direction[direction] = false;
    };
    
    function prepareResize(){
        for(var key in scale_to) {
            if(scale_to[key]) {
                var c = scale_to[key][0].getComponent();
                
                Element.attrib(c,'style',{cursor:'move'});
                Element.addEvent(c,'mousedown',startResize);
            }
        }
    };
    
    function startResize(e){
    
        var e = e || window.event;
        Element.stopEvent(e);
        var mouse_coords = Element.getMouseCoords(e);
        
        scale_element = e.target || e.srcElement;
        scale_element = scale_element.getAttribute('scale');
        
        if(scale_element.match(/(left|right)/i)) {
        
            direction = 0;
            attrib = "width";   
            
            if(scale_element == 'left')
                modifikator = -1;
                
        } else {
        
            direction = 1;
            attrib = "height";
            
            if(scale_element == 'top')
                modifikator = -1;
        }
            
        old_mouse = [mouse_coords.mousex,mouse_coords.mousey];
        
        Element.addEvent(document,'mouseup',stopResize);
        Element.addEvent(document,'mousemove',moveResizePanel);
        
        if(callOnStart) callOnStart();
        
        dragged = true;
    };
        
    function moveResizePanel(e){        
    
        var e = e || window.event;
        Element.stopEvent(e);
        var mouse_coords = Element.getMouseCoords(e);
        
        var new_mouse = [mouse_coords.mousex,mouse_coords.mousey];
        
        // neue Koordinaten - alte Koordinaten ist der wert um den modifiziert wird
        var modified_by = (new_mouse[direction]-old_mouse[direction])*modifikator;
        
        scaled_by[scale_element] += modified_by;
        
        // alle Blöcke für das Element rauskramen die modifiziert werden müssen
        for(var i = 0 ; i < scale_blocks[scale_element].length;i++) {
            scalePanel(scale_blocks[scale_element][i],modified_by,attrib,direction);
        }
        
        scalePanel(scale_center,modified_by,attrib,direction);
        
        var d = scale_panel.getSize();
        scale_panel.getComponent().style[attrib] = d[direction]+modified_by+"px";
        root_block.style[attrib]                 = d[direction]+modified_by+"px";
        inner_block.style[attrib]                = (d[direction]+modified_by-11)+"px";
        
        if(direction == 0) scale_panel.setSize(d[0]+modified_by,d[1]);
        else               scale_panel.setSize(d[0],d[1]+modified_by);
        
        switch(scale_element) {
            case 'left':
                var left = root_block.offsetLeft;
                root_block.style.left = (parseInt(left)-modified_by)+"px";
                break;
            case 'top':
                var top = root_block.offsetTop;
                root_block.style.top = (parseInt(top)-modified_by)+"px";
                break;
        }
                
        old_mouse = new_mouse;
        blocks_modified = [];
    };
    
    function scalePanel(block,dimension,attrib,direction){
        do {
            if(blocks_modified.inArray(block)) return;
            
            var d          = block.getSize();
            var new_attrib = null;
            
            with(block.getComponent()) {
            
                if(getAttribute('scale') && getAttribute('scale') == 'half') {
                    var new_attrib = (d[direction]+dimension/2);
                    style[attrib]  = new_attrib+"px";
                    
                    if(direction == 0) block.setSize(new_attrib,d[1]);
                    else               block.setSize(d[0],new_attrib);
                    
                } else {
                    var new_attrib = d[direction]+dimension;
                    style[attrib]  = new_attrib+"px";
                    
                    if(direction == 0) block.setSize(new_attrib,d[1]);
                    else               block.setSize(d[0],new_attrib);
                }
            }
            
            blocks_modified.push(block);
            block = block.getParentComponent();
        }while( block && block != scale_panel );
        
    };
    
    function stopResize(e){
        var e = e || window.event;
        Element.stopEvent(e);
    
        Element.unlinkEvent(document,'mouseup'   ,stopResize);
        Element.unlinkEvent(document,'mousemove' ,moveResizePanel);
        
        scale_panel.loaded = function () {} ;
        scale_panel.setVisible(true);
        
        modifikator = 1;
    };
    
    function scaleComponent(e){
        var e = e || window.event;
        if(e) Element.stopEvent(e);

        if(cb_function) {
            cb_function.call({
                scaledBy:function(){
                    return scaled_by;
                },
                dimension:function(){
                    var d = scale_panel.getSize();
                    return [d[0]-11,d[1]-11];
                }
            });
        }
        
    };
    
    function onScale(callback){
        cb_function = callback;
    };
    
    function callOnStart(callback) {
        callOnStart = callback;
    };
    
    function endScale () {
        scale_panel.removeComponents();
        Element.unlink(root_block);
    };
    
    function finishScale(){
        scaleComponent();
    };
    
    function init(){
        var dim = Element.getCoords(root_panel);
        root_block   = Element.create('div');
        
        var root_parent = root_panel.parentNode;
        
        if(!root_parent.style.position) {
            root_parent.style.position = "relative";
        }
        
        Element.attrib(root_block,'style',{
            position:'absolute',
            top:root_panel.offsetTop-5.5+"px",
            left:root_panel.offsetLeft-5.5+"px",
            height:(dim.h+11)+"px",
            width:(dim.w+11)+"px",
            zIndex:10000
        });
        
        inner_block = Element.create('div');
        
        Element.attrib(inner_block,'style',{
            position:'absolute',
            top:6+"px",
            left:6+"px",
            height:(dim.h-1)+"px",
            width:(dim.w-1)+"px"
        });
        root_block.id = "blocki";
        
        var scale_finish_icon = Element.create('div');
        
        Element.attrib(scale_finish_icon,'style',{
            cssFloat:'right',
            height:'20px',
            width:'20px',
            background:'url(img/icons/scale_finish.png)',
            position:'relative',
            top:'6px',
            right:'6px',
            cursor:'pointer',
            zIndex:2
        });
        
        Element.addEvent(scale_finish_icon,'click',scaleComponent);
        
        Element.bind(root_block,root_panel.parentNode);
        Element.bind(inner_block,root_block);
        Element.bind(scale_finish_icon,root_block);
        
        scale_panel = new BitPanel('blocki');
        scale_panel.setLayout(new BorderLayout());
        scale_panel.setAttribute('position','absolute');
        
        createScaleBorder(dim.w+11,dim.h+11);
        
        scale_panel.setVisible(true);
        
        scale_panel.loaded = prepareResize();
        
        return this;
    };
        
    this.callOnStart = callOnStart;
    
    this.finishScale = finishScale;
    
    this.blockScaleDirection = blockScale;
    
    this.endScale = endScale;
    
    this.onScale = onScale;
    
    this.init = init;
};
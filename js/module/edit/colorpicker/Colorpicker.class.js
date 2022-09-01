function WebColors(){

    // 2 Dimensionales Array
    // [ 1 =>  [  feld , farbe ]  , 2 => [   feld ,  farbe ] ]
    var colorFields = [];

    var colors     = createColorArray();

    var colorTable = createColorTable();

    function createColorArray(){
        var colors    = [];
        var red       = 0;
        var green     = 0;
        var blue      = 0;
        var hex_color = ['0','3','6','9','c','f'];

        for(var i = 1 ; i <= 216 ;i++) {
            colors.push(hex_color[red]+""+hex_color[green]+""+hex_color[blue]);

            if(i % 36 == 0 && i != 0) {
                red  = 0;
                blue = 0;
                green++;
            } else if(i % 6 == 0 && i != 0) {
                blue = 0;
                red++;
            } else {
                blue++
            }
        }

        return colors;
    };

    function createColorTable() {
        var color_table = Element.create('table');
        var color_body  = Element.create('tbody');
        var color_row   = Element.create('tr');

        Element.bind(color_body,color_table);
        Element.bind(color_row,color_body);

        for(var i = 1 ; i <= 216 ;i++) {

            var col = colors[i-1];

            var td = Element.create('td');
            Element.attrib(td,'style',{
                height:'15px',
                width:'15px',
                background:'#'+col,
                overflow:'hidden',
                cursor:'pointer'
            });

            Element.bind(td,color_row);

            if(i % 18 == 0) {
                Element.bind(color_row,color_body);
                color_row = Element.create('tr');
            }

            colorFields.push([td,col.replace(/^(.)(.)(.)/,'$1$1$2$2$3$3')]);
        }
        return color_table;
    };

    /**
     * gibt die Farbtabelle zurück
     *@access public
     *@return HTML Tabelle
     */
    function getColorTable(){
        return colorTable;
    };

    /**
            * gibt die Farbfelder zurück
            *@access public
            *@return Array [ html feld , String Farbcode]
            */
    function getColorFields(){
        return colorFields;
    };

    this.getColorTable  = getColorTable;

    this.getColorFields = getColorFields;
};

function Colorpicker(webcolors,title) {

    var colors = webcolors;

    var color_preview = new BitPanel();

    var color_text    = new BitPanel();

    var color_code_field = Element.create('input');
    color_code_field.type = "text";

    var user_color = "";

    var colorWindow   = new BitFrame( (title||'Colorpicker') );
    colorWindow.setClassName('color_window');

    var oncolor_select = null;

    var stop_mouse_events = false;

    color_text.setBackground('#fff');
    color_preview.setBackground('#fff');

    function addEvents(){
        var fields = colors.getColorFields();
        var length = fields.length;

        for(var i = 0 ; i < length;i++) {
            (function(){
                var cur_col = fields[i][1];
                var cur_e   = fields[i][0];

                Element.addEvent(cur_e,'click',function(e){

                    if(stop_mouse_events) return;

                    user_color = '#'+cur_col;

                    color_preview.getComponent().style.background = user_color
                    color_code_field.value = cur_col;

                    if(oncolor_select)
                        oncolor_select(user_color);
                });
            })();
        }
    };

    function setUserColor(evt){
        var e = evt || window.event;
        var t = e.target || e.srcElement;

        var pattern = /[^0-9a-f]+/i;

        if(t.value.match(pattern))
            t.style.background = '#f33';
        else {
            t.style.background = '#fff';
            if(t.value.length == 3 || t.value.length == 6) {
                user_color = '#'+t.value;
            }
        }
        color_preview.getComponent().style.background = user_color;
    };

    function createColorWindow(){

        colorWindow.setLayout(new BorderLayout(0,2));

        // colorWindow.setSize(155,251)
        colorWindow.setBackground('#bababa');
        colorWindow.setResizeAble(false,true);

        var colorPanel = new BitPanel();
        var infoPanel  = new BitPanel()

        colorPanel.setSize(278,204);
        colorPanel.setClassName("colorpanel");
        infoPanel.setSize(20,20);

        infoPanel.setLayout(new GridLayout(2,0,2,0));

        infoPanel.add(color_preview);
        infoPanel.add(color_text);

        color_text.setLayout(new FlowLayout(2,0,"left"));

        var input_panel = new BitPanel();
        var lock_button = new BitButton();
        var color_button = new BitButton();

        input_panel.setSize(84,20);
        lock_button.setSize(20,20);
        color_button.setSize(20,20);

        Element.bind(color_code_field,input_panel.getComponent());

        color_text.add(new BitLabel('#'));
        color_text.add(input_panel);
        color_text.add(lock_button);
        color_text.add(color_button);

        lock_button.setClassName('lock_icon');
        color_button.setClassName('color_icon');

        lock_button.addAction('click',function () {
            var c = lock_button.getComponent();

            if(!stop_mouse_events) {
                c.className += " active";
                stop_mouse_events = true;
                color_code_field.setAttribute('readonly',true);
            } else {
                c.className = c.className.replace(/\sactive/g,"");
                stop_mouse_events = false;

                color_code_field.removeAttribute('readonly',true);
            }
        });

        color_button.addAction('click',function(){
            if(oncolor_select)
                oncolor_select(user_color);
        });

        Element.addEvent(color_code_field,'keyup',setUserColor);

        colorWindow.add(colorPanel,'CENTER');
        colorWindow.add(infoPanel,'SOUTH');

        if(colors) {
            Element.bind(colors.getColorTable(),colorPanel.getComponent());
            addEvents();
        }

        colorWindow.setVisible(true);
    };

    this.getWindow = function (){
        return colorWindow;
    };

    this.show = function () {
        createColorWindow();
        return this;
    };

    this.onSelectColor = function (cb){
        oncolor_select = cb;
    };
};
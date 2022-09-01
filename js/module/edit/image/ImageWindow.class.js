function ImageWindow(){

    var overview_image = new Image();
        overview_image.src = "img/bild_edit_vorschau.jpg";

    /**
     * ein Dummy festlegen welches ein Bild Knoten im Baum repräsentiert
     * entspricht 1 zu 1 dem geladenen Bild das alle Änderungen aufnimmt erstmal
     */
    var dummyObject = {
        size:[ 0, 0],
        padding:{top:0, right:0, bottom:0, left:0},
        margin: {top:0, right:0, bottom:0, left:0},
        title:"",
        alt:"",
        border:{width:0, style:'solid', color:'#000'}
    };

    Template.getInstanz().addObserver( this );

    var frame = null;

    var colorFrame = null;

    // Aufbau
    // {
    //   value : inputfeld ,
    //   value : selectbox
    // }
    var used_fields = {};

    var image = null;

    /**
    * erstellt das Hauptfenster
    *@access private
    *@return void
    */
    function createFrame(){
        
        var inner_panel = new BitPanel();
            inner_panel.setLayout(new GridLayout(1,2,0,1));
            inner_panel.add(getReiter());
            inner_panel.add(getOverview());

        var button_panel = new BitPanel();
            button_panel.setLayout(new FlowLayout(10,0,'right'));
            button_panel.setBackground("#d9d9d9");
            button_panel.setAttribute("padding","2px 5px");

        var save_button   = new BitButton("speichern");
            save_button.setClassName("save");
            save_button.setAttribute("padding","0 0 0 20px");
            save_button.getComponent().id = "ie_save_button";
            save_button.addAction('click', saveImageValues );

        var cancel_button = new BitButton("zurück setzen");
            cancel_button.setClassName("cancel");
            cancel_button.setAttribute("padding","0 0 0 20px");
            
        // cancel_button.addAction('click',restoreValues);

        button_panel.add(save_button);
        button_panel.add(cancel_button);

        frame = new BitFrame("Bildeinstellungen");
        frame.setClassName("imageEditor");
        frame.setResizeAble(false,true);
        frame.setSize(350,497);
        frame.setPosition(310,50);
        frame.setLayout(new BorderLayout(0,1));
        frame.setBackground('#828182');
        frame.add(inner_panel,'center');
        frame.add(button_panel,'south');
    };

    /**
    * erstellt die den Tabbereich für die allgemeinen Einstellungen
    *@access private
    *@return BitPanel
    */
    function allgemein() {
        
        var fields = [
        ['Ausrichtung',['cssFloat',['keine','none'],['links','left'],['rechts','right']]],
        ["Weite","width"],
        ["Höhe","height"],
        ["Title","title"],
        ["Alternativer Text","alt"]
        ];

        var allg = new BitPanel();
            allg.setLayout(new GridLayout(2,6,5,2));
            allg.setClassName("tab_panel");
            allg.setAttribute("padding","5px");

        addRows(allg,fields);

        /* RAHMEN EINSTELLUNGEN                                */
        /*=====================================================*/
        allg.add(new BitLabel("Rahmen:"));
        ;

        var input = new BitPanel();
        input.setSize(135,20);

        var color = new BitButton();
        color.setClassName("color");
        color.setSize(20,20);

        color.addAction('click',function(){
                
            if( colorFrame && colorFrame.getWindow().inDocument() )
                return false;

            colorFrame = new Colorpicker( new WebColors() );
            colorFrame.getWindow().setTitle("Rahmenfarbe");
            colorFrame.show();

            var pos = Element.getCoords(color.getComponent());

            var x = pos.posX - colorFrame.getWindow().getSize()[0] + pos.w;
            var y = pos.posY;

            colorFrame.getWindow().setPosition(x , y);
            colorFrame.onSelectColor(function( c ){
                dummyObject.border = {
                    width: parseInt( used_fields['border'].value, 10 ),
                    style: 'solid',
                    color: c
                }

                setChanges( 'border' );
            });

            frame.add( colorFrame.getWindow() );
            
        });

        var input_field = Element.create('input');
            input_field.setAttribute("set","border");
            
        used_fields['border'] = input_field;

        Element.bind(input_field,input.getComponent());
        Element.addEvent(input_field,'keyup',function(){
            setChanges( 'border' );
        });

        var panel = new BitPanel();
        panel.setLayout(new FlowLayout(5,0,"left"));
        panel.setClassName("image_border_color_panel")
        panel.add(input);
        panel.add(color);

        allg.add(panel);

        return allg;
    };

    /**
    * erstellt die den Tabbereich für die Abstände
    *@access private
    *@return BitPanel
    */
    function spacing(){
        var space = new BitPanel();
            space.setLayout(new GridLayout(1,2,0,5));
            space.setClassName("tab_panel_spaceing");

        var margin_panel  = new BitPanel();
            margin_panel.setLayout(new BorderLayout() );
            margin_panel.setAttribute("padding", "5px");

        var headline_margin  = new BitLabel("Abstand nach außen");
            headline_margin.setSize(10,25);
            headline_margin.setClassName('headline');
            headline_margin.setAttribute('display','inline-block');

        var margin_inner = new BitPanel();
            margin_inner.setLayout(new GridLayout(4,2,2,5));
            margin_inner.setClassName('margin_inner_panel');

        addRows(margin_inner,[
            ['links:' ,'marginLeft'  ],
            ['rechts:','marginRight' ],
            ['oben:'  ,'marginTop'   ],
            ['unten:' ,'marginBottom']
            ]);

        margin_panel.add(headline_margin ,'north' );
        margin_panel.add(margin_inner    ,'center');

        var padding_panel = new BitPanel();
            padding_panel.setLayout(new BorderLayout());
            padding_panel.setAttribute('padding', "5px");

        var headline_padding = new BitLabel("Abstand nach innen");
            headline_padding.setSize(10,25);
            headline_padding.setClassName('headline');
            headline_padding.setAttribute('display','inline-block');

        var padding_inner = new BitPanel();
            padding_inner.setLayout(new GridLayout(4,2,2,5));
            padding_inner.setClassName('padding_inner_panel');

        addRows(padding_inner,[
            ['links:' ,'paddingLeft'  ],
            ['rechts:','paddingRight' ],
            ['oben:'  ,'paddingTop'   ],
            ['unten:' ,'paddingBottom']
            ]);

        padding_panel.add(headline_padding,'north' );
        padding_panel.add(padding_inner   ,'center');

        space.add(margin_panel);
        space.add(padding_panel);

        return space;
    };

    /**
    * erstellt die Tabs im oberen Bereich
    *@access private
    *@return BitTabbedPanel
    */
    function getReiter(){
        
        var reiter_panel = new BitTabbedPanel();
        reiter_panel.addTab("Allgemein",allgemein());
        reiter_panel.addTab("Abstände",spacing());

        return reiter_panel;
    };

    /**
    * erstellt die Vorschaufläche
    *@access private
    *@return BitPanel
    */
    function getOverview(){
        var overview_panel = new BitPanel();
        overview_panel.setClassName("image_edit_overview");

        var text = Element.create('p',"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed"+
            "diam nonumy eirmod tempor invidunt ut labore et dolore magna "+
            "aliquyam erat, sed diam voluptua. At vero eos et accusam et justo"+
            "duo dolores et ea rebum. Stet clita kasd gubergren, no sea"+
            "takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum"+
            "dolor sit amet, consetetur sadipscing elitr, sed diam.");

        overview_panel.loaded = function () {
            Element.bind(overview_image,this.getComponent());
            Element.bind(text,this.getComponent());
        };

        return overview_panel;
    };

    /**
    * einzelne Flächen einbinden
    * Felder werden wie folgt übergeben
    * [
    *    [ feldname , attribut wie width ]  ein einfaches Inputfeld
    *    [ feldname, [ Attribut wie cssFloat   [ Angezeigter Wert  ,  Attributswert  wie 'left'  ]  ]    eine Selectbox
    * ...
    * ]
    *@access private
    *@param <BitPanel> panel
    *@param <Array> fields
    *@return void
    */
    function addRows(panel,fields){
        for(var i = 0 ; i < fields.length;i++) {
            for(var j = 0 ; j < fields[i].length;j++) {
                if(j == 0)
                    panel.add(new BitLabel(fields[i][j]));
                else {
                    var inner_panel = new BitPanel();

                    // sollte es sich hier um ein weiteres Array handeln
                    // ist es eine Selectbox
                    if(fields[i][j].constructor == Array) {

                        var select = Element.create("select");

                        for(var k = 1 ; k < fields[i][j].length;k++) {
                            var option = fields[i][j][k];
                            select.options[select.length] = new Option(option[0],option[1],false,false);
                        }
                        
                        (function(){
                            var field = fields[i][j][0];

                            Element.addEvent(select,'change',function( evt ){
                                var e = evt || window.event;
                                setChanges( field );
                            });

                        })();

                        used_fields[fields[i][j][0]] = select;
                        Element.bind(select,inner_panel.getComponent());

                    } else {
                        var input = Element.create('input');
                        input.setAttribute('set', fields[i][j]);

                        used_fields[fields[i][j]] = input;

                        (function(){
                            var field = fields[i][j];

                            Element.addEvent(input,'keyup',function( evt ){
                                var e = evt || window.event;
                                
                                if(e.keyCode == 13) return false;

                                setChanges( field);
                            });
                        })();
                        
                        Element.bind(input,inner_panel.getComponent());
                    }
                    panel.add(inner_panel);
                }
            }
        }
    };

    function setDimension( value ){

        var ow = image.getSize().width;
        var oh = image.getSize().height;

        return {
            width:function(){
                
                dummyObject.size.width  = parseInt( value, 10);
                dummyObject.size.height = Math.round(value * oh / ow);
            },
            height:function(){
                dummyObject.size.width  = Math.round(value * ow / oh);
                dummyObject.size.height = parseInt( value, 10);
            }
        }
    }

    function setChanges( field ){

        switch (field ) {
            case 'title':
                dummyObject.title = used_fields[field].value;
                break;
            case 'alt':
                dummyObject.alt = used_fields[field].value;
                break;
            case 'cssFloat':
                dummyObject.cssFloat = used_fields[field].value;
                Element.attrib( overview_image, 'style',{
                    cssFloat:used_fields[field].value
                });
                break;
            case 'border':
                dummyObject.border.width = used_fields[field].value+"px";
                Element.attrib( overview_image, 'style',{
                    border:dummyObject.border
                })
                break;
            case 'width':
                setDimension(used_fields[field].value).width();
                used_fields['height'].value = dummyObject.size.height;
                break;
            case 'height':
                setDimension(used_fields[field].value).height();
                used_fields['width'].value = dummyObject.size.width;
            break;
            default:
                var matches = "";
                
                if( (matches = field.match(/^(margin|padding)(\w+)/) ) ) {
                    
                    var type      = matches[1];
                    var direction = matches[2];
                    var value     = used_fields[field].value;
                        value     = ( Element.trim(value) == "" )?0:parseInt( value, 10);

                    if(type == "margin")
                        dummyObject.margin[direction.toLowerCase()] = value;
                    else
                        dummyObject.padding[direction.toLowerCase()] = value;

                    Element.attrib( overview_image, 'style',
                        (function(){
                            var obj = {};
                                obj[field] = value+"px";
                            return obj;
                        })()
                    );
                }
                break;
        }
    }

    /**
     * Bild Eigenschaften speichern
     * überträgt dazu die Daten vom Dummy Image zu dem aktiven
     * Bild welches gewählt wurde
     */
    function saveImageValues(e){
        /* Änderungen vom Dummy in das gewählte Bild übertragen
         */
        var margin  = dummyObject.margin;
        var padding = dummyObject.padding;

        // margin und padding haben beide selbe Objekt Struktur
        for(var key in margin) {
            image.setMargin(  margin[key] , key );
            image.setPadding( padding[key], key );
        }

        image.setBorder( dummyObject.border.width, dummyObject.border.style, dummyObject.border.color );

        image.setSize( dummyObject.size.width, dummyObject.size.height );
        
        image.setFloat( dummyObject.cssFloat );
        /* Übertragung Ende
         */

        // CSS Attribute speichern und Bild im DOM Baum damit modifizieren
        var attrib = {
            margin:image.getMargin(),
            padding:image.getPadding(),
            width:image.getSize().width+"px",
            height:image.getSize().height+"px",
            cssFloat:image.getFloat(),
            border:image.getBorder()
        }

        Element.attrib( image.getComponent(), "style", attrib );
    };

    function updateDisplay() {
        
        used_fields.width.value  = image.getSize().width;
        used_fields.height.value = image.getSize().height;
        used_fields.border.value = image.getBorder().borderWidth;
        used_fields.title.value  = image.getComponent().getAttribute('title');

        // margin
        used_fields.marginTop.value    = image.getMargin().top;
        used_fields.marginRight.value  = image.getMargin().right;
        used_fields.marginBottom.value = image.getMargin().bottom;
        used_fields.marginLeft.value   = image.getMargin().left;

        // padding
        used_fields.paddingTop.value    = image.getPadding().top;
        used_fields.paddingRight.value  = image.getPadding().right;
        used_fields.paddingBottom.value = image.getPadding().bottom;
        used_fields.paddingLeft.value   = image.getPadding().left;

        used_fields.border.value        = parseInt( image.getBorder().width, 10);

        var attrib = {
            margin:image.getMargin(),
            padding:image.getPadding(),
            cssFloat:image.getFloat(),
            border:image.getBorder()
        }

        Element.attrib( overview_image, 'style', attrib );
    };

    function reset(){

        for(var key in used_fields ) {
            used_fields[key].value = "";
        }

        var attrib = {
            padding:{top:0, right:0, bottom:0, left:0},
            margin: {top:0, right:0, bottom:0, left:0},
            cssFloat: 'none',
            border:"0px"
        }

        Element.attrib(overview_image, 'style', attrib);
    }

    this.getFrame = function (){
        if(!frame)
            createFrame();

        return frame;
    }

    /****************************************
     * Callback Methoden vom Template Model *
     ***************************************/

    /**
     * ein neues Template wurde geladen
     */
    this.update = function (){
        reset();
    };

    /**
     * Ebenen wurden gelöscht bzw hinzugefügt
     * es hat sich hier was geändert
     */
    this.updateView  = function( modification ){};

    /**
     * eine Ebene wurde markiert zur weiteren Verarbeitung
     * @access public
     * @param <int> selected
     * @param <int> lastSelected
     */
    this.markElement = function( selected ){
        var node = Tree.getInstanz().getNode( selected );

        if( node.isLeaf() ) {
            image = node;
            dummyObject.size = {width:image.getSize().width, height:image.getSize().height};
            updateDisplay();
        }
    };
};
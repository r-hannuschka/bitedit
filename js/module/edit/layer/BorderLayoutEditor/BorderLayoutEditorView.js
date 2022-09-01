function BorderLayoutEditorView ( model ) {

    AbstractEditorView.call( this , model );

    var _self = this;

    var _panel = null;

    var _layer = ["north","south","west","east","center"];
	
    var _main = new BitPanel();
        _main.setLayout( new BorderLayout(1,1) );
        _main.setBackground("#D9D9D9");
        _main.getComponent().style.padding = "10px";

    var _overview = new BitPanel();
        _overview.setSize(150, 10 );
        _overview.setBackground("#D9D9D9");
        _overview.getComponent().style.padding = "10px";

    function createDisplay(){
        _panel.setLayout( new BorderLayout(1,0) );
        _panel.add(_main, "center");
        _panel.add(_overview,"east");
    };

    function createPanel( direction ) {
        var panel = new BitPanel();
            panel.setBackground( "#4E4E4E" );

        switch (direction ) {
            case 'north':
            case 'south':
                panel.setSize( 10, 70 );
                break;
            case 'west':
            case 'east':
                panel.setSize (70 , 10 );
                break;
            default:

        }

        _main.add( panel, direction );
    };

    /**
     * fügt Checkboxen hinzu für jede Fläche
     */
    function addCheckbox( direction , exists , key){
        
        var label = Element.create("label");
            label.style.display = "block";
            label.className = "clearfix";

        var text  = Element.create("span","("+
            (function(text){
                text[0] = text[0].toUpperCase();
                return text;
            })(direction.split("")).join("")
            +")"
        );

        var field = Element.create("input");

        field.type = "checkbox";

        Element.attrib(label, "style", {
            padding:"5px 0",
            lineHeight:"20px"
        });

        Element.attrib(field , "style", {
            cssFloat:"left",
            margin:"5px 5px 0 0px"
        });

        if(exists) field.checked = "checked";

        Element.bind( field, label );
        Element.bind( text, label );

        Element.bind( label , _overview.getComponent() );

        (function(){
            var dir = direction;

            Element.addEvent(field, "click", function(evt){

                var e = evt || window.event;
                
                if ( e.stopPropagation ) e.stopPropagation;
                else                     e.cancleBubble = true;
                
                var t = e.target || e.srcElement;

                if(t.checked) {
                    createPanel(dir);
                    _self.getModel().setLayerStatus(dir, 1);
                } else {
                    removePanel(dir);
                    _self.getModel().setLayerStatus(dir, 0);
                }
                
                _main.setVisible(true);
            });
        })();
    };

    function removePanel( direction ){
        _main.getLayoutManager().removeComponent( direction );
    };

    /**
     *Flächen einarbeiten welche bereits existieren
     *@access private
     *@param <Array> components ein Array wo markierte Flächen mit 1 belegt sind
     *@return void
     */
   function setComponents ( components ){
        var len    = components.length;
        for(var i = 0 ; i < len ; i++ ) {
            if(components[i] === 1 ) {
                createPanel( _layer[i] );
            }
            addCheckbox( _layer[i] , (components[i] === 1)?true:false);
        }
   };

    this.prepareView = function ( panel ) {
        _panel = panel;

        setComponents( _self.getModel().getPanels() );
        createDisplay();

       return _panel;
    };
};
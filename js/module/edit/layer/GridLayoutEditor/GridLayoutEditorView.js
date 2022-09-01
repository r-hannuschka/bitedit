function GridLayoutEditorView( model ){
    AbstractEditorView.call(this, model);

    var _model = model;

    var _display = null;
    
    var panelsSet = 0;

    function createDisplay(){
        var cols = _model.getCols() ;
        var rows = _model.getRows();

        _display = new BitPanel();
        _display.setAttribute("padding","10px");
        _display.setBackground("#D9D9D9");
        _display.setLayout( new GridLayout(cols, rows, 1, 1) );

        var panels = _model.getPanels();

        for(var i = 0 ; i < panels.length; i++ ) {

            if(panels[i] === 1) {
                var panel = new BitPanel();
                    panel.setBackground("#4E4E4E");
                
                _display.add( panel );
            }
        }

        panelsSet = _model._layer.getLayer().contains().length;

        return _display;
    }

    function createOverView(){

        var _overview = new BitPanel();
            _overview.setClassName("gridLayoutEditor");
            _overview.setBackground("#D9D9D9");
            _overview.setLayout(new FlowLayout(0, 5, null) );
            _overview.setAttribute("padding","5px");
            _overview.setSize(150,50);

        for(var i = 0 ; i < 2 ; i++) {
            var label = Element.create("label", "<p>"+( (i > 0 )?"Reihen":"Spalten" )+"</p>");
                
            var input = Element.create("input");
                input.id    = "insert_"+((i > 0)?"row":"col");
                input.value = (i > 0)? parseInt( _model.getRows(), 10)
                                     : parseInt( _model.getCols(), 10);

            (function(){
                var key = i;
                Element.addEvent(input,"keyup",function(evt){
                    var e = evt || window.event;
                    var t = e.target || e.srcElement;
                    Element.stopEvent(e);

                    if(e.keyCode == 13 ) {
                        var value = ( parseInt(t.value, 10) === 0)?1: parseInt(t.value, 10);

                        if(key === 0){
                            _model.setCols ( value );
                            _display.getLayoutManager().setCols( value );
                        } else {
                            _model.setRows (value );
                            _display.getLayoutManager().setRows ( value );
                        }
                    }
                    
                    _display.setVisible( true );
                });
            })();

            Element.attrib(label,"for","insert_"+( (i > 0)?"row":"col") ) ;

            Element.bind( input, label );
            Element.bind( label, _overview.getComponent() );
        }

        // Buttons hinzufügen
        var btn1 = new BitButton("Ebene hinzufügen" );
        var btn2 = new BitButton("Ebene löschen");

        btn1.setClassName("button addLayer");
        btn2.setClassName("button removeLayer");

        /**
         * hinzufügen von neuen Flächen
         */
        btn1.addAction( "click", function() {
            
            if( _model.getRows() * _model.getCols() > panelsSet ) {
            
                _model.addLayer();
           
                var panel = new BitPanel();
                    panel.setBackground("#4E4E4E");

                _display.add(panel);
                _display.setVisible(true);

                panelsSet++;        
            }
        });

        /**
         * löschen von Flächen
         */
        btn2.addAction("click", function(){
            if(panelsSet > 0) {
                _model.removeLayer();
                _display.removeComponent( _display.contains()[_display.contains().length-1] );
                _display.setVisible( true );
                
                panelsSet--;
            }
        });

        _overview.add( btn1 );
        _overview.add( btn2 );
        
        return _overview;
    }

    this.prepareView = function( panel ){

        panel.setLayout( new BorderLayout(1,0) );
        panel.add( createDisplay() , "center" );
        panel.add( createOverView(), "east" );

        return panel;
    }
}
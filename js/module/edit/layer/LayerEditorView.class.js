function LayerEditorView(ctrl){

    var _ctrl     = ctrl;

    var mainPanel = null;

    var _frame    = null;

    var _editor   = null;

    var _display  = new BitPanel();
        _display.setBackground("#fff");

    var _self     = this;

    var dummy    = null;

    var layer    = null;

    var tempLayer = null;

    var baseLayer = null;

    var selectedLayoutEditor = "";

    var lastActiveBtn = null;

    var btns = {};

    var dummyset = false;

    /**
     * baut das Grundfenster zusammen
     * @access private
     * @return <BitFrame> _frame
     */
    function constructFrame(){
        if(!_frame) {
            _frame = new BitFrame("Ebenen Editor");
            _frame.setClassName("layerEditor")
            _frame.setSize(462,500);
            _frame.setPosition(300,150);
            _frame.setBackground("#fff");
            _frame.setResizeAble( false, true);

            mainPanel = new BitPanel();
            mainPanel.setLayout( new BorderLayout(0, 1) );
            mainPanel.setBackground("#F3F3F3");
            mainPanel.add ( _display, "center" );
            mainPanel.add ( getOptions(), "north" );
            mainPanel.add( save() , "south" );

            _frame.add( mainPanel );

            WindowManager.centerWindow( _frame );
        }
        return _frame;
    };

    /**
     *liefert die Basis Optionen zurück
     *@access private
     *@return <BitTabbedPanel> options
     */
    function getOptions(){

        var options = new BitTabbedPanel();
            options.setSize(1,92);

        options.addTab("Layout"       , layoutButtons() );
        options.addTab("Größe"        , sizeOption());
        options.addTab("HGap/VGap"    , gapOption() );
        options.addTab("Abstand innen", paddingOption() );

        return options;
    };

    /**
     * einstellen der Ebenen Eigenschaften wie
     * padding , hgap , vgap sowie Größe
     * @access public
     * @return <BitPanel> optionPanel
     */
    function sizeOption(){
        var optionPanel = new BitPanel();
            optionPanel.setLayout(new GridLayout(2, 1, 5, 5));
            optionPanel.setAttribute("padding","5px");
            
            optionPanel.add ( layerOptions.createInput('Weite', 'width',  0) );
            optionPanel.add ( layerOptions.createInput('Höhe' , 'height', 0) );

        return optionPanel;
    };
    
    /**
     * erstellt das Panel für den Tab Padding Optionen
     * @access private
     * @return <BitPanel> optionPanel
     */
    function paddingOption(){
        var optionPanel = new BitPanel();
            optionPanel.setLayout(new GridLayout(2, 2, 5, 5));
            optionPanel.setAttribute("padding","5px");

            optionPanel.add ( layerOptions.createInput('oben'  ,'paddingTop'   , 0) );
            optionPanel.add ( layerOptions.createInput('rechts','paddingRight' , 0) );
            optionPanel.add ( layerOptions.createInput('unten' ,'paddingBottom', 0) );
            optionPanel.add ( layerOptions.createInput('links' ,'paddingLeft',   0) );

         return optionPanel;
    };

    /**
     * erstellt das Panel für den Tab HGap und VGap Optionen
     * @access private
     * @return <BitPanel> optionPanel
     */
    function gapOption(){
        var optionPanel = new BitPanel();
            optionPanel.setLayout(new GridLayout(2, 1, 5, 5));
            optionPanel.setAttribute("padding","5px");

            optionPanel.add ( layerOptions.createInput('horizontal', 'hGap', 0) );
            optionPanel.add ( layerOptions.createInput('vertikal'  , 'vGap', 0) );

         return optionPanel;
    };

    /**
     * Optionen setzen wenn das Fenster geladen ist
     * dazu Informationen vom Original Layer holen
     * @access private
     * @param <LayerNode> layer
     */
    function preloadOptions( layer ){
        layerOptions.getField('paddingTop').value    = layer.getPadding().top;
        layerOptions.getField('paddingRight').value  = layer.getPadding().right;
        layerOptions.getField('paddingBottom').value = layer.getPadding().bottom;
        layerOptions.getField('paddingLeft').value   = layer.getPadding().left;

        layerOptions.getField('hgap').value = layer.getHGap();
        layerOptions.getField('vgap').value = layer.getVGap();
        
        layerOptions.getField('width').value  = layer.getSize().width;
        layerOptions.getField('height').value = layer.getSize().height;
    };

    /**
     * den Layoutbutton für das aktive Layout aktivieren
     * @access private
     * @param <String> name
     * @return void
     */
    function activateLayoutButton( name ){
        if(lastActiveBtn) {
            lastActiveBtn.removeClassName("active");
        }

        btns[name].setClassName("active");
        lastActiveBtn = btns[name];
    };

    /**
     *Layout Buttons hinzufügen zum Ebenen Editor
     *um das Layout umzustellen von der aktuellen
     *Ebene
     *@access private
     *@return <BitPanel> p
     */
    function layoutButtons(){

        var p = new BitPanel();
            p.setLayout( new GridLayout(3, 1, 1, 0) );
            p.setBackground("#F3F3F3");
            p.setAttribute("padding","0px 1px");

        /* nur Border und Gridlayout nehmen
         * der 3. Durchlauf wäre dann das Flowlayout was noch nicht
         * implementiert ist
         */
        for(var i = 0 ; i < 3; i++) {
            var name = "";

            switch (i) {
                case 0:name = "BorderLayout";break;
                case 1:name = "GridLayout";break;
                case 2:name = "FlowLayout";break;
            }

            var btn = new BitButton(name);
                btn.setClassName("layoutButton");

                btns[name.toLowerCase()] = btn;

            /* Event auf Button legen
             * Closure damit das Namens Attribut nicht verloren
             * geht innerhalb der For Schleife sonst würde
             * die Variable n immer überschrieben werden
             */
            (function(){
                var n = name;

                btn.addAction("click",function(){
                    if( !_editor ) {
                        createDummyEditor( createDummyLayer( n ) );
                    } else 
                        changeLayout( n );

                    activateLayoutButton( n.toLowerCase() );
                });

            })();

            p.add( btn );
        }

        return p;
    };

    /**
     * Dummy Layer erstellen , dies ist notwendig falls der Layer ein
     * neues Layout bekommen soll damit der Layer nicht überschrieben wird
     * sondern erst beim speichern alle Änderungen übertragen werden
     * @access private
     * @param <String> name
     * @return <LayerNode> tempLayer
     */
    function createDummyLayer( name ) {
        
        if(!dummy) {
            dummy = new BitPanel();
        } else
            dummy.removeComponents();

        switch ( name.toLowerCase() ) {
            case 'borderlayout':
                dummy.setLayout( new BorderLayout() );
                break;
            case 'gridlayout'  :
                dummy.setLayout( new GridLayout(1,1) );
                break;
            case 'flowlayout' :
                dummy.setLayout( new FlowLayout() );
        }

        if( !tempLayer )
            tempLayer = new LayerNode( dummy );
        else {
            tempLayer.clear();
            tempLayer.update();
        }

        return tempLayer;
    };

    /**
     * das Layout einer Fläche wechseln
     *@access private
     *@param <String> name
     *@return void
     */
    function changeLayout( name ){

        // sofern ein Editor existiert
        if( _editor && name.toLowerCase() !== selectedLayoutEditor ){
            /* stellt sich nun die Frage wurde wieder das alte Layout gewählt
             * sollte dem der Fall sein wird wieder der baseLayer gewählt
             */
            if( baseLayer && baseLayer.getLayout() == name.toLowerCase() ) {
                layer    = baseLayer;
                dummyset = false;
            } else {
                layer    = createDummyLayer( name.toLowerCase() );
                dummyset = true;
            }

            selectedLayoutEditor = name.toLowerCase();

            _editor = LayoutEditorFactory.createLayoutEditor( layer.getPointer() );
            _editor.getModel().addObserver( _ctrl );

            _editor.getModel().dummySet( true );
            _editor.getModel().setBaseLayer( baseLayer );
                
            _self.addEditor( _editor );
        }
    };

    /**
     * sollte die View noch keinen Editor haben da kein Editor
     * erstellt werden konnte
     */
    function createDummyEditor( dLayer ){
        layer = dLayer;

        _editor = LayoutEditorFactory.createLayoutEditor( layer.getPointer() );
        _editor.getModel().addObserver( _ctrl );
        _editor.getModel().setBaseLayer( baseLayer );

        _self.addEditor( _editor );

        selectedLayoutEditor = layer.getLayout().toLowerCase();
    };

    /**
     * erstellt den Speichern Button und leitet desses Event an die
     * Funktion saveModification weiter
     * @access private
     * @return <BitButton> btn
     */
    function save(){
        var btn = new BitButton("Änderungen übernehmen");
            btn.setSize(1,20);
            btn.setClassName("saveModifications");

        btn.addAction("click", function() {
            if( _editor.getModel()._layer.getChilds().length > 0 ) {
                _frame.add( ConfirmWindow.getConfirmWindow() );

                ConfirmWindow
                .show("Durch die Änderungen werden andere Ebenen beeinflusst<br />"+
                    "Änderungen durchführen ?")
                .confirm(
                    function(){
                        saveModification();
                    },
                    function(){} // wenn nein
                    );
            } else
                saveModification();
        });

        return btn;
    };

    /**
     * Globale Eigenschaften auf den Layer übertragen und dort
     * speichern Änderungen werden in base/template/Template.class.js
     * übertragen und angewendet
     * @access private
     * @return void
     */
    function saveGlobalValues() {
        var layer = _editor.getModel().getBaseLayer();

        layer.setPadding(layerOptions.getField('paddingTop').value    ,"top");
        layer.setPadding(layerOptions.getField('paddingRight').value  ,"right");
        layer.setPadding(layerOptions.getField('paddingBottom').value ,"bottom");
        layer.setPadding(layerOptions.getField('paddingLeft').value   ,"left");

        layer.setHGap( layerOptions.getField('hgap').value );
        layer.setVGap( layerOptions.getField('vgap').value );

        _editor.getModel().setSize(
            layerOptions.getField('width').value,
            layerOptions.getField('height').value
        );
    }

    /**
     * lässt den Editor seine Daten speichern
     * entfernt den Dummy falls notwendig
     */
    function saveModification(){
        saveGlobalValues();

        _editor.save();

        if( dummy ) {
            Tree.getInstanz().removeTreeNode( tempLayer );
            _editor.getModel()._layer.update();
        }

        tempLayer = null;
        layer     = null;
        dummy     = null;
        dummyset  = false;
    };

    /**
     *sobald eine Fläche selektiert wurde , wird im Controller
     *über die LayoutEditorFactory die passende Editor View Objekt
     *der View übergeben.
     *Die aktuelle view vom Editor gerendert und an das Panel
     *gebunden
     *
     *@access public
     *@param <AbstractEditorView> editor
     *@return void
     */
    this.addEditor = function (editor) {
        
        _editor = editor;
        
        _display.removeComponents();
        _display.setLayout(null);
        _display.setBackground('#F3F3F3');
        _display.setAttribute("padding","0px");

        /* ersteinmal zur Buglösung mit rein
           die Fläche wurde nicht leer geräumt vorher
           was zu einen Fehler führt in der HTML Struktur
           passiert wenn vorher ein FlowLayout Editor drinnen war
           dann wird die innerbox welche für das margin verantwortlich ist
           nicht gelöscht
        */
        _display.getComponent().innerHTML = "";

        /**
         * nicht so optimal das erst das Zentrum gelöscht werden muss
         * damit es neu hinzugefügt werden kann passiert beim BorderLayout
         * das die Komponente vorher nicht gelöscht wird was eigentlich
         * passieren sollte
         */
        mainPanel.removeComponent("center");
        mainPanel.add ( editor.prepareView( _display ), "center");

        activateLayoutButton( _editor.getModel().getName().toLowerCase() );

        if( !dummyset ) {
            if( !Scale.scaleWidthAvailable( _editor.getModel()._layer ) )
                layerOptions.lockField('width');
            else
                layerOptions.unlockField('width');
        }

        // nur dann neu zeichnen wenn das Fenster sichtbar ist
        if(_frame && _frame.inDocument() ) {
            mainPanel.setVisible( true );
        }
    };

    this.getFrame = function (){

        if( !_frame ) {
            constructFrame();
        }

        return _frame;
    };

    /**
     * setzt den Ursprungslayer fest wo alles begann
     * somit wird sicher gestellt das selbst wenn das Layout sich im Editor
     * ändert, es erst dann übertragen wird wenn auf speichern gedrückt wird
     * ansonsten gibt es immer den Fallback auf den Basis Layer
     * @access public
     * @param <LayerNode> bl
     * @return void
     */
    this.setBaseLayer = function( bl ) {
        
        selectedLayoutEditor = "";

        baseLayer = bl;
        
        if (!_frame )
            constructFrame();

        preloadOptions( bl );
    };

    this.clear = function () {
        _display.removeComponents();
        _display.setLayout(null);
        _editor = null;

        if( _frame && _frame.inDocument() )
            _display.setVisible(true);

        this.reset();
    };

    this.reset = function(){
        baseLayer = null;
        dummy     = null;
        tempLayer = null;
        layer     = null;
        dummyset  = false;
    };
}

var layerOptions = (function(){
    var usedFields = {};
    
    function createInputField( name, value ){
         usedFields[name]       = Element.create('input');
         usedFields[name].value = value;
         
         Element.attrib( usedFields[name], 'style', {cssFloat:'right'});

         return usedFields[name]
    }
    
    function lockField(e){
        var evt = e || window.event;

        if(evt.preventDefault) evt.preventDefault();
        else                   evt.returnValue = false;
    }

    return {
        getField:function( name ){
            if(!usedFields[name.toLowerCase()])
                return null;

            return usedFields[name.toLowerCase() ];
        },
        createInput:function( name, fieldName, value){
            var label = new BitLabel(name+": ");
                label.getComponent().appendChild( createInputField( fieldName.toLowerCase(), value ) );

            return label;
        },
        lockField:function( name ) {
            usedFields[name].style.background = "#CCC";
            usedFields[name].style.color      = "#555";

            Element.addEvent(usedFields[name],'keypress', lockField);
            Element.addEvent(usedFields[name],'keydown' , lockField);
        },
        unlockField:function(name){
            usedFields[name].style.background = "#FFF";
            usedFields[name].style.color      = "#000";
            
            Element.unlinkEvent(usedFields[name],'keypress', lockField);
            Element.unlinkEvent(usedFields[name],'keydown' , lockField);
        }
    }
})();
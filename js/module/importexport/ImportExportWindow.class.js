function ImportExportWindow( ctrl ){

    var frame = null;
    var ctrl  = ctrl;

    function createFrame(){
        frame = new BitFrame("Im- / Export");
        frame.setSize(300, 190);
        frame.setBackground("#fff")
        frame.setResizeAble(false, true);
        
        frame.add( getTabPannel() );
    }
    
    function getTabPannel(){    
    
        var _import = new ImportView( ctrl );
        var _export = new ExportView( ctrl );
    
        _import.onReady ( closeWindow );
        _export.onReady ( closeWindow );
    
        var tabPanel = new BitTabbedPanel();
            tabPanel.addTab("importieren", _import.init() ); 
            tabPanel.addTab("exportieren", _export.init() ); 
            
        return tabPanel;
    }
    
    function closeWindow() {
        WindowManager.closeWindow( frame.getUID() );
    }
    
    this.init = function(){
        if( !frame ){
            createFrame();
        }

        if( !frame.inDocument() ) {
            frame.setVisible( true );
            WindowManager.centerWindow( frame );
            
            var ae = new ActionEvent( ActionEvent.MAIN_EVENT );
                ae.setMessage("addframe");
                ae.addParam( frame );

            ctrl.handleEvent( ae );
        }
    }
}

/**
*class ImportView 
*/
function ImportView( ctrl ){

    var panel   = null;
    
    var display = null;

    var importFrom = null;
    
    var input      = null;
    
    var onFinish  = null;
    
    var urlImport  = null;
    
    var fileImport = null;
    
    function createPanel(){
        panel = new BitPanel();
        panel.setLayout( new BorderLayout(1,4) );
        panel.setAttribute("padding","5px");
        
        panel.add( createMenu()   , "north"  ); 
        panel.add( createDisplay(), "center" ); 
        panel.add( createButton() , "south"  ); 
    }
    
    function createMenu(){
        var menu = document.createDocumentFragment();
        
        var p = new BitPanel();
            p.setLayout(new GridLayout(2, 1, 10, 1) );
            p.setSize(10,20);
                    
        for(var i = 0; i < 2; i++) {
            var btn = new BitButton( (i===0)?"von Url":"Dateisystem" );
                btn.getComponent().setAttribute("name", (i===0)?"url":"file"); 
                btn.setBackground("#FFF");
                btn.addAction("click", changeDisplay);
                
            p.add(btn);
        }
        
        return p;
    }
    
    function createDisplay() {
        urlImport = getUrlImport();
        importFrom = "url";

        fileImport = getFileImport();
    
        display = new BitPanel();
        display.setContent( urlImport );
        
        return display;
    }
    
    function changeDisplay(evt){
        var e = evt || window.event;
        var t = e.target || e.srcElement;
        
        var _import = null;
        
        switch ( t.getAttribute("name") ) {
            case 'url': 
                if ( importFrom == "url") 
                    return;
                    
                importFrom = "url";
        
                if( !urlImport )
                    urlImport = getUrlImport();
               
                _import = urlImport;
            break;
            case 'file': 
                if ( importFrom == "file") 
                    return;
                    
                importFrom = "file";
                fileImport = getFileImport();
                _import = fileImport; 
            break;
        }
        
        display.getComponent().innerHTML = "";
        display.getComponent().appendChild( _import.cloneNode ( true ) );
    }
    
    /**
    *create URL Import View Template
    *<label> Text <input /> </label> 
    *@access private
    *@return <Html Object> label
    */
    function getUrlImport(){
        var label = document.createElement("label");
            label.appendChild( document.createTextNode("URL zur XML Datei:") );
            
        input = document.createElement("input");
        input.type = "text";
        input.style.width = "280px";
        
        label.appendChild ( input );
        return label;
    }
    
    /**
    *create File Import View Template
    *<label> Text <input /> </label> 
    *@access private
    *@return <Html Object> label
    */
    function getFileImport(){       
        var fragment = document.createDocumentFragment();
    
        var label = document.createElement("label");
            label.appendChild( document.createTextNode("Datei auswählen:") );
            
        var iframe = document.createElement("iframe");
            iframe.src = "index.php?command=import";
            iframe.style.display = "none";
            
        input = document.createElement("input");
        input.type = "file";
        input.name = "importFile";
        input.style.width = "280px";
        
        label.appendChild ( input );
        
        fragment.appendChild( label  );
        fragment.appendChild( iframe );     
        
        return fragment;
    }
    
    function createButton(){
        var btn = new BitButton("importieren");
            btn.setBackground("#FFF");
            btn.addAction ( "click", initImport); 
            
        return btn;
    }
    
    function initImport( evt ){
        var e = evt || window.event;
        Element.stopEvent( e );
        
        switch ( importFrom ) {
            case 'url':
                value = urlImport.getElementsByTagName("input")[0].value;
                
                var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
                    ae.setMessage("loadtpl");
                    ae.addParam(value)
                    
                ctrl.handleEvent(ae);
        
                if ( onFinish ) 
                    onFinish();
            break;
            case 'file':
            
                var input = display.getComponent().getElementsByTagName("input")[0];
                var frame = display.getComponent().getElementsByTagName("iframe")[0];
                var form  = frame.contentDocument.getElementsByTagName("form")[0]; 

                Element.addEvent ( frame, "load", fileImportFinished);
            
                var newInput = document.createElement("input");
                    newInput.type = "file";
                    newInput.name = "importFile";

                input.parentNode.insertBefore( newInput, input); 
                    
                form.appendChild( input );
                form.submit();
            break;
        }
    }
    
    function fileImportFinished(){
        var frame      = display.getComponent().getElementsByTagName("iframe")[0];
        var statusNode = frame.contentDocument.getElementById('bitedit_upload_import_status');
        
        // trimmen
        var status = statusNode.innerHTML.replace(/^\s*(.*)/ ,"$1").replace(/(.*)\s*$/ ,"$1");
            status = status.split("#");
        
        switch ( parseInt( status[0], 10) ) {
            case 1: // alles gut gelaufen
                var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
                    ae.setMessage("loadtpl");
                    ae.addParam( Element.trim( status[1] ) );
                    
                ctrl.handleEvent(ae);
                
                //statusNode.innerHTML ="";
            break;
            case 2:
            break;
            case 3:
            break;
        }
    }
    
    this.onReady = function( callback ) {
        onFinish = callback;
    }
    
    this.init = function (){
        if( !panel )
            createPanel();
            
        return panel;
    }
}

function ExportView( ctrl ){
    
    var onFinish = null;
    
    var ctrl  = ctrl;
    
    var name  = null;
    
    var type = "xml";
    
    var download = false;
    
    var name = "bitedit";
    
    var fields_set = {};
    
    var exportPanel = null;
    
    var export_frame = null;
                
    var fields = [
        {Dateiname:
            "label:Name;name:filename;type:text;value:bitedit",
        Dateityp:[
            "label:XML Datei;name:file;type:radio;value:xml",
            "label:HTML Datei;name:file;type:radio;value:html"
        ],
        Dateiaction:
            "label:Download;name:download;type:checkbox;value:false"
        }
    ];

    function createPanel(){
        exportPanel = new BitPanel();
        exportPanel.setLayout( new BorderLayout(1,1) );
        exportPanel.add ( createExportDisplay(), "center" );
        exportPanel.add ( createExportButton() , "south"  );
    }
           
    function createField( name, className ){
    
        var pattern = /([^:]+):([^;]+);?/g;
        
        var fieldValues = {};
    
        while ( match  = pattern.exec( name ) ) {
            fieldValues[match[1]] = match[2];
        }
        
        var label = document.createElement("label");
            label.className = "clearfix "+className;
            
        var span  = document.createElement("span");
            span.appendChild( document.createTextNode( fieldValues.label+":") );
        
        var input = document.createElement("input");
            input.type  = fieldValues.type;
            input.name  = fieldValues.name;
            input.value = fieldValues.value;
            input.className = fieldValues.type;
        
        fields_set[fieldValues.label] = input;
                    
        label.appendChild ( span );
        label.appendChild ( input );
        
        return label;
    }
    
    function createFieldSet( fields ){
        var createdFields = [];
        
        for( var key in fields ) {
            var legend   = document.createElement("legend");
                legend.appendChild( document.createTextNode( key ) );
            
            var fieldset = document.createElement("fieldset");
                fieldset.appendChild ( legend );
            
            if ( fields[key].constructor == Array ) {
                
                var cn = "";
                
                switch ( fields[key].length ) {
                    case 2: cn="half";    break;
                    case 3: cn="third";   break;
                    case 4: cn="quarter"; break;
                }
                
                for(var i = 0; i < fields[key].length; i++) {
                    fieldset.appendChild( createField( fields[key][i], cn ) );
                }
                
            } else {
                fieldset.appendChild( createField( fields[key], "" ) );
            }
            
            createdFields.push ( fieldset );
        }
        
        return createdFields;
    }
    
    function createExportDisplay(){
    
        var panel = new BitPanel();
            panel.setClassName("export_view");
        
        var form = document.createElement("form");
        
        for(var i = 0; i < fields.length ; i++ ) {
        
            if ( fields[i].constructor == Object ) {
            
                var groups = createFieldSet ( fields[i] );

                for(var i = 0; i < groups.length;i++) {
                    form.appendChild ( groups[i] );
                }
                
            } else {
                form.appendChild ( createField( fields[i] ) );
            }
            
        }
        
        panel.setContent( form );
        return panel;
    }
    
    function createDownloadWindow(  ){
        if( !export_frame ) {
            export_frame = document.createElement("iframe");
            export_frame.src = "index.php?command=ExportWindow"; 
            export_frame.style.display = "none";
            
            exportPanel.getComponent().appendChild( export_frame);
        } else {
            export_frame.src = "index.php?command=ExportWindow";
        }
        
        Element.addEvent( export_frame, "load", initExport);
    }
    
    function initExport(){
        var template = Template.getInstanz();
    
        var form = export_frame.contentDocument.getElementById("exportform"); 

        var hidden = document.createElement("input");
            hidden.type  = "hidden";
            hidden.name  = "template";
            hidden.value = template.serializeTemplate();
            
        form.appendChild (  hidden.cloneNode(true) );
            
            hidden.name  = "filename";
            hidden.value = fields_set['Name'].value; 

        form.appendChild ( hidden.cloneNode( true ) );            
        form.submit();
        
        Element.unlinkEvent (export_frame, "load" , initExport);
    }
    
    function createExportButton() {
        var btn = new BitButton( "exportieren" );
            btn.setSize( 10, 25);
            btn.setBackground("#FFF");
            btn.addAction('click', function(){
                var template = Template.getInstanz();
                
                // als Datei Download
                if ( fields_set['Download'].checked ) {
                    createDownloadWindow( template );
                } else {     
                // auf den Server speichern
                    new Load.ajaxContent({
                        path:"index.php?command=export",
                        method:"POST",
                        params:{
                            template:template.serializeTemplate()
                        }
                    }).initLoad(null,function (response){
                    });
                }
            });
            
        return btn;
    }
    
    this.onReady = function( callback ) {
        onFinish = callback;
    }
    
    this.init = function(){
        if (!exportPanel){
            createPanel();
        }        
        return exportPanel;
    }
}
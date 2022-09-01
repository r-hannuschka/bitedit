<?php
interface ExportObserver {
    public function documentReady( BitEdit_Export_Document $doc );
}

class BitEdit_Export_XMLDocument extends HttpResponse implements ExportObserver{

    public function __construct(){        
        header("Content-Type:text/xml; charset=utf-8");
    }
        
    public function documentReady( BitEdit_Export_Document $doc ){
        $this->setView(Config::getValue("viewPath")."XMLPage.php");             
        $this->setVar("head","<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        $this->setVar("content", $doc->prepare() );
    }
    
}
?>
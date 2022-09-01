<?php
interface ExportObserver {
    public function documentReady( BitEdit_Export_Document $doc );
}

class BitEdit_View_Export_XMLView implements ExportObserver{
    
    public function getView(){
        return 
    }
    
    public function getDocumentHeader(){
    }
    
    public function getServerHeader(){
    }
    
    public function documentReady( BitEdit_Export_Document $doc ){
        echo $doc->prepare();
    }
    
}
?>
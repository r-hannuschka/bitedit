<?php
class BitEdit_Export_XMLFile extends BitEdit_Export_XMLDocument {

    private $save = null;

    public function __construct( $save = false ){
        $this->save = $save;
    
        if( !$this->save ) {
            parent::__construct();
            header('Content-Disposition:attachment; filename="xyz.xml"');
        } 
    }
    
    private function saveFileToDisk( $template ){
        $exportPath  = Config::getValue("exportPath");
        $exportPath .= time().".xml";

        $stream = fopen($exportPath, "w+");
        fwrite($stream, $template);
        fclose($stream);
        
        echo "Datei erfolgreich gespeichert";
    }
    
    public function renderView() {
    
        if( $this->getView() ) {
            ob_start();
            require_once ( $this->getView() );
            $template = ob_get_contents();
            ob_end_clean();
        }

        if ( $this->save ) {
            $this->saveFileToDisk( $template );
        } else 
            print $template;
        
    }
    
}
?>
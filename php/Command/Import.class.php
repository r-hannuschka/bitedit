<?php
class BitEdit_Command_Import implements BitEdit_Command_Base {
    
    private $folder = null;
    private $response = null;
    
    public function __construct(){
        $this->view    = Config::getValue("viewPath")."uploadPage.php";
        $this->folder  = Config::getValue("uploadPath");        
    }
    
    private function uploadFile($file) {
    
        if ( is_uploaded_file($file['tmp_name'] ) ) {
        
            if ( $file['type'] == "text/xml" ) {
            
                if ( move_uploaded_file($file['tmp_name'], $this->folder.$file['name']) ) {
                    $this->response->setVar( 'statusCode', '1');
                    $this->response->setVar( 'filePath', Config::getValue("xmlImportPath").$file['name']);
                } else {
                    $this->response->setVar( 'statusCode', '2');                
                }                
 
            } else {
                $this->response->setVar('statusCode','3');                
            }
            
        } else {
            $this->response->setVar('statusCode','4');                
        }
        
        $this->response->renderView();
    }
    
    /**
    *init von der Command 
    *wird von FrontController aus aufgerufen
    */
    public function run(Request $req, Response $res){
        
        $this->response = $res;
        $this->response->setView( $this->view );
            
        $this->response->setVar( "formAddress", Config::getValue("webPath")."?command=import");
    
        if ( isset($_POST['import_file']) && $_POST['import_file'] == true ){
            $this->uploadFile($_FILES['importFile']);
        } else {
            $this->response->setVar("statusCode", 0);
            $this->response->renderView();
        }
        
    }
}
?>
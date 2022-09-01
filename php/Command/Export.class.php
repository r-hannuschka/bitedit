<?php
class BitEdit_Command_Export implements BitEdit_Command_Base {
 
    private $level = 0;
    private $model = null;
    private $view  = null;
 
    public function __construct(){
        $this->model = new BitEdit_Model_Export();
    }
    
    public function run(Request $req, Response $res){
    
        $header = apache_request_headers();  
        
        if( $header['X-Requested-With'] && $header['X-Requested-With'] == "xmlhttprequest" ){
            $this->view = new BitEdit_Export_XMLFile( true );        
        } else {
            $this->view = new BitEdit_Export_XMLFile( false );
        }

        if( isset($_POST) && !empty($_POST['template']) ) {
            $template = utf8_encode( stripslashes($_POST['template']) );
        }
        
        $this->model->addObserver( $this->view );    
        $this->model->setDocument( $template ); 
        $this->model->createDocument( new BitEdit_Export_Fragment() );    
        $this->view->renderView();  
    }
}
?>
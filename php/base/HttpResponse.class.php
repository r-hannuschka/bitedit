<?php
require_once("Response.interface.php");

class HttpResponse implements Response {
    
    private $view = null;
    
    public $vars = array();
    
    public function __construct(){}
    
    public function setView( $view ){
        $this->view = $view;
    }
    
    public function setVar ( $name, $value) {
        $this->vars[$name] = $value;
    }
    
    public function getView(){
        return $this->view;
    }
    
    public function renderView(){
        if( $this->view ) {
            ob_start();
            require_once ( $this->view );
            $template = ob_get_contents();
            ob_end_clean();
            
            print $template;
        }        
    }
}
?>
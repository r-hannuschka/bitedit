<?php
require_once('Request.interface.php'); 

class HttpRequest implements Request {
    
    public function __construct(){
    }
    
    public function issetParam($name){
        if( isset($_GET[$name] ) )
            return true;
        else 
            return false;
    }
    
    public function getParam($name){
        return $_GET[$name];
    }
    
    public function isAjaxRequest() {
        return false;
    }
} 
?>
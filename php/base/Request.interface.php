<?php
interface Request {

    public function issetParam($name);
    
    public function getParam($name);
    
    public function isAjaxRequest();
    
}
?>
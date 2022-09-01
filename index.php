<?php
    require_once('php/Front.class.php');
    require_once('php/base/Config.class.php');
    require_once('php/base/HttpResponse.class.php');
    require_once('php/base/HttpRequest.class.php');
    
    $fc = BitEdit_Front::getInstanz();
    $fc->run ( new HttpRequest(), new HttpResponse() );
?>
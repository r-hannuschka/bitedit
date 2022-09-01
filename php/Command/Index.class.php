<?php
class BitEdit_Command_Index implements BitEdit_Command_Base {
    
    private $view  = null;
    
    private $model = null;
    
    public function __construct(){
        $this->view  = Config::getValue("viewPath")."index.php";
    }
        
    public function run(Request $req, Response $res) {
        // bastelt index view zusammen 
        // holt sich daten vom Model
        $res->setView( $this->view );
        $res->renderView();
    }
}
?>
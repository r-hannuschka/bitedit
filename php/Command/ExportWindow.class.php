<?
class BitEdit_Command_ExportWindow implements BitEdit_Command_Base {    

    private $view;

    public function run(Request $req, Response $res){
        $this->view = $res;
        $this->view->setView(Config::getValue("viewPath")."exportwindow.php");
        $this->view->setVar('formpath', Config::getValue("webPath")."?command=export" );
        $this->view->renderView();  
    }
}
?>
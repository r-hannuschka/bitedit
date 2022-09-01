<?php
require_once ('Command/Base.interface.php'); 

class BitEdit_Front implements BitEdit_Command_Base {

    private static $instanz = null;

    private $response = null;
    
    private $request  = null;
    
    private function __construct(){
        spl_autoload_register( array($this,'loadController') );
    }
    
    private function loadController( $class ) {
    
        $cn = preg_replace('/BitEdit_/','',ucfirst($class) );
        $cn = preg_replace('/_/','/',$cn);
        
        if (file_exists ( 'php/'.$cn.'.class.php') ) { 
            require_once('php/'.$cn.'.class.php'); 
            
            if ( !class_exists( $class, false ) ){
                throw new Exception(" $class not found");
            }   
            
        } else {
            throw new Exception("file $class.class.php not found");
        }
    }
    
    public function run(Request $req, Response $res){
        // POST und GET Parameter abfragen
        $this->response = $res;
        $this->request  = $req;
        
        $command = null;
        
        if ( $req->issetParam('command') ) {
            $name = 'BitEdit_Command_'.$req->getParam('command');
            
            try {
                $command = new $name();
            } catch (Exception $e){
                print( $e->getMessage()."<br />");
                $command = new BitEdit_Command_Index();
            }
            
        } else {
            $command = new BitEdit_Command_Index();
        }        
        
        $command->run($req, $res);
    }
    
    public static function getInstanz(){
        if( !self::$instanz ){
            self::$instanz = new self();
        }        
        return self::$instanz;
    }
}
?>
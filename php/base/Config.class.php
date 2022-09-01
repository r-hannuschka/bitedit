<?php
/**
 * Description of Config
 *
 * @author CommanderCool
 */
class Config {
    private $config = array();

    private static $instanz = null;

    private function __construct(){

        $this->config['rPath']         = preg_replace("/\/(.*?)([^\/]+)$/", "$1", $_SERVER['PHP_SELF']);
        $this->config['fileRoot']      = $_SERVER['DOCUMENT_ROOT']."/".$this->config['rPath'];
        $this->config['uploadPath']    = $this->config['fileRoot']."files/temp/";
        $this->config['exportPath']    = $this->config['fileRoot']."files/export/";
        $this->config['viewPath']      = $this->config['fileRoot']."php/View/";
        $this->config['xmlImportPath'] = "http://".$_SERVER['SERVER_NAME']."/".$this->config['rPath']."files/temp/";
        $this->config['webPath']       = "http://".$_SERVER['SERVER_NAME']."/".$this->config['rPath']."index.php";
        
    }
    
    public static function getValue( $name ) {
        if ( !self::$instanz )
            self::$instanz = new Config();

        if ( isset(self::$instanz->config[$name]) ) {
            return self::$instanz->config[$name];
        } else {
            return "undefined";
        }
    }
}
?>

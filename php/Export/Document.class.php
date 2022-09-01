<?php
abstract class BitEdit_Export_Document {

    protected $node = null;
    
    protected $subNodes = array();
    
    private $attrib = array();
    
    private $level  = null;
    
    public function createNode($nodeName){
    }
    
    public function setAttribute($attrName, $attrValue){
        $this->attrib[$attrName] = $attrValue;
    }      

    public function addNode($node){
        array_push($this->subNodes, $node);
    }   
    
    public function getAttribute(){
        return $this->attrib;
    }
    
    public function setLevel( $level ){
        $this->level = $level;
    }
    
    public function getLevel(){
        return $this->level;
    }
        
    public function setStyle( $styleArray ){}

    abstract public function prepare();
}
?>
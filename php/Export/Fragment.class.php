<?php
class BitEdit_Export_Fragment extends BitEdit_Export_Document {

    private $level    = 0;

    private $cssAttrib = array();
    
    public function __construct( $name = null ){
        $this->node = $name;
    }
    
    public function setNode( $name ) {
        $this->node = $name;
    }   
    
    public function setCSSAttribute($name, $value){
        $this->cssAttrib[$name] = $value;
    }
 
    public function prepare(){
    
        $attr = $this->getAttribute();
        
        $return  = str_repeat("\t", $this->getLevel() );
        $return .= '<'.$this->node;
        
        if( count($this->cssAttrib) > 0) {
            $return .= ' style="';
            
            foreach($this->cssAttrib as $name => $value ) {
                $return .= $name.':'.$value.';';
            }
            
            $return .= '"';
        }
        
        foreach ( $this->getAttribute() as $key=>$value) {
            $return .= " $key='$value'"; 
        }
        
        $return .= ">\n";
        
        if ( count($this->subNodes) > 0 ) {
            for($i = 0; $i < count($this->subNodes); $i++) { 
                $return .= $this->subNodes[$i]->prepare();
            }
        }        
        
        $return .= str_repeat("\t", $this->getLevel() );
        return $return."</$this->node>\n";
    }
}
?>
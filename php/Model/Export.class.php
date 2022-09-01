<?php
class BitEdit_Model_Export{
    
    private $observer = array();
    
    private $document = null;
    
    private $level = 0;
      
    private function loadDocument($template,BitEdit_Export_Document $node){
        
        $node->setLevel( $this->level );
        
        foreach ($template as $key=>$value){
        
            if ( is_array ($template[$key]) ){
            
                $this->level++;
                
                $subNode = new BitEdit_Export_Fragment( $key );
                $node->addNode( $subNode );  
                
                if ( strtolower($key)  == "contains" ) {
                    
                    foreach ( $value as $cKey=>$cValue) {
                        $this->loadDocument( $cValue, $subNode );
                    }
                    
                } else if ( strtolower($key) == "content" ){
                                   
                    for($i = 0; $i < count($value); $i++) {
                        
                        switch ( strtolower ( $value[$i]['type'] ) ) {
                            case 'image':
                                $this->loadDocument($value[$i], $subNode);
                            break;
                            case 'htmlnode':
                            break;
                        }
                        
                    }
                                   
                    /*
                    foreach ($value as $cKey=>$cValue) {
                    
                        if ( key($cValue) == "img" ){
                            
                            $this->createXMLTemplate($cValue, $subNode);
                            
                        } else {                        
                            switch ( $cValue['type'] ) {
                                case 'htmlNode':
                                    $htmlNode = new HTMLNode( $cValue['node'] );
                                    $htmlNode->setContent( $cValue['html'] );
                                    $htmlNode->setLevel($this->level);
                                    
                                    $subNode->addNode( $htmlNode );
                                    $subNode->setLevel( $this->level );
                                break;
                            }
                        }
                    }
                    */
                } else {
                    $this->loadDocument( $value, $subNode );
                }
                    
                $this->level--;
                
            } else {     
                $node->setAttribute($key, $value);   
            }
        }
    }
        
    public function addObserver( ExportObserver $obs ){
        array_push($this->observer, $obs);
    }
    
    public function setDocument( $doc ){
        $this->document = json_decode($doc, true);
    }
    
    public function createDocument( BitEdit_Export_Document $doc) {
    
        $doc->setNode( key ( $this->document) );
        $this->loadDocument( current( $this->document ) , $doc );
                                
        for($i = 0; $i < count($this->observer); $i++) 
            $this->observer[$i]->documentReady( $doc );
    }
}

?>
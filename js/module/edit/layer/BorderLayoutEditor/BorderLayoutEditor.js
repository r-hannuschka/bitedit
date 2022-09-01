function BorderLayoutEditor( node ){

    AbstractLayoutEditor.call( this, node );

    var _self = this;

    var _panels = parseBorderLayout();
    
    var _layer = ["north","south","west","east","center"];

    /**
    * die alten Componenten clonen da sonst eine
    * Referenz auf components gebildet wird
    * und somit alle Änderungen die in _panels
    * gemacht werden auch in _oldPanels greifen
    */
    var   _oldPanels = _panels.slice(0, 5);

    this.setLayerStatus = function ( direction , status ) {
        for(var i = 0 ; i < _layer.length; i++ ) {
            if( _layer[i] == direction ){
                _panels[i] = status;
                break;
            }
        }
    }
    
    /**
     * liest das aktuelle Borderlayout
     * direction wird mit 1 belegt wenn Container gesetzt ist
     * direction = [
     *  0 => nord
     *  1 => süd
     *  2 => west
     *  3 => osten
     *  4 => zentrum
     * ]
     * @access private
     * @return <Array> direction
     */
    function parseBorderLayout(){
        var direction = [0 , 0 , 0 , 0 , 0];

        if( _self._layer) {
            var childs = _self.getLayerChilds();
            var len    = childs.length;

            for(var i = 0 ; i < len ; i ++) {
                var childLayer = Tree.getInstanz().getNode( childs[i] );

                if( !childLayer.isLeaf() ) {
                    switch ( childLayer.getDirection().toLowerCase()  ) {
                        case 'north' :
                            direction[0] = 1;
                            break;
                        case 'south' :
                            direction[1] = 1;
                            break;
                        case 'west'  :
                            direction[2] = 1;
                            break;
                        case 'east'  :
                            direction[3] = 1;
                            break;
                        case 'center':
                            direction[4] = 1;
                            break;
                    }

                }
                
            }
        }

        return direction;
    };

    /**
    * das Template modifizieren
    */
    function modifyTemplate (){
        _self.removeLeafs();

        for( var i = 0 ; i < 5 ; i++ ) {
            // es hat sich was geändert
            if( _panels[i] != _oldPanels[i] ) {
    
                if(_panels[i] == 1 ) { // Ebene hinzufügen
                
                    var panel = new BitPanel();
                        panel.setSize(150,150);
                        panel.setBackground("#999");

                    if(_layer[i] != 'center' )
                        panel.setBackground("#cda207");
                    
                    _self.add( new LayerNode(panel) , _layer[i] );
                    					
                } else { // Ebene entfernen
                    var childs = _self.getLayerChilds();
                    
                    for(var j = 0 ; j < childs.length; j++ ) {
                    
                        var child = Tree.getInstanz().getNode( childs[j] );
                    
                        if ( child.getDirection().toLowerCase() == _layer[i]) {
                            _self.remove( child );
                            break;
                        }
                    }
                    
                }
            }
        }

        /* panels kopieren und in oldpanels speichern
         * damit Änderungen beim nächsten Update beeinflusst
         * werden
         */
        _oldPanels = _panels.slice(0,5);
        
        var obs = _self.getObserver();
        for(var i = 0 ; i < obs.length;i++) {
            obs[i].templateChanged( new Modification_Proxy( _self.getModificator() ) );
        }
        
    };

    this.setChanges = function () {
        modifyTemplate();
    };

    this.getPanels = function () {
        return _panels;
    };

    this.getName = function(){
        return "borderlayout";
    };
};
function GridLayoutEditor(layer){
    AbstractLayoutEditor.call( this, layer );

    var _self      = this;

    var _oldPanels = [];

    var _cols = 0;

    var _rows = 0;
	
    var layerChilds = [];

    var _panels = parseGridLayout();

    function modifyTemplate(){
        /**
         * Eventuelle Kinder löschen 
         * wenn zuviele Layer in dem Grid liegen , dies kann passieren 
         * wenn zuerst 2 X 3 Flächen existierten und diese voll sind und nun 
         * zurück gesetzt wurde auf 2 x 2 , somit sind 2 Flächen überschüssig 
         * und können gelöscht werden
         */
        var length = layerChilds.length;
        
        var mod = _self.getModificator();
            mod.setCols( _cols );
            mod.setRows( _rows );

        var i = 0;

        if( length > _cols * _rows ) {
            for(i = length-1 ; i >= _cols * _rows; i--) {
               _self.remove(layerChilds[i]);
            }
        }

        // Blatt Knoten noch entfernen 
        _self.removeLeafs();
        
        for(i = _oldPanels.length-1 ; i > -1 ; i--) {
            if(_oldPanels[i] !== _panels[i] ) {
            
                // Fläche gelöscht
                if( _panels[i] === 0 ) {
                    _self.remove( layerChilds[i] );
                } else {
                // Fläche hinzufgefügt
                    var panel = new BitPanel();
                    panel.setBackground("#aaa");
				
                    _self.add( new LayerNode(panel) );
                    
                }
            }
        }

        _oldPanels = _panels.slice(0, _panels.length );
		
        var obs = _self.getObserver();
        for(i = 0 ; i < obs.length; i++) {
            obs[i].templateChanged( new Modification_Proxy( _self.getModificator() ) );
        }
    };

    function parseGridLayout(){
        var grid = [];

        var layoutManager = _self._layer.getLayer().getLayoutManager();

        _cols = layoutManager.getCols();
        _rows = layoutManager.getRows();

        /**
         * die Kinder klonen damit das original Array nicht modifiziert wird
         */
        layerChilds   = _self.parseChilds().getLayerChilds();
        
        var numChilds = layerChilds.length;
        
        var count = ( _cols || 1) * ( _rows || 1);

        for(var i = 0 ; i < count; i++ ) {        
            
            if(i < numChilds ){
                grid.push(1);
                continue;
            }

            grid.push(0);
        }

        _oldPanels = grid.slice(0, count);

        return grid;
    };

    function updatePanels(){
        if( (_cols * _rows) != _panels.length ) {
            var diff = (_cols*_rows) - _panels.length;
            
            if( diff < 0 ) {
                var len = _panels.length;
                _panels.splice( len - 1 + diff, Math.abs( diff ) );
                _oldPanels.splice( len - 1 + diff, Math.abs( diff ) );
            } else {
                for(var i = 0 ; i < diff; i++) {
                    _panels.push(0);
                    _oldPanels.push(0);
                }
            }
            
        }
    };

    this.addLayer = function(){
        for(var i = 0 ; i < _panels.length; i++ ) {
            if(_panels[i] === 0) {
                _panels[i] = 1;
                break;
            }
        }
    };

    this.removeLayer = function(){
        for(var i = _panels.length-1; i >= 0; i-- ) {
            if(_panels[i] === 1) {
                _panels[i] = 0;
                break;
            }
        }
    };

    this.setChanges = function () {
        modifyTemplate();
    };

    this.getPanels = function () {
        return _panels;
    };

    this.setRows = function( rows ){
        _rows = rows;
        updatePanels();
    };

    this.setCols = function( cols ){
        _cols = cols;
        updatePanels();
    }

    this.getRows = function(){
        return _rows;
    };

    this.getCols = function(){
        return _cols;
    };

    this.getName = function(){
        return "gridlayout";
    }
    
};
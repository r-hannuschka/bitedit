function DragDropController(){
    
    var _dd      = new DragDrop();
    var _pctrl   = null;
    
    var drop_container = [];
    
    var container = [];
    
    function initDragDrop(type,container){    
    
        if(type == 'file') {
            for(var i = 0;i < container.length;i++) {
                container[i].id = Element.generateId(5);
                _dd.addContainer(
                    new Container(container[i],{
                        drop:false,
                        clone:true,
                        dragable:['img']
                        })
                    );
            }
            
        } else {
            // Template Container entfernen im Model dann
            var arg = [];
            
            for(var i = 0; i < drop_container.length;i++) {
                arg.push(drop_container[i].id);
            }
                
            _dd.getContainers.apply(_dd,arg).remove();
            
            for(var i = 0;i < container.length;i++) {
                container[i].id = Element.generateId(5);
                _dd.addContainer(
                    new Container(container[i],{
                        drop:true,
                        clone:false,
                        dragable:['img']
                        })
                    );
            }
            drop_container = container.slice(1,container.length);
        }
            
        _dd.callOnDrop(function(){
            // neuen Event anlegen 
            // Bild in den Container abspeichern
            // und Bild ersetzen geht zum Template
            
            var start_con = this.start_con.getContainer();
            
            var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
            ae.setMessage("add_image");
                
            ae.addParam( this.dropped_element );
            ae.addParam( this.drop_container );
            ae.addParam( start_con );

            _pctrl.handleEvent(ae);
        });
    };
    
    function updateContainer(container){
        _dd.getContainers(container).update();
    };
    
    function deleteContainer(){
        
        var _dummyArray = [];

        for(var i = 0 ; i < drop_container.length; i++) {
            var id = drop_container[i].id;

            if( !document.getElementById(id) )
                _dd.removeContainer(id);
            else
                _dummyArray.push( drop_container[i] );
        }

        drop_container = _dummyArray;
        _dummyArray = [];
    };

    this.setParent = function(ctrl) {
        _pctrl = ctrl;
    };
    
    this.handleEvent = function(ae){
        switch ( ae.getMessage() ){
            case 'update':
                updateContainer(ae.getParam()[0]);
                break;
            case 'init':
                initDragDrop(ae.getParam()[0], ae.getParam()[1]);
                break;
            case 'refresh':
                deleteContainer();
                
                if(ae.getParam()[0]) {
                    drop_container.push( ae.getParam()[0] );
                    _dd.addContainer(
                        new Container(ae.getParam()[0],{
                            drop:true,
                            clone:false,
                            dragable:['img']
                            })
                        );
                }
                break;
            case 'refreshContainer':
			
                var root_container = ae.getParam()[0];
                var dd_container   = ae.getParam()[1];

                for(var i = 0 ; i < dd_container.length; i++) {
					
                    var dc = dd_container[i];
					
                    if(dc.id)
                        _dd.removeContainer(dc.id);
                    else {
                        dc.id = Element.generateId(5);
                    }
					
                    _dd.removeContainer( root_container.id );

                    _dd.addContainer(
                        new Container(dc.id, {
                            drop:true,
                            clone:false,
                            dragable:['img']
                        } )
                        );
                }
                break;
        }
    };
    
    this.init = function () {
    };
};
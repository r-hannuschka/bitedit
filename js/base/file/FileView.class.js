/**{
* läd Datein und stellt sie zur Verfügung
*/
function FileView(ctrl,model){   

    var _ctrl  = ctrl;
    var _model = model;
    
    _model.addObserver(this);
    
    var panel = new BitTabbedPanel();
    
    var tpl_panel = new BitScrollPanel();
    var tpl_inner = new BitPanel();
    var tpl_files_loaded = false;
    
    var img_panel = new BitScrollPanel();
    var img_inner = new BitPanel();
    var img_files_loaded = false;
    
    this.displayTemplates = function(l) {
        var rows  = Math.floor(l.length/2);

        tpl_inner.setSize(242,120*rows);
        tpl_inner.setLayout( new GridLayout(2,rows,1,1) );
        
        for(var i = 0 ; i < l.length;i++) {
            var b = new BitButton();
                b.setBackground("url("+l[i]+")");
                (function(){
                    
                    var tpl = model.getTemplate( l[i] );  
                    
                    b.addAction('click',function(){
                        var ae = new ActionEvent(ActionEvent.TEMPLATE_EVENT);
                            ae.setMessage("loadtpl");
                            ae.addParam(tpl)
                            
                        _ctrl.handleEvent(ae);
                    });
                    
                })();
                
            tpl_inner.add( b );
        }
        
        tpl_inner.setVisible(true);
        tpl_files_loaded = true;
    };
    
    this.displayImages = function(imageArray) {
    
        if(!img_files_loaded) {
            var imageCount = imageArray.length;

            var h = 0;
                  
            for(var i = 0;i < imageCount;i++) {
                Element.bind(imageArray[i],img_inner.getComponent());
                h+= imageArray[i].height;
                
                if(i < imageCount-1) {
                    h += 5;
                    imageArray[i].style.margin = '0 0 5px';
                }
            }
            
            img_inner.setSize(250,h);
            
            img_panel.setVisible(true);
            img_files_loaded = true;
        }
    };
        
    function createTemplateTab(){ 
        tpl_inner = new BitPanel(); 
        tpl_panel.add(tpl_inner);
        return tpl_panel;
    };
    
    function createImageTab(){
        img_panel.add(img_inner);
        return img_panel;
    };
        
    this.getPanel = function(){
        panel.addTab( 'Vorlagen', createTemplateTab() );
        panel.addTab( 'Bilder'  , createImageTab() );
        
        panel.tabObserver(function() {
            var ae = new ActionEvent(ActionEvent.FILE_EVENT);
            
            if(this.tab.toLowerCase() == 'vorlagen' && !tpl_files_loaded) {
                ae.setMessage('loadXML');
                ctrl.handleEvent(ae);
            }
            
            if(this.tab.toLowerCase() ==  'bilder' &&  !img_files_loaded) {
                ae.setMessage('loadImg');
                ctrl.handleEvent(ae);
            }
        });
        return panel;
    };
    
    this.getImagePanel = function () {
        return img_inner;
    };
};
/**
* läd Datein und stellt sie zur Verfügung
*/
function File(){   

    BaseModel.call(this);
    
    var self = this;

    var templateImgPath = 'img/layouts/';
    var imgThumbPath    = 'files/bilder/thumbs/';
    var imgPath         = 'files/bilder/';
        
    var layouts = [templateImgPath+'layout13.jpg',
                   templateImgPath+'layout1.jpg',
                   templateImgPath+'layout2.jpg',
                   templateImgPath+'layout3.jpg',
                   templateImgPath+'layout4.jpg',
                   templateImgPath+'layout5.jpg',
                   templateImgPath+'layout6.jpg',
                   templateImgPath+'layout7.jpg',
                   templateImgPath+'layout8.jpg',
                   templateImgPath+'layout9.jpg',
                   templateImgPath+'layout10.jpg',
                   templateImgPath+'layout11.jpg',
                   templateImgPath+'layout12.jpg'
                   ];
                   
    var images = [
        imgThumbPath+'banner_thumb.jpg',
        imgThumbPath+'bild1_thumb.jpg',
        imgThumbPath+'bild2_thumb.jpg',
        // imgThumbPath+'bild_3_thumb.jpg',
        imgThumbPath+'bild3_thumb.jpg',
        imgThumbPath+'bild4_thumb.jpg',
        imgThumbPath+'bild5_thumb.jpg'
    ];
    
    this.loadTemplateFiles = function(){
    
        var _obs = this.getObserver();
        for(var i = 0 ; i < _obs.length;i++)
            _obs[i].displayTemplates(layouts);
            
    };
    
    this.getImageFiles = function () {
        return images;
    };
    
    this.getTemplate = function( path ){
        return path.replace(/(.*?)([^\/]+)(\.\w{3,4})$/,"files/templates/$2.xml");
    };
};
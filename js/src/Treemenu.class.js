/**
* Baum Struktur durch Level Array 
* 0 = space 1 gleich Linie dann kommt das eigentliche Bild wie Folder oder + / - oder File
* folder
* 0 zweig 
* 0 1 file 1 
* 0 1 file 2
* 0 1 plus gif folder
* 0 1  1  file 2.1
* 0 1  1  file 2.2 
*/
function TreeMenu (tR) {
				
	var thisObj  = this;
    var treeRoot = tR;
	var main_id  = null;
    
    var level_array = [];
        
    /**
            * Biilder für das Baum Menu
            */
	var space     = 'img/tree_img/space.gif';
	var plus      = 'img/tree_img/plus.gif';
	var plus_end  = 'img/tree_img/plus_end.gif';
	var minus     = 'img/tree_img/minus.gif';
	var minus_end = 'img/tree_img/minus_end.gif';
	var linie     = 'img/tree_img/linie.gif';
	var zweig     = 'img/tree_img/zweig.gif';
    var zweig_end = 'img/tree_img/zweig_end.gif';
	
	var closed_dir = 'img/tree_img/closed.gif'; 
	var opened_dir = 'img/tree_img/open.gif'; 
	var file       = 'img/tree_img/file.gif'
    
    var callbackFile   = null;
    var callbackFolder = null;
    
    var level    = 0;

    //Zeilenumbrüche entfernen die nicht erwünscht sind
    Element.stripBreaks(treeRoot);
    
    Element.attrib(treeRoot,"style",{
        padding:"0px",
        margin:"0px",
        listStyleType:"none",
        visiblity:"hidden"
    });
    
    createTree();
    treeRoot.style.visiblity = "visible";
    
    function toggleFolder(){
        if(!this.open) {
            this.folder_node.style.display  = "inline";
            this.folder_img.src             = opened_dir;
            
            if(!this.last_node)
                this.open_img.src = minus;
            else 
                this.open_img.src = minus_end;
        } else {
            this.folder_node.style.display  = "none";
            this.folder_img.src             = closed_dir;
            
            if(!this.last_node)
                this.open_img.src = plus;
            else 
                this.open_img.src = plus_end;
        }
    };
    
    function createTree(root_obj) {
    
        var root_node      = (root_obj)?root_obj:treeRoot;
        
        // sind alle möglichen LI Tags root_node selber ist eine UL 
        for(var i = 0 ; i < root_node.childNodes.length;i++) {
            
            var child_node  = root_node.childNodes[i];
            var last_node   = (root_node.childNodes[i].nextSibling)?false:true;
            
            var folder_object  = null;
            var folder         = false;
            var folder_opener  = new Array();
            var folder_element = null;
            
            Element.attrib(child_node,"style",{
                display:"inline"
            });
            
            // alle Kindknoten vom aktuellen LI Element durchgehen und prüfen ob eines eine UL ist
            // sollte dem der Fall sein handelt es sich um ein neues Verzeichniss
            for(var j = 0; j < child_node.childNodes.length;j++) {
                    
                if(child_node.childNodes[j].nodeName.toLowerCase() == "ul") {
                    folder = true;
                    folder_element = child_node.childNodes[j];
                    
                    folder_object = new Object();
                    folder_object.last_node     = last_node;
                    folder_object.folder_node   = child_node.childNodes[j];
                    
                    Element.attrib(folder_element,"style",{
                        display:"none",
                        padding:"0px",
                        margin:"0px"
                    });
                   
                    var sub_element = null;
                    
                    // da es sich um ein Verzeichniss handelt werden alle Elemente die vor dem Verzeichniss liegen mit einen 
                    // Event belegt um das Verzeichniss zu öffnen oder zu schließen
                    while( ( sub_element = folder_element.previousSibling ) ) {
                        folder_opener.push(sub_element);
                        folder_element = sub_element;
                    }
                    break;
                }
                
            }
            
            var img1 = Element.create("img");
            var img2 = Element.create("img");
            
            Element.attrib(img1,"style",{verticalAlign:"top",border:"0px"});
            Element.attrib(img2,"style",{verticalAlign:"top",border:"0px"});
            
            if(folder) {
                if(!last_node)   img1.src = plus;
                else             img1.src = plus_end;
                  
                img2.src = closed_dir;
                
                folder_opener.push(img1);
                folder_opener.push(img2);
                
                folder_object.open_img   = img1;
                folder_object.folder_img = img2;
                       
                // die Struktur wird anhand eines Arrays festmacht für jede einzelne Zeilenumbrüche
                // eine 0 bedeutet es ist ein freier Raum eine 1 bedeutet es ist eine Linie
                if(!last_node) level_array.push(1);
                else           level_array.push(0);
                
                level++;
                createTree(child_node.childNodes[j]);
                level--;
                    
                // da wir wieder eine Ebene gesunken sind den letzten Wert aus dem Array entfernen
                level_array.pop();                                
            } else {
                if(!last_node)     img1.src = zweig;
                else               img1.src = zweig_end;
                
                img2.src = file;
                
                addEventFile(child_node.firstChild,img2);
            }
            
            child_node.insertBefore(img2,child_node.firstChild);
            child_node.insertBefore(img1,img2);
            
            for(var k = level_array.length-1; k >= 0 ;k--) {
            
                var img = Element.create('img');
                Element.attrib(img,"style",{verticalAlign:"top",border:"0px"});
                
                if(level_array[k] == 1)      img.src = linie;
                else                         img.src = space;
                
                child_node.insertBefore(img,child_node.firstChild);
            }
            
            // vor jedem ersten kind im LI Element kommt ein br Knoten 
            // ausser vor dem ersten LI Element in der Haupt Liste
            if(level > 0 || level == 0 && child_node.previousSibling) {
                var br = Element.create('br');
                child_node.insertBefore(br,child_node.firstChild);
            }
            
            if(folder_opener.length > 0) {
                addFolderEvents(folder_opener,folder_object);
            }
            
            folder_node   = null;
        }
    };
    
    function addEventFile(file_node,file_img){    
        if(file_node.nodeName.toLowerCase() == "#text") return;
    
        file_node.style.cursor = "pointer";
        file_img.style.cursor  = "pointer";
    
        Element.addEvent(file_node ,"click" , fireEvent);
        Element.addEvent(file_img  ,"click" , fireEvent);
        
        function fireEvent(evt) {        
            var e = evt || window.event;
            Element.stopEvent(e);
            
            if(callbackFile) 
                callbackFile(file_node);
        };
    };
    
    function addFolderEvents(folder_opener,folder_object){
        for(var k = 0; k < folder_opener.length;k++) {
            folder_opener[k].style.cursor = "pointer";
            
            Element.addEvent(folder_opener[k],"click",function(evt) {
                
                var e = evt || windows.event;
                var t = e.target || e.srcElement;
                
                Element.stopEvent(e);                    
                        
                // Selektionen aufheben trat im Opera auf wenn man zu schnell geklickt hat
                if(window.getSelection) 
                    window.getSelection().removeAllRanges();
                
                if (t.nodeName.toLowerCase() !== "span") {
                    folder_object.open = (folder_object.folder_node.style.display == "inline")?true:false;
                    toggleFolder.call( folder_object );
                }
                
                if(callbackFolder)
                    callbackFolder.call({
                        node:folder_object.folder_node,
                        trigger:t
                    });
            });
        }
    };
        
	this.setCallbackFile = function(callBackFunc) {
        callbackFile = callBackFunc;
        
        return this;
	};
    
    this.setCallbackFolder = function(callBackFunc) {
        callbackFolder = callBackFunc;
        
        return this;
    };
};

TreeMenu.timer = null;
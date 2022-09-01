function FlowLayoutEditor( layer ){
    AbstractLayoutEditor.call(this, layer);

    var _self = this;

    this.setChanges = function(){
        _self.removeLeafs();

        var obs = _self.getObserver();
        for(var i = 0 ; i < obs.length; i++) {
            obs[i].templateChanged( new Modification_Proxy( _self.getModificator() ) );
        }
        
    }

    this.getName = function(){
        return "flowlayout";
    };
}
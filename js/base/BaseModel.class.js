function BaseModel() {

    var _aObserver = [];
    
    this.addObserver = function (oObserver) {
        _aObserver.push(oObserver);
    };
    
    this.removeObserver = function(oObserver) {
        _aObserver.deleteValue(oObserver);
    };
    
    this.getObserver = function () {
        return _aObserver;
    };
    
};
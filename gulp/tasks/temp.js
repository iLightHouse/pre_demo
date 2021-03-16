exports.task = function() {
    var list = [];
    var _list = [];
    for(var i=0;i<3;i++){
        _list = [];
        for(var j=0;j<10;j++){
            var d = i*10+j;
            _list.push(d+"_"+i+"_"+j);
        }
        list.push(_list);
    }
    console.log(list);

};
function extend(a,b){
  for(var i in b){
    if(!(i in a)){
      a[i]=b[i];
    }
  }
  return a;
}
function Test(){
  this.op = {
    libelle                 : 'basique'
    ,libelleIndent          : 'TEST->'
    ,testIndent             : '      ->'
    ,enableOutputOnSuccess  : false
  };
  this.compareObject = function(a,b){
    if(typeof(a)=='object' && typeof(b)){
      for(var i in a){
        if(typeof(a[i])=='object'){
          if(typeof(b[i])=='object'){
            if(!this.compareObject(a[i],b[i])){
              return false;
            }
          }else{
            return false;
          }
        }else{
          if(a[i] !== b[i]){
            return false;
          }
        }
      }
      return true;
    }else{
      return a==b;
    }
  };
}
Test.prototype = {
  is:function(a,b,libelle){
    var o = extend(this.op,{libelle:libelle});
    this.display(this.compareObject(a,b),a,b,o);
  }
  ,lt:function(a,b,libelle){
    var o = extend({libelle:libelle},this.op);
    this.display(a<b,a,b,o);
  }
  ,libelle:function(str){
    console.log(this.op.libelleIndent+str);
  }
  ,out:function(str){
    if(this.op.enableOutputOnSuccess){
      console.log(str);
    }
  }
  ,blurIs:function(a,b,libelle){
    var o = extend(this.op, {libelle:libelle});
    this.display(Math.abs(a-b)<0.001,a,b,o);
  }
  ,display : function(valid,a,b,o){
    if(!valid){
      if(typeof(a)=='object' || typeof(b)=='object'){
        console.log(o.testIndent+o.libelle+'  :FAIL'+"\n"+o.testIndent+'got      :');
        console.log(a);
        console.log(o.testIndent+'expected :');
        console.log(b);
      }else{
        var str = o.testIndent+o.libelle+'  :FAIL'+"\n";
        str += o.testIndent+'got      :'+a+"\n"+o.testIndent+'expected :'+b;
        console.log(str);
      }
    }else{
      if(o.enableOutputOnSuccess){
        console.log(o.testIndent+'ok ('+o.libelle+')');
      }
    }
  }
  ,enableOutputOnSuccess:function(op){
    this.op.enableOutputOnSuccess = op;
  }
};
module.exports={
  getNew:function(){
    return new Test();
  }
}

//console.log(t.compareObject(a,b));//true
//console.log(t.compareObject(123,'a'));//false
//console.log(t.compareObject([12],[125]));//false
//console.log(t.compareObject({s:125,v:125},{s:125,v:12}));//false
//console.log(t.compareObject({s:125,v:125},{s:125,v:125}));//true
//console.log(t.compareObject({s:125,v:{a:5}},{s:125,v:{a:7}}));//false
//console.log(t.compareObject({s:125,v:{a:5}},{s:125,v:{a:5}}));//true

#!/home/mpech/install/node/node/out/bin/node
var t=require('./libTest.js').getNew();
var g= require('../lib/grammarParser.js');
var fs=require('fs');
/*
(function basic(){
  var s=fs.readFileSync(__dirname+'/data/basicGrammar.txt').toString();
  var grammar=g.grammarFromString(s);
  var nf = g.NodeFactory();
  var backOptions={left:fs.readFileSync(__dirname+'/data/basicMultiLine.txt').toString(), nodeList:[]};
  g.doPred(grammar, nf, 'sd2a', backOptions);
  var node = nf.applyFunc('master', backOptions.nodeList);
})();
*/
(function sample(){
//  g.configure({dbg:true});
  var s=fs.readFileSync(__dirname+'/data/sampleGrammar.txt').toString();
  var grammar=g.grammarFromString(s);
  var nf = g.NodeFactory();
  
  
  
  var backOptions={left:fs.readFileSync(__dirname+'/data/sampleAdditiveLine.txt').toString(), nodeList:[]};
  g.doPred(grammar, nf, 'expression', backOptions);
  var node = nf.applyFunc('master', backOptions.nodeList);
  t.is(node.toString(),'1+2-6+8;');
  var sum=0;
  node.traverse(function(x){
    if(x.name=='_firstTerm'){
      sum+=parseInt(x,10);
    }
    if(x.name=='additionalTerm'){
      var sign=x.nodeList[1].toString();
      var term=x.nodeList[3].toString();
      var n=parseInt(sign+term,10);
      sum+=n;
    }
  });
  t.is(sum, 5);
})();



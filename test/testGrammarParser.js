#!/home/mpech/install/node/node/out/bin/node
var t=require('./libTest.js').getNew();
var g= require('../lib/grammarParser.js');
var fs=require('fs');


var s=fs.readFileSync(__dirname+'/data/basicGrammar.txt').toString();
var grammar=g.grammarFromString(s);
var nf = g.NodeFactory();
var backOptions={left:fs.readFileSync(__dirname+'/data/basicMultiLine.txt').toString(), nodeList:[]};
g.doPred(grammar, nf, 'sd2a', backOptions);
var node = nf.applyFunc('master', backOptions.nodeList);






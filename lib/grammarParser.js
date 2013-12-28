var that={};
module.exports=that;

that.doPred=doPred;
that.NodeFactory=NodeFactory;
that.grammarFromString=grammarFromString;
that.configure=function(options){
  if('dbg' in options){
    _DBG_enabled=options.dbg;
  }
}
var _DBG_offset='';
var _DBG_enabled=false;
function DBG(s){if(_DBG_enabled){console.log(_DBG_offset+s);}}
function DBG_OPEN(s){DBG(s);_DBG_offset+='  ';}
function DBG_CLOSE(s){_DBG_offset=_DBG_offset.slice(0,-2);DBG(s);}
function TerminalNode(name,s){
  this.name=name;
  this.s=s;
  this.toString=function(){return this.s;}
  this.traverse=function(cbk){cbk(this);}
}
function Node(name,nodeList){
  this.name=name;
  this.nodeList=nodeList;
  this.toString=function(){
    return this.nodeList.map(function(x){
     return x.toString();
   }).join('');
  }
  this.traverse=function(cbk){
    this.nodeList.map(function(x){
     x.traverse(cbk);
   });
   cbk(this);
  }
}
function NodeFactory(name, nodeList){
  var registeredNames={};
  var _that= {
    /*
      func: node applyFunc(nodeList, string)
    */
    register:function(name,func){
      registeredNames[name]=func;
      return _that;
    },
    applyFunc:function(name,nodeList,string){
      if(name in registeredNames){
        return registeredNames[name](name,nodeList,string);
      }
      if(name[0]=='_'){
        return new TerminalNode(name, string);
      }
      return new Node(name,nodeList);
    }
  };
  return _that;
}
/*
backOptions:{
  left:'string to parse': will contain in output the string which is left
  nodeList:[] the nodes which made it
} 
*/
/*
  grammar:
{
'Frac':[
    {oneOrPlus:['whiteSpace','pContext']},
    ['_terminal'],
    null
  ]
,
'_terminal':regex
}
*/
function doPred(grammar, nodeFactory, predName, backOptions){
  var rules=grammar[predName];
DBG('called '+predName+'->'+backOptions.left);
  if(predName[0]=='_'){                                               //terminal
    var res = backOptions.left.match(rules);
DBG('trying '+predName+'|'+rules+'|'+backOptions.left);
    if(res){
      var node=nodeFactory.applyFunc(predName,nodeList,res[0]);
      backOptions.left = backOptions.left.substr(res[0].length);
      backOptions.nodeList.push(node);
DBG('success->'+backOptions.left);
      return true;
    }
    return false;
  }else{
    var nodeList=[];
    for(var i=0;i<rules.length;++i){
      var s=backOptions.left;         //reinitialise string for each alternative
DBG_OPEN('processing '+rules[i]+' '+s+' for '+predName);
      var rule=rules[i];
      var backRule={left:s,nodeList:[]}
      if(rule==null || rule instanceof Array){
DBG("doRule")
        var res=doRule(rule,backRule,   grammar,nodeFactory);
      }else{
DBG("doRuleOneOrPlus")
        var res=doOneOrPlusRule(rule.oneOrPlus,backRule,   grammar,nodeFactory);
      }
DBG_CLOSE('en pred '+res);
      if(res){
        backOptions.left = backRule.left;
        var node=nodeFactory.applyFunc(predName,backRule.nodeList);//?empty node
        backOptions.nodeList.push(node);
        return true;
      }
    }
    return false;
  }
}
function doRule(rule, backRule,   grammar,nodeFactory){
  if(rule==null){return true;}
  var params={left:backRule.left, nodeList:[]};
  for(var j=0;j<rule.length;++j){
    var dependency=rule[j];
    if(dependency==null){
      break;
    }
    DBG('dependency == '+dependency+' '+j);
    if(!doPred(grammar,nodeFactory,dependency, params)){
      return false;
    }
  }
  backRule.left = params.left;
  backRule.nodeList=params.nodeList;
  return true;
}
function doOneOrPlusRule(rule, backRule,   grammar,nodeFactory){
  if(doRule(rule, backRule,   grammar,nodeFactory)){
    var nodeList=[];
    do{
      nodeList=nodeList.concat(backRule.nodeList);
      var left=backRule.left;//do not iterate if child is a null predicate
    }while(doRule(rule, backRule,   grammar,nodeFactory) && left!=backRule.left);
    backRule.nodeList=nodeList;
    DBG("##############")
    return true;
  }
  return false;
}
function grammarFromString(s){
  var grammar={};
  s=s.replace(/\\;/g,'__protected;');
  s.split(';').filter(function(x){return x.length>1;}).forEach(function(line){
    line=line.trim();
    var rule=line.split(':');
    var pred=rule[0].trim();
    var deps=rule[1].replace(/\s*$/,'');
    if(pred.indexOf('+')!=-1){
      pred=pred.replace('+','').trim();
      if(!(pred in grammar)){
        grammar[pred]=[];
      }
      grammar[pred].push({oneOrPlus:deps.split(',')});
    }else{
      if(pred[0]=='_'){
        var regex=rule.slice(1).join(':').replace(/\s*$/,'');
        regex=regex.replace(/__protected/g,';');
        grammar[pred]=new RegExp(regex);
      }else{
        if(!(pred in grammar)){
          grammar[pred]=[];
        }
        var res=deps.split(',');
        if(res[0]=='null'){
          res=null;
        }
        grammar[pred].push(res);
      }
    }
  });
  var res=checkGrammar(grammar);
  if(res.length){
    console.log('failed to determine');
    console.log(res);
  }
  return grammar;
}
function checkGrammar(grammar){
  var keys=Object.keys(grammar);
  var notFound=[];
  for(var i in grammar){
    var alternatives=grammar[i];
    if(alternatives instanceof Array){
      alternatives.forEach(function(deps){
        if(deps===null){return;}
        if(deps.oneOrPlus){
          deps=deps.oneOrPlus;
        }
        notFound = notFound.concat(deps.filter(function(dep){
          return keys.indexOf(dep)==-1;
        }));
      });
    }
  }
  return notFound;
}


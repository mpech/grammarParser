grammarParser
========

Specify a grammar in a file
parses it, create a grammar which parses a later file to be parsed with this grammar

examples
========

1. create a grammar
  
  content of sampleGrammar.txt:
  <pre><code>
      expression           :_firstTerm,_end;
      expression           :_firstTerm,additionalTermGroup,_end;
      additionalTermGroup +:additionalTerm;
      additionalTerm       :_anyWs,_sign,_anyWs,_term;
      _firstTerm           :^\d+;
      _term                :^\d+;
      _sign                :^[-+];
      _anyWs               :^\s*;
      _end                 :^\;;
  </code></pre>
  <pre><code>
      var s=fs.readFileSync(__dirname+'/data/sampleGrammar.txt').toString();
      var grammar=g.grammarFromString(s);
      var nf = g.NodeFactory();
  </code></pre>
  
2. read a file to be parsed by this grammar
  
  content of sampleAdditiveLine.txt:
  <pre><code>
      1+2-6+8;
  </code></pre>
  
  <pre><code>
      //backOptions will be filled as a parameter given to the function
      var backOptions={left:fs.readFileSync(__dirname+'/data/sampleAdditiveLine.txt').toString(), nodeList:[]};
  </code></pre>
  
3. parse it
  
  <pre><code>
      g.doPred(grammar, nf, 'expression', backOptions);//backOptions contains nodeList filled
      var node = nf.applyFunc('master', backOptions.nodeList);
  </code></pre>
  
4. traverse it
  
  <pre><code>
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
      console.log(sum);
  </code></pre>
  
  ***
  Output:
  
  <pre><code>
      8
  </code></pre>
  

Traversing the tree
===================
- A non leaf node contains 1 to n nodes accessible in this.nodeList.
- A leaf node by definition does not contains node.

To traverse the tree, the method traverse is implemented as follow:

    node.traverse=function(cbk){
      for all children as child of node
        child.traverse(cbk)
      endfor
      traverse(node)
    }
    leaf.traverse=function(cbk){return cbk(this)}

Writing a grammar
=================
Writing rules
-------------------------------------------------------------
Somehow closed to prolog syntax
<pre><code>
leftRule:pred1,pred2,pred3;
leftRule:pred4,pred5
</code></pre>

- ':' separates the name of the rule from the names of successive predicate to try.
- ';' delimitates the end of a rule
- alternative rules can be supplied. There are simply a rule with the same name but with different predicates.
- ',' delimitates successive predicates

One or more occurrences
-------------------------------------------------------------
Symbolized with the '+' symbol at left of ':'

    group +: single
    single:_finalNode
    _finalNode:^end

Any multiplicity
-------------------------------------------------------------
This is expressed as : no occurrence Or (One or more occurrences).
The no occurrence is symbolized with the null predicate

    anyGroup +: single
    anyGroup  : null
    single:_finalNode
    _finalNode:^end

The prefix any is here to indicate the predicate may match 0, 1 or more occurrence but is not needed.

Final nodes as regex
-------------------------------------------------------------
Any final node is to be matched with a regex.
A final node begins by a '_' character.

    _finalNode:^(a|b)c


options
=======
- dbg:true
Outputs on console some junk output..

<pre><code>
    g.configure({
      dbg:true
    });
</code></pre>

installation
============
clone this project from github:

    git clone http://github.com/mpech/grammarParser.git




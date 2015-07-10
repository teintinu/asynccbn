# asynccbn 
Babel Plugin to transpile EcmaScript7 async function transpiled into callbacks.

[![Build Status](https://travis-ci.org/thr0w/asynccbn.png)](https://travis-ci.org/thr0w/asynccbn) [![Dependencies](https://david-dm.org/thr0w/asynccbn.svg)](https://david-dm.org/thr0w/asynccbn) [![Coverage Status](https://img.shields.io/coveralls/thr0w/asynccbn.svg)](https://coveralls.io/r/thr0w/asynccbn?branch=master)

[![NPM](https://nodei.co/npm/asynccbn.png?downloads=true)](https://nodei.co/npm/asynccbn/)

> still working, carefull in production enviroments

## Why

Promises and generators need more memory and are slower then callbacks.

## install
npm install asynccbn

## usage 

Use it as a [babeljs plugin](https://babeljs.io/docs/advanced/plugins/)

## sample 1: defining an async function
input:
```javascript
  async function divide(a,b)
  {                         
    return a/b;
  }            
```
output:
```javascript
  function divide(a, b, callback) {
    callback(null, a / b);
  }
  
```

## sample 2: invoking async function
input:
```javascript
  async function fn() { 
    return await divide(8,2) + await divide(10,2);
  }
```
output:
```javascript
 divide(8, 2, function(err$, res$1) {
   if (err$) return callback(err$);
   divide(10, 2, function(err$, res$2) {
     if (err$) return callback(err$);
     callback(null, res$1+res$2);
   });
 });  
```


## sample 3: callback hell
input:
```javascript
async function fn() { 
  var x=10;                   
  var a=await divide(2,2);    
  var y=10;                   
  var b=await divide(4,2);    
  var c=await divide(6,2);    
  var d=await divide(16,2)/2; 
  var e;                      
  e=await divide(10,2);       
  return x+a+b+c+d+e-y;       
}
```
output:
```javascript
function fn(callback) {
  var x=10;
  divide(2, 2, function(err$, a) {
    if (err$) return callback(err$);
    var y=10;
    divide(4, 2, function(err$, b) {
      if (err$) return callback(err$);
      divide(6, 2, function(err$, c) {
        if (err$) return callback(err$);
        divide(16, 2, function(err$, res$4) {
          if (err$) return callback(err$);
          var d=res$4/2;
          var e;
          divide(10, 2, function(err$, res$5) {
             if (err$) return callback(err$);
             e=res$5;
             callback(null, x+a+b+c+d+e-y);
          });
        });
      });
    });
  });
}
```

# asynccbn 
Babel Plugin to transpile EcmaScript7 async function transpiled into callbacks.

> still working, carefull in production enviroments


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

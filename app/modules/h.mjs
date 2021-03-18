let cleanupFuncs = [];

function h() {
  let args = [].slice.call(arguments),
    e = null

  function item(l) {
    let r;

    function parseClass(string) {
      // Our minimal parser doesn’t understand escaping CSS special
      // characters like `#`. Don’t use them. More reading:
      // https://mathiasbynens.be/notes/css-escapes .

      let m = string.split(/([\.#]?[^\s#.]+)/)
      if (/^\.|#/.test(m[1]))
        e = document.createElement('div')
      forEach(m, function(v) {
        let s = v.substring(1, v.length);
        if (!v) return;
        if (!e){
          e = document.createElement(v)
        } else if (v[0] === '.') {
          e.classList.add(s)
        } else if (v[0] === '#'){
          e.setAttribute('id', s)
        }
      })
    }

    if (l == null)
    ;
    else if ('string' === typeof l) {
      if (!e)
        parseClass(l)
      else
        e.appendChild(r = document.createTextNode(l))
    } else if ('number' === typeof l ||
      'boolean' === typeof l ||
      l instanceof Date ||
      l instanceof RegExp) {
      e.appendChild(r = document.createTextNode(l.toString()))
    }
    //there might be a better way to handle this...
    else if (isArray(l))
      forEach(l, item)
    else if (isNode(l))
      e.appendChild(r = l)
    else if (l instanceof window.Text)
      e.appendChild(r = l)
    else if ('object' === typeof l) {
      for (let k in l) {
        if ('function' === typeof l[k]) {
          if (/^on\w+/.test(k)) {
            (function(k, l) { // capture k, l in the closure
              if (e.addEventListener) {
                e.addEventListener(k.substring(2), l[k], false)
                cleanupFuncs.push(function() {
                  e.removeEventListener(k.substring(2), l[k], false)
                })
              } else {
                e.attachEvent(k, l[k])
                cleanupFuncs.push(function() {
                  e.detachEvent(k, l[k])
                })
              }
            })(k, l)
          } else {
            // observable
            e[k] = l[k]()
            cleanupFuncs.push(l[k](function(v) {
              e[k] = v
            }))
          }
        } else if (k === 'style') {
          if ('string' === typeof l[k]) {
            e.style.cssText = l[k]
          } else {
            for (let s in l[k])(function(s, v) {
              if ('function' === typeof v) {
                // observable
                e.style.setProperty(s, v())
                cleanupFuncs.push(v(function(val) {
                  e.style.setProperty(s, val)
                }))
              } else
                var match = l[k][s].match(/(.*)\W+!important\W*$/);
              if (match) {
                e.style.setProperty(s, match[1], 'important')
              } else {
                e.style.setProperty(s, l[k][s])
              }
            })(s, l[k][s])
          }
        } else if (k === 'attrs') {
          for (let v in l[k]) {
            e.setAttribute(v, l[k][v])
          }
        } else if (k.substr(0, 5) === "data-") {
          e.setAttribute(k, l[k])
        }  else if (['itemtype', 'itemscope', 'itemprop', 'for'].indexOf(k) !== -1) {
          e.setAttribute(k, l[k])
        } else {
          e[k] = l[k]
        }
      }
    } else if ('function' === typeof l) {
      //assume it's an observable!
      let v = l()
      e.appendChild(r = isNode(v) ? v : document.createTextNode(v))

      cleanupFuncs.push(l(function(v) {
        if (isNode(v) && r.parentElement)
          r.parentElement.replaceChild(v, r), r = v
        else
          r.textContent = v
      }))
    }

    return r
  }
  while (args.length)
    item(args.shift())

  return e
}



h.cleanup = function() {
  for (let i = 0; i < cleanupFuncs.length; i++) {
    cleanupFuncs[i]()
  }
  cleanupFuncs.length = 0
}





function isNode(el) {
  return el && el.nodeName && el.nodeType
}

function forEach(arr, cb) {
  if (arr.forEach) {
    return arr.forEach(cb)
  }
  for (let i = 0; i < arr.length; i++) {
    cb(arr[i], i)
  }
}

function isArray(arr) {
  return Object.prototype.toString.call(arr) == '[object Array]'
}


export { h };

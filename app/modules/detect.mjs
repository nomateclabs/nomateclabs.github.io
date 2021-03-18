import { global as g } from  "/app/modules/global.mjs";
import { ls } from  "/app/modules/storage.mjs";
import { meta } from  "/app/modules/meta.mjs";
import { utils } from  "/app/modules/utils.mjs";
import { idb } from  "/app/modules/idb.mjs";
import { comments } from  "/app/modules/comments.mjs";

const detect = {
  init: function(cb){
    let arr = [],
    msg;

    if (!window.fetch) {
      arr.push('fetch not supported')
    }

    if(arr.length !== 0){
      msg = 'browser errors detected: ' + arr.join(', ');
      return cb(true, msg)
    }

    fetch('./app/config/index.json', {
      method: 'GET',
      headers: g.headers.json
    })
    .then(function(res) {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      ls.set('config', data);
      location.hash = '/'+ data.navlinks[0]
      meta.init(data.meta);
      if(data.comments.enabled){

      }

        idb.req({index: 'posts'}, function(err){
          if(err){return cb(err, data)}
          return cb(false, data)
        })

    })
    .catch(function(err){
      msg = err
      cb(true, msg)
    })

  }
}

export { detect }

import { global as g } from  "/app/modules/global.mjs";
import { detect } from "/app/modules/detect.mjs";
import { tpl } from "/app/modules/tpl.mjs";
import { h } from "/app/modules/h.mjs";
import { workers } from "/app/modules/workers.mjs";
import { utils } from "/app/modules/utils.mjs";
import { events } from "/app/modules/events.mjs";
import { ls, ss } from  "/app/modules/storage.mjs";
import { domcache } from "/app/modules/domcache.mjs";
import { clean } from "/app/modules/clean.mjs";

ss.del('sidebar')
// detect browser errors
detect.init(function(err, config){
  if(err){return g.cl(err)};

  utils.detect_crawler(function(isbot){

    events.init(config, function(err){
      if(err){return g.ce(err)};

      let pluggin = config.pluggins.misc;
      events.rout(config, function(err){
        if(err){return g.ce('page not found')};
        console.log(config)
        workers.init(config, function(){
          events.remove_botnet(config.botnet);
///
/*
        //let rurl = 'https://nomatec-rest.herokuapp.com/admin/test';
        let rurl = config.nomatec_rest.base_url + '/test';
          fetch(rurl, {
            method: 'GET',
            headers: g.headers.json_cors,
            //body: JSON.stringify({test: 'ok'})
          }).then(function(res) {
            if (res.status >= 200 && res.status < 300) {
              return res.json();
            } else {
              return Promise.reject(new Error(res.statusText))
            }
          }).then(function(data) {
            console.log(data)
          }).catch(function(err) {
            console.log(err)
          })



*/
///



        });
      });
    });
  })
});


/*

let rurl = config.nomatec_rest.base_url + '/hit';
fetch(rurl, {
  method: 'POST',
  headers: g.headers.json_cors,
  body: JSON.stringify({key: config.nomatec_rest.hitcount.api, item: JSON.stringify(1578318611477)})
}).then(function(res) {
  if (res.status >= 200 && res.status < 300) {
    return res.json();
  } else {
    return Promise.reject(new Error(res.statusText))
  }
}).then(function(data) {
  console.log(data)
}).catch(function(err) {
  console.log(err)
})

window.onload = function(){
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("Hi there!");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("Hi there!");
      }
    });
  }
}

let cnf = ls.get('config').comments.settings

let durl = 'https://disqus.com/api/3.0/forums/listThreads.json?&forum='+cnf.src+'&api_key=fdJbeBzgJma3ZGNehxArMqKL1FTCi9760HZzHhXaOz1HquwwvBilENpNLHz9UnPn'
fetch(durl, {
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
  console.log(data)
})
.catch(function(err){
  console.log('Request failed', err)
})
*/

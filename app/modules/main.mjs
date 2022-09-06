if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
  .then(function(reg){
    console.log('%cService-worker: %conline', 'color:cyan', 'color:lime');
  }).catch(function(error){
    console.log('%cService-worker: %cfailed', 'color:cyan', 'color:red');
  });
}

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

window.pageCache = {};

ss.del('sidebar')
// detect browser errors
detect.init(function(err, config){
  if(err){return g.cl(err)};


    events.init(config, function(err){
      if(err){return g.ce(err)};

      let pluggin = config.pluggins.misc;
      events.rout(config, function(err){
        if(err){return g.ce('page not found')};
        workers.init(config, function(){
          events.remove_botnet(config.botnet);
          setTimeout(function(){

            console.log('%cDo you represent a charity or want to collaborate on a project? contact me at: %csupport@nomateclabs.com\n', 'color:#007bff;font-size:1rem', 'color:lime;font-size:1rem');

            console.log('%cDONE %cAND %cDONE%c!!!', 'color:magenta;font-size:2rem', 'color:#ff5722;font-size:3rem', 'color:magenta;font-size:2rem', 'color:lime;font-size:1.4rem');
          },3000)
        });
      });
    });

});

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

        });
      });
    });
  })
});

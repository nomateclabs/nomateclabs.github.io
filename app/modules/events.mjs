import { global as g } from  "/app/modules/global.mjs";
import { h } from "/app/modules/h.mjs";
import { utils } from "/app/modules/utils.mjs";
import { tpl } from "/app/modules/tpl.mjs";
import { workers } from "/app/modules/workers.mjs";
import { page } from  "/app/modules/page.mjs";
import { idb } from  "/app/modules/idb.mjs";
import { enc } from  "/app/modules/enc.mjs";
import { ls, ss } from  "/app/modules/storage.mjs";
import { cookie_warn, time_line, to_top } from "/app/modules/components.mjs";


const events = {
  init(config, cb){

    let sub_content = h('div'),
    body = document.body;

      utils.add_hitcount(config, function(err){
        if(err){g.ce(err)}

        if(config.to_top){
          document.body.append(to_top(config.to_top_dest))
        }

        if(config.cookie_warn && !ls.get('cookie_warn')){
          sub_content.append(new cookie_warn(config.cookie_warn_msg))
        }

        body.append(
          tpl.build(config),
          sub_content
        );

        if(config.sidebar.timeline){
          document.getElementById('timeline').append(new time_line())
        }

        events.toggle_sidebar(config.sb_first);

        if(config.sidebar.catlist){
          workers.fetch_item({type: 'catlist'});
        }

        if(config.sidebar.taglist){
          workers.fetch_item({type: 'taglist'});
        }

        if(config.sidebar.recent){
          workers.fetch_item({type: 'recentlist'});
        }

        if(config.sidebar.history){
          let items = ls.get('history');
          if(items && items.length > 0){
            utils.add_history(items, 'his');
          }
        }

        if(config.sidebar.history){
          let items = ls.get('favorite');
          if(items && items.length > 0){
            utils.add_history(items, 'fav');
          }
        }

        return cb(false);
      })



  },
  rout(config, cb){
    try {

      window.onhashchange = function(){
        events.rerout(config);
      }

      if(location.hash !== ''){
        events.rerout(config);
      } else {
        location.hash = '/' + config.navlinks[0];
      }

      return cb(false)
    } catch (err) {
      if(err){return cb(err)};
    }
  },
  rerout(config){

      let dest = location.hash.slice(2).split('/'),
      main = document.getElementById('main-content'),
      ttl = document.getElementById('ttl'),
      bcdest = '';

      if(dest[0] !== config.navlinks[0]){
        bcdest = dest[0]
      }

      document.getElementById('bc').innerText = bcdest;

      if(bcdest === ''){
        bcdest = 'WELCOME TO NOMATEC LABS'
      }


      new WOW().init()
      ttl.textContent = utils.capitalize(bcdest);
      main.innerHTML = '';
      document.title = dest[0];
      ls.set('path', dest)
    try {
      page[dest[0]](main, function(cnf){
        events.trigger('sidebar', cnf.sidebar);
      });

    } catch (err) {
      if(err){
        g.ce(err)
        location.hash = '/error'
        return g.ce('page not found')
      }
    }
  },
  toggle_sidebar(i){

    let sib = 'previousSibling',
    menu_right = document.getElementById('menu_right');

    if(!i){
      sib = 'nextSibling';
    }
    window.addEventListener('sidebar', function(evt){
      evt = evt.detail;
      let item = document.getElementById('main-content');
      if(!evt){
        if(ss.get('sidebar') !== false){
          menu_right.classList.add('hidden')
          item.classList.remove('col-lg-9');
          item.classList.add('col-lg-12')
          item[sib].classList.add('hidden');
          ss.set('sidebar', false);
        }
      } else {
        if(ss.get('sidebar') !== true) {
          menu_right.classList.remove('hidden')
          item.classList.remove('col-lg-12');
          item.classList.add('col-lg-9')
          item[sib].classList.remove('hidden');
          ss.set('sidebar', true);
        }
      }
    })

  },
  trigger(evt, data){
    var event = new CustomEvent(evt, {
      detail: data
    });
    window.dispatchEvent(event);
    return;
  },
  remove_botnet(i){
    if(i.remove){
      setTimeout(function(){
        document.getElementById('botnet').remove();
      }, i.delay)
    }
  }
}

export { events }

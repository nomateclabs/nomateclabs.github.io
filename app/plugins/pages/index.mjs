import { h } from  "/app/modules/h.mjs";
import { events } from  "/app/modules/events.mjs";
import { global as g } from  "/app/modules/global.mjs";
import { utils } from  "/app/modules/utils.mjs";
import { tpl } from  "/app/modules/tpl.mjs";
import { rest_range } from  "/app/modules/components.mjs";
import { enc } from  "/app/modules/enc.mjs";
import { ls,ss } from  "/app/modules/storage.mjs";

const pages = {
home: function(main, cnf){cnf({sidebar: false});let config = ls.get('config');

bgChange(true);



if(!pageCache.home){
    pageCache.home = tpl.home(config)
}

main.append(pageCache.home);

},contact: function(main, cnf){cnf({sidebar: false});
bgChange(true);

if(!pageCache.contact){
    pageCache.contact = tpl.contact();
}

main.append(pageCache.contact);},sitemap: function(main, cnf){cnf({sidebar: false});
bgChange(false);

if(!pageCache.sitemap){
    let config = ls.get('config'),
      lg_obj = config.sitemap,
      lg_main = h('div.list-group.mb-4',
        h('div.list-group-item.list-group-item-secondary.cp', {
          onclick: function() {
            let sib = this.parentNode.lastChild;
    
            if (sib.classList.contains('fadeIn')) {
              sib.classList.remove('fadeIn');
              sib.classList.add('fadeOut')
            } else {
              sib.classList.remove('fadeOut');
              sib.classList.add('fadeIn')
            }
    
          }
        }, 'sitemap base', h('span.icon-eye.float-right')),
        h('div.fadeIn')
      );
    
    for (let i in lg_obj) {
      lg_main.lastChild.append(tpl.sitemap_lg_item(i, lg_obj[i]))
    }
    
    pageCache.sitemap = h('div.container',
      h('h3', 'sitemap'),
      lg_main
    )
}

main.append(pageCache.sitemap);},terms: function(main, cnf){cnf({sidebar: false});
bgChange(false);

if(!pageCache.terms){
  let hr = h('hr');
  fetch('./app/config/terms.json', {
    method: 'GET',
    headers: g.headers.json
  })
  .then(function(res) {
    if (res.status >= 200 && res.status < 300) {
      return res.json();
    } else {
      return Promise.reject(new Error(res.statusText));
    }
  })
  .then(function(data) {

    function terms_tpl(obj) {
      let ele = h('div');
      ele.innerHTML = obj.info;
      return h('div',
        h('h1.text-muted', obj.title),
        h('h2', obj.header),
        ele,
        h('small.text-right', 'last updated: '+ utils.format_date(obj.date))
      )
    }

    let terms_div = h('div.container-fluid');

    for (let i = 0; i < data.length; i++) {
      terms_div.append(terms_tpl(data[i]), hr.cloneNode());
    }
    
    pageCache.terms = terms_div
    main.append(terms_div);

  })
  
} else {
    main.append(pageCache.terms);
}
},services: function(main, cnf){cnf({sidebar: false});bgChange(true);

if(!pageCache.services){
    let config = ls.get('config');
    
    pageCache.services = h('div',
    tpl.services(config.services.main),
    tpl.serviceEles(config.service_ico),
    tpl.countr(config.counters.main)
  )
}

main.append(pageCache.services);},about: function(main, cnf){cnf({sidebar: false});bgChange(true);

if(!pageCache.about){
    pageCache.about = tpl.about();
}

main.append(pageCache.about);}
}
export { pages }
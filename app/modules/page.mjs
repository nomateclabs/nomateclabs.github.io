import { global as g } from  "/app/modules/global.mjs";
import { tpl } from "/app/modules/tpl.mjs";
import { pages } from "/app/plugins/pages/index.mjs";
import { workers } from "/app/modules/workers.mjs";
import { utils } from "/app/modules/utils.mjs";
import { events } from "/app/modules/events.mjs";
import { pagination } from "/app/modules/pagination.mjs";
import { domcache } from "/app/modules/domcache.mjs";
import { ls, ss } from  "/app/modules/storage.mjs";
import { idb } from "/app/modules/idb.mjs";
import { blog_item, news_item } from "/app/modules/components.mjs";
import { comments } from "/app/modules/comments.mjs";


let page = {
  blog: function(main, cnf){
    let dest = 'search/index',
    sort_order = ls.get('nomatec_sort');

    if(!sort_order){
      ls.set('nomatec_sort', 'newest');
    }

    if(ls.get('nomatec_sort') === 'oldest'){
      dest = 'search/reverse';
    }

    cnf({sidebar: true});
    bgChange(false);

    main.append(tpl.blog(sort_order));
    pagination.init(dest, 'postlist', function(err){
      if(err){return g.ce(err)}
      workers.fetch_item({type:'postlist', page: 1, dest: dest});
    });
  },
  history: function(main, cnf){
    cnf({sidebar: true});
    bgChange(false);
    idb.get({index: 'saved', id: 'history'}, function(err,res){
      if(err || !res){res = {id: 'history', items:[]}}
      main.append(tpl.history(res));
    })
  },
  saved: function(main, cnf){
    cnf({sidebar: true});
    bgChange(false);
    idb.get({index: 'saved', id: 'favorite'}, function(err,res){
      if(err || !res){res = {id: 'favorite', items:[]}}
      main.append(tpl.history(res));
    })
  },
  news: function(main, cnf){
    let dest = 'news/index',
    sort_order = ls.get('nomatec_sort');

    if(!sort_order){
      ls.set('nomatec_sort', 'newest');
    }

    if(ls.get('nomatec_sort') === 'oldest'){
      dest = 'news/reverse';
    }

    cnf({sidebar: true});
    bgChange(false);
    main.append(tpl.news(sort_order));
    pagination.init(dest, 'newslist', function(err){
      if(err){return g.ce(err)}
      workers.fetch_item({type:'newslist', page: 1, dest: dest});
    });
  },
  author: function(main, cnf){
    let auth_sel = ls.get('path')[1],
    dest = 'search/author/'+ auth_sel;
    cnf({sidebar: true});
    bgChange(false);
    fetch('./api/data/search/author/index.json', {
      method: 'GET',
      headers: g.headers.json
    }).then(function(res) {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    }).then(function(data) {
      let obj;
      for (let i = 0; i < data.length; i++) {
        if(data[i].author === auth_sel){
          obj = data[i];
          break;
        }
      }
      main.append(tpl.author({type: 'post', data: obj}));
      pagination.init(dest, 'postlist', function(err){
        if(err){return g.ce(err)}
        workers.fetch_item({type:'postlist', page: 1, dest: dest});
        g.cl(obj)
      });
    }).catch(function(err) {
      console.log('Request failed', err);
    });

    return;

  },
  list: function(main, cnf){
    let d_type = location.hash.split('/').pop()
    cnf({sidebar: true});
    bgChange(false);
    fetch('./api/data/tagcat.json', {
      method: 'GET',
      headers: g.headers.json
    })
    .then(function(res) {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    }).then(function(data) {
      g.cl(data)
      main.append(tpl.list({type: d_type, data: data}));
    }).catch(function(err){
      console.log('Request failed', err)
    })
  },
  categories: function(main, cnf){
    let dest = 'search/cat/'+ ls.get('path')[1];
    cnf({sidebar: true});
    bgChange(false);
    main.append(tpl.categories({type: 'post'}));
    pagination.init(dest, 'postlist', function(err){
      if(err){return g.ce(err)}
      workers.fetch_item({type:'postlist', page: 1, dest: dest});
    });
    return;
  },
  news_categories: function(main, cnf){
    let dest = 'news/cat/'+ ls.get('path')[1];
    cnf({sidebar: true});
    bgChange(false);
    main.append(tpl.categories({type: 'news'}));
    pagination.init(dest, 'newslist', function(err){
      if(err){return g.ce(err)}
      workers.fetch_item({type:'newslist', page: 1, dest: dest});
    });
    return;
  },
  tags: function(main, cnf){
    let dest = 'search/tag/'+ ls.get('path')[1];
    cnf({sidebar: true});
    bgChange(false);
    main.append(tpl.tags());
    pagination.init(dest, 'postlist', function(err){
      if(err){return g.ce(err)}
      workers.fetch_item({type:'postlist', page: 1, dest: dest});
    });
    return;
  },
  timeline: function(main, cnf){
    let timeline = ss.get('nomatec_timeline');
    let dest = ['post', timeline[0], timeline[1]].join('/');
    cnf({sidebar: true});
    bgChange(false);
    main.append(tpl.timeline());
    pagination.init(dest, 'postlist', function(err){
      if(err){return g.ce(err)}
      workers.fetch_item({type:'postlist', page: 1, dest: dest});
    });
    return;
  },
  search: function(main, cnf){
    cnf({sidebar: true});
    bgChange(false);
    main.append(tpl.search());
    return;
  },
  rss_atom: function(main, cnf){
    cnf({sidebar: true});
    bgChange(false);
    let f_headers = {
      method: 'GET',
      headers: g.headers.json
    }
    fetch('./api/data/tagcat.json', f_headers)
    .then(function(res) {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    }).then(function(data) {
      let obj = {
        post_cat: data.cat
      }
      fetch('./api/data/news/cat/index.json', f_headers)
      .then(function(res) {
        if (res.status >= 200 && res.status < 300) {
          return res.json();
        } else {
          return Promise.reject(new Error(res.statusText))
        }
      }).then(function(data) {
        obj.news_cat = data;
        fetch('./api/data/search/author/index.json', f_headers)
        .then(function(res) {
          if (res.status >= 200 && res.status < 300) {
            return res.json();
          } else {
            return Promise.reject(new Error(res.statusText))
          }
        }).then(function(data) {
          let arr = [];
          for (let i = 0; i < data.length; i++) {
            arr.push(data[i].author)
          }
          obj.author_cat = arr;
          return main.append(tpl.rss_atom(obj));
        }).catch(function(err){
          console.log('Request failed', err)
        })
      }).catch(function(err){
        console.log('Request failed', err)
      })
    })
  },
  api: function(main, cnf){
    cnf({sidebar: false});
    bgChange(false);

    if(!pageCache.api){
      fetch('./app/config/api.json', {
        method: 'GET',
        headers: g.headers.json
      }).then(function(res) {
        if (res.status >= 200 && res.status < 300) {
          return res.json();
        } else {
          return Promise.reject(new Error(res.statusText))
        }
      }).then(function(data) {
        pageCache.api = tpl.api(data)
        main.append(pageCache.api);
      }).catch(function(err){
        console.log('Request failed', err)
      })
    } else {
      main.append(pageCache.api);
    }

  },
  post: function(main, cnf){
    cnf({sidebar: true});
    bgChange(false);
    let config = ls.get('config'),
    hash = location.hash,
    id = parseInt(hash.split('/').pop());

    idb.get({index: 'posts', id: id}, function(err,res){
      if(err || !res){
        return workers.fetch_item({type:'postitem', page: hash.replace('#', 'data')});
      }

      if(res.max_age < Date.now()){
        idb.delete_all({index: 'posts', id: id}, function(err,res){
          if(err){return console.error(err)}
          console.log('updating stale idb post...')
          return workers.fetch_item({type:'postitem', page: hash.replace('#', 'data')});
        })
        return;
      }

      res.date = res.id;
      document.getElementById('main-content').append(new blog_item(res));
      console.log('post loaded from idb')
      workers.fetch_item({type:'postpag', id: id, dest: 'post/list'});
      if(config.comments.enabled){
        comments.init({type: 'blog', id: res.id, title: res.title});
      }
      delete res.date;
      utils.sort_history(res, function(err){
        if(err){return g.ce(err)}
      });

    })

    utils.add_hit(config, id, function(err){
      if(err){return g.ce(err)}
    });

  },
  entries: function(main, cnf){
    cnf({sidebar: true});
    bgChange(false);
    let config = ls.get('config'),
    hash = location.hash,
    id = parseInt(hash.split('/').pop());

    idb.get({index: 'entries', id: id}, function(err,res){
      if(err || !res){
        return workers.fetch_item({type:'newsentry', page: hash.replace('#/entries', 'data/news/items')});
      }

      if(res.max_age < Date.now()){
        idb.delete_all({index: 'entries', id: id}, function(err,res){
          if(err){return console.error(err)}
          console.log('updating stale idb entry...')
          return workers.fetch_item({type:'newsentry', page: hash.replace('#/entries', 'data/news/items')});
        })
        return;
      }

      res.date = res.id;
      document.getElementById('main-content').append(new news_item(res));
      console.log('entry loaded from idb');
      workers.fetch_item({type:'postpag', id: id, dest: 'news/items/list'});
      if(config.comments.enabled){
        comments.init({type: 'news', id: res.id, title: res.title})
      }
      return;
    })

    utils.add_hit(config, id, function(err){
      if(err){return g.ce(err)}
    });
  },
  feed: function(main, cnf){
    cnf({sidebar: true});
    bgChange(false);
    workers.fetch_item({
      type:'feed'
    });
    return;
  },
  settings: function(main,cnf){
    cnf({sidebar: true});
    bgChange(false);
    main.append(tpl.settings());
    return;
  },
  error: function(main, cnf){
    cnf({sidebar: false});
    if(!pageCache.error){
      pageCache.error = tpl.error();
    }
    main.append(pageCache.error);
    return;
  },
  unsubscribe: function(main, cnf){
    cnf({sidebar: false});
    bgChange(false);
    main.append(tpl.unsubscribe());
  }
}

for (let i in pages) {
  g.cl(i)
  page[i] = pages[i];
}


export { page }

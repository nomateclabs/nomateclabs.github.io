import { global as g } from  "/app/modules/global.mjs";
import { cattag_link, blog_prev, news_prev, blog_his, blog_item, news_item } from "/app/modules/components.mjs";
import { h } from "/app/modules/h.mjs";
import { tpl } from "/app/modules/tpl.mjs";
import { events } from "/app/modules/events.mjs";
import { utils } from "/app/modules/utils.mjs";
import { ls, ss } from  "/app/modules/storage.mjs";
import { idb } from "/app/modules/idb.mjs";
import { comments } from "/app/modules/comments.mjs";

const fetch_worker = new Worker('/api/fetch_worker.js');

const workers = {
  fetch_item: function(obj){
    fetch_worker.postMessage(obj);
  },
  init: function(config, cb){

    fetch_worker.onmessage = function(e) {
      let data = e.data;

      if(data.type === 'error'){
        return g.ce(data.msg)
      }


      if(data.type === 'byindex'){
        let item = data.data;
        if(item.item !== undefined){
          location.hash = utils['get' + utils.capitalize(item.src)+ 'ByDate'](item.item)
        }
      }

      if(data.type === 'searchpost'){
        let item = data.data,
        dest = document.getElementById('search-btn');
        setTimeout(function(){
          utils.empty(dest);
          dest.classList.add('fa','fa-search');
          dest.removeAttribute('disabled');

          if(data.code){
            return dest.parentNode.nextSibling.innerText = item;
          }

          dest.parentNode.nextSibling.innerText = '';
          return location.hash = utils.getPostByDate(item.date)
        },500)
      }

      if(data.type === 'newsentry'){
        let item = data.data;

        document.getElementById('main-content').append(new news_item(item));
        item.id = item.date;
        item.max_age = Date.now() + config.idb.entries.max_age;
        delete item.date;
        idb.add({index: 'entries', data: item}, function(err,res){
          if(err){return console.error(err)}
          console.log('entry added to idb')
          workers.fetch_item({type:'postpag', id: item.id, dest: 'news/items/list'});
          if(config.comments.enabled){
            comments.init({type: 'news', id: item.id, title: item.title})
          }
        })
      }

      if(data.type === 'postitem'){
        let item = data.data;

        document.getElementById('main-content').append(new blog_item(item));
        item.id = item.date;
        utils.sort_history(item, function(err){
          if(err){return g.ce(err)}
        });
        item.max_age = Date.now() + config.idb.posts.max_age;
        delete item.date;
        idb.add({index: 'posts', data: item}, function(err,res){
          if(err){return console.error(err)}
          console.log('post added to idb');
          workers.fetch_item({type:'postpag', id: item.id, dest: 'post/list'});
          if(config.comments.enabled){
            comments.init({type: 'blog', id: item.id, title: item.title})
          }
        })
      }

      if(data.type === 'catlist'){
        let items = data.data,
        item = h('div.cat-list');
        for (let i = 0; i < items.length; i++) {
          item.append(new cattag_link('categories', items[i]))
        }
        return document.getElementById('catlist').append(item)
      }

      if(data.type === 'recentlist'){
        let items = data.data,
        item = h('div#recentlist.card-body');

        for (let i = 0; i < items.length; i++) {
          items[i].id = items[i].date;
          item.append(new blog_his(items[i]))
        }

        let dest = document.getElementById("recentlist");
        dest.parentNode.replaceChild(item, dest);
      }

      if(data.type === 'taglist'){
        let items = data.data,
        item = h('div.tag-list')

        for (let i = 0; i < items.length; i++) {
          item.append(new cattag_link('tags', items[i]))
        }
        document.getElementById('taglist').append(item)
      }

      if(data.type === 'postlist'){
        let items = data.data,
        item = h('div#postlist');

        for (let i = 0; i < items.length; i++) {
          item.append(new blog_prev(items[i], config))
        }
        let dest = document.getElementById("postlist").parentNode;
        dest.replaceChild(item, dest.childNodes[0]);
        document.getElementById('pag_info').innerText = utils.calc_showing(items.length, 'posts');

      }

      if(data.type === 'newslist'){

        let items = data.data,
        item = h('div#newslist');

        for (let i = 0; i < items.length; i++) {
          item.append(new news_prev(items[i], config))
        }
        let dest = document.getElementById("newslist").parentNode;
        dest.replaceChild(item, dest.childNodes[0]);
        document.getElementById('pag_info').innerText = utils.calc_showing(items.length, 'news entries')


        if(config.comments.enabled){

        }

      }

      if(data.type === 'feed'){
        let items = data.data;
        document.getElementById('main-content').append(
          tpl.feed(items)
        );
      }

      if(data.type === 'postpag'){
        let obj = data.data;
        document.getElementById('nomatec_pag').append(
          tpl.postpag(obj)
        );
      }



    }

    cb()
  }
}

export { workers }

importScripts('./worker/global.js','./worker/utils.js');
cl('fetch worker online')

onmessage = function(e) {
  let data = e.data;

  function err_msg(i){
    return postMessage({type: 'error', msg: i});
  }

  if(data.type === 'searchpost'){
    let item = data.item
    let s_letter = item.substr(0,1),
    s_word = item.split(' ')[0],
    obj = null;

    utils.get(['data/search/alpha', s_letter, 'index'].join('/'), function(err,res){
      if(err){return postMessage({type: 'searchpost', data: 'unable to fetch search list', code: 1});}
      if(res.indexOf(s_word) !== -1){
        utils.get(['data/search/alpha', s_letter, 'items'].join('/'), function(err,res){
          if(err){return postMessage({type: 'searchpost', data: 'unable to fetch search list', code: 1});}
          for (let i = 0; i < res.length; i++) {
            if(res[i].title === item){
              obj = res[i];
            }
          }
          if(obj !== null){
            return postMessage({type: 'searchpost', data: obj, code: 0});
          }
          return postMessage({type: 'searchpost', data: 'post not found', code: 1});
        })
      } else {
        return postMessage({type: 'searchpost', data: 'post not found', code: 1});
      }
    })
  }

  if(data.type === 'catlist'){
    utils.get('data/tagcat', function(err,res){
      if(err){
        return err_msg('unable to fetch catlist');
      }
      return postMessage({type: 'catlist', data: res.cat});
    })
  }

  if(data.type === 'postpag'){
    utils.get(['data', data.dest, 'index'].join('/'), function(err,res){
      if(err){return err_msg('unable to fetch post-item pagination config');}

      let obj = {
        total_posts: res.list_total,
        prev_post: null,
        next_post: null,
      },
      post_src;

      for (let i = 0; i < res.index.length; i++) {
        if(data.id <= res.index[i].first && data.id >= res.index[i].last){
          post_src = i;

          utils.get(['data',  data.dest, post_src].join('/'), function(err,items){
            if(err){return err_msg('unable to fetch post-item pagination list');}
            let len = items.indexOf(data.id);

            if(data.id === res.index[i].first){
              if(data.id === res.first_post){
                obj.prev_post = null;
              } else {
                obj.prev_post = res.index[i-1].last;
              }
            } else {
              obj.prev_post = items[len - 1];
            }

            if(data.id === res.index[i].last){
              if(data.id === res.last_post){
                obj.next_post = null;
              } else {
                obj.next_post = res.index[i+1].first;
              }
            } else {
              obj.next_post = items[len + 1];
            }

            return postMessage({type: 'postpag', data: obj, id: data.id});

          })

          break;
        }
      }


    })
  }

  if(data.type === 'recentlist'){
    utils.get('data/search/index/1', function(err,res){
      if(err){
        return err_msg('unable to fetch recentlist');
      }
      return postMessage({type: 'recentlist', data: res.slice(0,5)});
    })
  }

  if(data.type === 'taglist'){
    utils.get('data/tagcat', function(err,res){
      if(err){
        return err_msg('unable to fetch taglist');
      }
      return postMessage({type: 'taglist', data: res.tag});
    })
  }

  if(data.type === 'postlist' || data.type === 'newslist' ){
    let dest = ['data', data.dest, data.page];
    utils.get(dest.join('/'), function(err,res){
      if(err){
        return err_msg('unable fetch post postlist');
      }
      return postMessage({type: data.type, data: res});
    })
  }

  if(data.type === 'postitem'){
    cl(data.page)
    utils.get(data.page, function(err,res){
      if(err){
        return err_msg('unable get post item');
      }
      return postMessage({type: 'postitem', data: res});
    })
  }

  if(data.type === 'newsentry'){
    cl(data.page)
    utils.get(data.page, function(err,res){
      if(err){
        return err_msg('unable fetch news item');
      }
      return postMessage({type: 'newsentry', data: res});
    })
  }

  if(data.type === 'feed'){
    utils.get('feed/index', function(err,res){
      if(err){
        return err_msg('unable fetch feed config');
      }
      return postMessage({type: 'feed', data: res});
    })
  }

  if(data.type === 'byindex'){
    let src = 'data/post/list/',
    item;

    if(data.src === 'news'){
      src = 'data/news/items/list';
    }

    utils.get([src, 'index'].join('/'), function(err,res){
      if(err){return err_msg('unable fetch item index');}
      let max = res.list_len,
       item_src = Math.floor(data.item / max);
       item_index = data.item  - (item_src * max) -1;

       utils.get([src, js(item_src)].join('/'), function(err,res){
         if(err){return err_msg('unable fetch item');}
         return postMessage({type: 'byindex', data: {src: data.src, item: res[item_index]}});
       })

    })
  }

}

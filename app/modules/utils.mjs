import { global as g } from "/app/modules/global.mjs";
import { ls, ss } from  "/app/modules/storage.mjs";
import { h } from "/app/modules/h.mjs";
import { blog_his } from "/app/modules/components.mjs";
import { idb } from "/app/modules/idb.mjs";
import { enc } from "/app/modules/enc.mjs";

//utils.load_cached({index: 'cache', id: "discus_count", })

const utils = {
  rnd(items){
    return items[Math.floor(Math.random()*items.length)];
  },
  get(src, cb){

    fetch('./app/'+ src +'.json', {
      method: 'GET',
      headers: g.headers.json
    })
    .then(function(res){

      if (res.status >= 200 && res.status < 300) {
        return res.json().then(function(data){
          cb(false, data)
        });
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .catch(function(err){
      cb(err);
    })

  },
  rest(src, cb){

    fetch('./api/'+ src +'.json', {
      method: 'GET',
      headers: g.headers.json
    })
    .then(function(res){

      if (res.status >= 200 && res.status < 300) {
        return res.json().then(function(data){
          cb(false, data)
        });
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .catch(function(err){
      cb(err);
    })

  },
  d_check(){
    var accepted_domains=new Array("wsabstract.com","javascriptkit.com")

    var domaincheck=document.location.href //retrieve the current URL of user browser
    var accepted_ok=false //set acess to false by default

    if (domaincheck.indexOf("http")!=-1){ //if this is a http request
        for (r=0;r<accepted_domains.length;r++){
            if (domaincheck.indexOf(accepted_domains[r])!=-1){ //if a match is found
                accepted_ok=true //set access to true, and break out of loop
                break
            }
        }
    }
    else
        accepted_ok=true

    if (!accepted_ok){
        alert("You\'re not allowed to directly link to this .js file on our server!")
        history.back(-1)
    }
  },
  add_hitcount(config, cb){
    if(!config.nomatec_rest.hitcount.enabled){
      return cb(false)
    }

    idb.get({index: 'cache', id: 'hitcount'}, function(err,res){
      if(err || !res || res.date < Date.now()){
        let obj = {
          id: 'hitcount'
        }
        g.cl('updating hitcount db...');
        fetch(config.nomatec_rest.hitcount.db_url, {
          method: 'GET',
          headers: g.headers.json_cors
        })
        .then(function(res){
          if (res.status >= 200 && res.status < 300) {
            return res.text();
          } else {
            return Promise.reject(new Error(res.statusText))
          }
        })
        .then(function(data) {
          obj.data = JSON.parse(data);
          obj.date = (Date.now() + config.nomatec_rest.hitcount.max_age)
          idb.add({index: 'cache', data: obj, put: true}, function(err){
            if(err){return cb('unable to add hitcount')}
            cb(false)
          })
        })
        .catch(function(err){
          obj.data = {};
          obj.date = 1;
          idb.add({index: 'cache', data: obj, put: true}, function(err){
            if(err){return cb('unable to add hitcount')}
            cb(false)
          })
          cb(err);
        })
      } else {
        g.cl('hitcount db loaded.');
        cb(false)
      }

    })

  },
  add_hit(config, item, cb){

    item = JSON.stringify(item);

    if(!config.nomatec_rest.hitcount.enabled){

      idb.get({index: 'cache', id: 'viewed'}, function(err,view_arr){
        if(err || !view_arr){
          g.cl('repairing viewed db...')
          view_arr = {id: 'viewed', data:[]};
        }

        if(view_arr.data.indexOf(item) === -1){
          view_arr.data.push(item)
          idb.add({index: 'cache', data: view_arr, put: true}, function(err){
            if(err){return g.ce('viewed db update error')}
            return cb(false);
          })
        } else {
          return cb(false);
        }

      })

    } else {

      idb.get({index: 'cache', id: 'viewed'}, function(err,view_arr){
        if(err || !view_arr){
          g.cl('repairing viewed db...')
          view_arr = {id: 'viewed', data:[]};
        }

        if(view_arr.data.indexOf(item) === -1){

          let rurl = config.nomatec_rest.base_url + '/hit';

          fetch(rurl, {
            method: 'POST',
            headers: g.headers.json_cors,
            body: JSON.stringify({key: config.nomatec_rest.hitcount.api, item: item})
          }).then(function(res) {
            if (res.status >= 200 && res.status < 300) {
              return res.json();
            } else {
              return Promise.reject(new Error(res.statusText))
            }
          }).then(function(data) {
            idb.get({index: 'cache', id: 'hitcount'}, function(err,res){
              if(err || !res){
                res = {id: 'hitcount', data: {}}
                g.cl('repairing hits db...');
              }

              if(res.data[item]){
                res.data[item]++;
              } else {
                res.data[item] = 1;
              }

              idb.add({index: 'cache', data: res, put: true}, function(err){
                if(err){return g.ce('hits db update error')}
                g.cl('hits db update success')
                view_arr.data.push(item);
                idb.add({index: 'cache', data: view_arr, put: true}, function(err){
                  if(err){return g.ce('viewed db update error')}
                  return cb(false);
                })

              })

            })
          }).catch(function(err) {
            cb(err)
          })

        } else {
          cb(false)
        }

      })

    }
  },
  add_theme(data, toAdd, css, cb){
    //console.log(toAdd)

    let themeURL = URL.createObjectURL(data),
    cnf = {
      link: h('link',{
        rel: 'stylesheet',
        href: ''
      })
    },
    item;

    if(toAdd){
      document.head.append(
        h('link#theme',{
          rel: 'stylesheet',
          href: themeURL
        })
      )

    } else {
      document.getElementById('theme').href = themeURL;
    }

    for (let i = 0; i < css.length; i++) {
      item = cnf.link.cloneNode(true);
      item.href = './app/css/'+ css[i].title + '.css';
      document.head.append(item)
    }

    cb()

  },
  update_theme(src, title, cb){

    fetch(src, {
      method: 'GET',
      headers: g.headers.css_cors
    })
    .then(function(res){

      if (res.status >= 200 && res.status < 300) {
        return res.text();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {

      enc.sha({hash: '512', data: data}, function(err, hash){
        if(err){return cb(err)};
        let obj = {
          id: 'theme',
          data: new Blob([data], {type : 'text/css; charset=utf-8'}),
          hash: hash,
          title: title
        }
        idb.add({index: 'cache', data: obj, put: true}, function(err){
          if(err){return cb('unable to update theme')}
          g.cl('theme updated');
          cb(false, obj)
        })
      })

    })
    .catch(function(err){
      cb(err);
    })
  },
  detect_crawler(cb){
    let bot_test = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|linkedin|Facebot|Twitterbot/i.test(navigator.userAgent);
    if(bot_test){
      fetch('./app/config/crawler.json', {
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

        let obj = {
          bot_div: h('div#bot-net'),
          bot_link: h('a'),
          orig: location.origin,
          clone_link: null
        }
        for (let i = 0; i < data.length; i++) {
          obj.clone_link = obj.bot_link.cloneNode();
          obj.clone_link.href = obj.orig + data[i];
          obj.bot_div.append(obj.clone_link);
        }
        document.body.append(obj.bot_div);
        //obj = null;
        ss.set('is_bot', true);
        cb();
      })
      .catch(function(err) {
        console.log('Request failed', err);
      });
    } else {
      return cb();
    }
  },
  prop_meta(i,e){
    return h('meta', {
      itemprop: i,
      content: e
    })
  },
  prop_org(org_cnf){
    return h('span', {
        itemprop: 'publisher',
        itemscope: '',
        itemtype: 'https://schema.org/Organization'
      },
      h('span', {
          itemprop: 'logo',
          itemscope: '',
          itemtype: 'https://schema.org/ImageObject'
        },
        utils.prop_meta('url', org_cnf.img),
        utils.prop_meta('width', org_cnf.width),
        utils.prop_meta('height', org_cnf.height)
      ),
      utils.prop_meta('name', org_cnf.name)
    )
  },
  format_date(i){
    let date = new Date(i),
    dd = date.getDate(),
    mm = date.getMonth()+1,
    yyyy = date.getFullYear();

    if(dd < 10){
      dd = '0' + dd
    }

    if(mm < 10){
      mm = '0' + mm
    };

    return [yyyy, mm, dd].join('-')
  },
  get_year(){
    let d = new Date();
    return d.getFullYear();
  },
  load_cached(obj){
    idb.get({index: obj.index, id: obj.id}, function(err,res){
      if(err || !res){return main.remove();}

    })
  },
  empty(i){
    while (i.firstChild) {
      i.removeChild(i.firstChild);
    }
  },
  detect_device(cb){
    var isMobile = false;
    (function (a) {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) isMobileOnly = true})(navigator.userAgent || navigator.vendor || window.opera);

    return isMobile


    for (let i = 0; i < array.length; i++) {
      // body...
    }
  },
  hashchange(){
    window.dispatchEvent(
      new HashChangeEvent("hashchange")
    )
  },
  debounce(func, wait, immediate) {
  	var timeout;
  	return function() {
  		var context = this, args = arguments;
  		var later = function() {
  			timeout = null;
  			if (!immediate) func.apply(context, args);
  		};
  		var callNow = immediate && !timeout;
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait);
  		if (callNow) func.apply(context, args);
  	};
  },
  capitalize(str) {
   try {
     let x = str[0] || str.charAt(0);
     return x  ? x.toUpperCase() + str.substr(1) : '';
   } catch (err) {
     if(err){return str;}
   }
  },
  is_email(email){
   if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
     return true;
    }
    return false;
  },
  is_letters(txt){
    if(txt.match(/^[A-Za-z]+$/)){
      return true;
    }
    return false;
  },
  is_alphanumeric(txt){
    if(txt.match(/^[0-9a-zA-Z]+$/)) {
      return true;
    }
    return false;
  },
  snake_case(str){
    try {
      return str.replace(/ /g, '_');
    } catch (err) {
      if(err){return str;}
    }
  },
  un_snake_case(str){
    try {
      return str.replace(/_/g, ' ');
    } catch (err) {
      if(err){return str;}
    }
  },
  formatBytes(bytes, decimals) {
    if (bytes === 0) return '0 Bytes';

    let k = 1024,
    dm = decimals < 0 ? 0 : decimals,
    sizes = ['Bytes', 'KB', 'MB', 'GB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  ts2datetime(i){
    return new Date(i).toLocaleString()
  },
  ts2date(i){
    return new Date(i).toLocaleDateString()
  },
  ms2dh(ms){
    let days = Math.floor(ms / (24*60*60*1000)),
    daysms = ms % (24*60*60*1000),
    hours = Math.floor((daysms)/(60*60*1000)),
    hoursms = ms % (60*60*1000),
    minutes = Math.floor((hoursms)/(60*1000));
    return [days,hours,minutes].join(':');
  },
  getPostByDate(i){
    let src = new Date(i).toDateString().toLowerCase().split(' ').slice(1)
    src = ['', 'post', src[2], src[0], i].join('/')
    return src;
  },
  getNewsByDate(i){
    let src = new Date(i).toDateString().toLowerCase().split(' ').slice(1)
    src = ['', 'entries', src[2], i].join('/')
    return src;
  },
  add_history(items, dest){
    let item = h('div#'+ dest +'list.card-body');

    for (let i = 0; i < items.length; i++) {
      item.append(new blog_his(items[i]))
    }

    dest = document.getElementById(dest +'list');
    dest.parentNode.replaceChild(item, dest)

  },
  del_saved(sel, main, obj){

    idb.get({index: 'saved', id: sel}, function(err,res){
      if(err || !res){return main.remove();}

      let arr = [],
      c_date = Date.now();

      for (let i = 0; i < res.items.length; i++) {
        if(res.items[i].id !== obj.id){
          arr.push(res.items[i]);
        }
      }

      res.items = arr;
      res.date = c_date

      idb.add({index: 'saved', data: res, put: true}, function(err){
        if(err){return g.ce('unable to update idb')}
        document.getElementById('item_count').innerText = ['Showing', res.items.length, 'items'].join(' ');
        return main.remove();
      })
    })
  },
  sort_favorites(item, config){

    item.setAttribute('disabled', true);
    utils.empty(item);
    item.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Saving...');
    idb.get({index: 'saved', id: 'favorite'}, function(err,res){
      if(err || !res){res = {id: 'favorite', items:[]}}
      let obj = ls.get('history')[0],
      arr = [],
      c_date = Date.now();

      for (let i = 0; i < res.items.length; i++) {
        if(res.items[i].id !== obj.id){
          arr.push(res.items[i]);
        }
      }

      obj.max_age = (c_date + config.favorite_db.max_age);
      arr.unshift(obj);

      if(arr.length > config.favorite_db.max){
        arr = arr.slice(0, config.favorite_db.max);
      }

      ls.set('favorite', arr.slice(0, config.favorite_max));
      utils.add_history(arr, 'fav');

      res.items = arr;
      res.date = c_date

      idb.add({index: 'saved', data: res, put: true}, function(err){
        if(err){
          setTimeout(function(){
            utils.empty(item);
            return item.innerText = 'Save Error';
          },500);
          return;
        }
        setTimeout(function(){
          utils.empty(item);
          return item.innerText = 'Saved';
        },500);
      })
    })
  },
  sort_history:function(obj, cb){
    let items = [],
    cnf = ls.get('config'),
    history_max = cnf.history_max,
    db_his = cnf.history_db,
    c_date = Date.now(),
    arr;

    idb.get({index: 'saved', id: 'history'}, function(err,res){
      if(err || !res){res = {id: 'history', items:[]}}

      if(!ls.get('history') && res.items.length < 1){
        arr = [];
      } else {
        arr = ls.get('history') || res.items.slice(0,5);
      }

      for (let i = 0; i < arr.length; i++) {
        if(arr[i].id !== obj.id){
          items.push(arr[i]);
        }
      }

      items.unshift(obj);
      if(items.length > history_max){
        items = items.slice(0, history_max);
      }

      ls.set('history', items);
      utils.add_history(items, 'his');

      arr = [];

      for (let i = 0; i < res.items.length; i++) {
        if(res.items[i].id !== obj.id){
          arr.push(res.items[i]);
        }
      }

      obj.max_age = (c_date + db_his.max_age);
      arr.unshift(obj);

      if(arr.length > db_his.max){
        arr = arr.slice(0, db_his.max);
      }

      res.items = arr;

      idb.add({index: 'saved', data: res, put: true}, function(err){
        if(err){return cb('unable to update idb history')}
        return cb(false)
      })


    })

  },
  totop(i){
    window.scroll({
      top: i,
      left: 0,
      behavior: 'smooth'
    });
  },
  append_feed_item(feedarr, obj, feedcnf){
    let item = h('option'),
    title = 'blog_'+ obj.type +'.' + feedarr;
    if(obj.ext){
      title+= '.'+ obj.ext;
    }
    item.value = title;
    item.innerText = title;
    item.onclick = function(){
      let dest = [location.origin, 'api/feed/'+ obj.type, this.value].join('/');
      document.getElementById(obj.type + '_download').href = dest;
      document.getElementById('blog_'+ obj.type +'_url').value = dest;
      for (let i = 0; i < feedcnf[obj.type].length; i++) {
        if(feedcnf[obj.type][i].title === this.value){
          for (let val in feedcnf[obj.type][i]) {
            if(val === 'date'){
              document.getElementById('blog_'+ obj.type +'_'+ val).value = utils.ts2datetime(feedcnf[obj.type][i][val])
            } else if(val === 'size'){
              document.getElementById('blog_'+ obj.type +'_'+ val).value = utils.formatBytes(feedcnf[obj.type][i][val], 3);
            } else if(val !== 'title'){
              document.getElementById('blog_'+ obj.type +'_'+ val).value = feedcnf[obj.type][i][val];
            }
          }
        }
      }
    }
    return item;
  },
  calc_showing(len, ttl){
    const pag_chunk = ls.get('config').paginate_max,
    pag = ss.get('pag-current'),
    min = ((pag -1) * pag_chunk) + 1,
    count = ss.get('pag-count'),
    max = (min + len - 1);
    return ['Showing', min, 'to', max, 'of', count, ttl].join(' ')
  },
  sort_type(sort_order){
    let sort_arr = ['newest', 'oldest'],
    sort_sel = h('select.form-control.form-control-sm', {
      onchange(){
        ls.set('nomatec_sort', this.value);
        utils.hashchange();
      }
    }),
    op = h('option'),
    newop;
    if(sort_order === 'oldest'){
      sort_arr.reverse();
    }

    for (let i = 0; i < sort_arr.length; i++) {
      newop = op.cloneNode(true);
      newop.value = sort_arr[i];
      newop.innerText = sort_arr[i];
      sort_sel.append(newop);
      if(i === (sort_arr.length -1)){
        op = null;
        newop = null;
      }
    }
    return sort_sel;
  },
  fade_out(obj){
    setTimeout(function(){
      let count = 0.9,
      evt = setInterval(function(){
        count = (count - 0.1).toFixed(1);
        obj.ele.style.opacity = count;
        if(count === '0.0'){
          clearInterval(evt);
          if(obj.remove){
            obj.ele.remove();
          }
        }
      },obj.duration * 100 || 100)
    },obj.delay * 1000 || 0)
  },
  menu_rout(dest, src){
    location.hash = dest;
    utils.totop(0);
    document.getElementById(src).classList.remove('show');
  },
  toggle_sb(ele){
    ele.classList.toggle('show');
    document.getElementById('side-content').classList.toggle('show')
  }
}

export { utils }

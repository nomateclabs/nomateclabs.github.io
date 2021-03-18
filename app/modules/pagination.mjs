import { workers } from "/app/modules/workers.mjs";
import { global as g } from  "/app/modules/global.mjs";
import { h } from "/app/modules/h.mjs";
import { utils } from  "/app/modules/utils.mjs";
import { ss } from  "/app/modules/storage.mjs";

const pagination = {
  set_active: function(item, max){

    let items = document.getElementsByClassName('pag-num');
    for (let i = 0; i < items.length; i++) {
      items[i].parentNode.classList.remove('active')
    }

    item.parentNode.classList.add('active');
    document.getElementById('pagnum').innerText = item.innerText;

  },
  pag_back: function(max, ptype){
    let item = h('li.page-item',
      h('div.page-link.pag-num.cp', {
        onclick: function(){
          if(ss.get('pag-current') === 1){
            return;
          }

          utils.totop(80);

          let items = document.getElementsByClassName('pag-num');

          if(ss.get('pag-current') !== 2 && parseInt(items[0].innerText) !== 1){
            for (let i = 0; i < items.length; i++) {
              items[i].innerText = parseInt(items[i].innerText) - 1;
            }
            pagination.set_active(items[1])
            items = parseInt(items[1].innerText);
          } else {
            pagination.set_active(items[0])
            items = parseInt(items[0].innerText);
          }

          ss.set('pag-current', items);
          workers.fetch_item({type:ptype, page: items, dest: dest});

        }
      },'1')
    )
    return item;
  },
  pageItem: function(max, i, dest, ptype){

    let item = h('li.page-item',
      h('div.page-link.pag-num.cp', {
        onclick: function(){
          let ipag = parseInt(this.innerText);
          if(ss.get('pag-current') === ipag){
            return;
          }

          utils.totop(80);

          ss.set('pag-current', ipag)
          workers.fetch_item({type:ptype, page: ipag, dest: dest});
          pagination.set_active(this)

        }
      },i)
    )
    return item;
  },
  pag_forw: function(max, ptype){
    let item = h('li.page-item',
      h('div.page-link.pag-num.cp', {
        onclick: function(){
          let items = document.getElementsByClassName('pag-num');
          if(ss.get('pag-current') === max){
            return;
          }

          utils.totop(80);

          if(ss.get('pag-current') !== (max - 1) && parseInt(items[4].innerText) !== max){
            for (let i = 0; i < items.length; i++) {
              items[i].innerText = parseInt(items[i].innerText) + 1;
            }
            pagination.set_active(items[3])
            items = parseInt(items[3].innerText);
          } else {
            pagination.set_active(items[4])
            items = parseInt(items[4].innerText);
          }

          ss.set('pag-current', items);
          workers.fetch_item({type:ptype, page: items, dest: dest});


        }
      },'5')
    )

    return item;
  },
  prevlink: function(max,ptype){
    let item = h('li.page-item',
      h('div.page-link.cp', {
        onclick: function(){
          let items = document.getElementsByClassName('pag-num');
          if(ss.get('pag-current') === 1 || parseInt(items[0].innerText) < 5){
            return;
          }

          utils.totop(80);

          for (let i = 0; i < items.length; i++) {
            items[i].innerText = parseInt(items[i].innerText) - 5;
          }

          pagination.set_active(items[4])
          items = parseInt(items[4].innerText);
          ss.set('pag-current', items);
          workers.fetch_item({type:ptype, page: items, dest: dest});

        }
      },'Prev')
    )

    return item;
  },
  nextlink: function(max, ptype){
    let item = h('li.page-item',
      h('div.page-link.cp', {
        onclick: function(){
          let items = document.getElementsByClassName('pag-num');
          if(ss.get('pag-current') === max  || parseInt(items[4].innerText) > (max - 5)){
            return;
          }

          utils.totop(80);

          for (let i = 0; i < items.length; i++) {
            items[i].innerText = parseInt(items[i].innerText) + 5;
          }

          pagination.set_active(items[0])
          items = parseInt(items[0].innerText)
          ss.set('pag-current', items)
          workers.fetch_item({type:ptype, page: items, dest: dest});

        }
      },'Next')
    );

    return item;
  },
  init: function(pag_dest, ptype, cb){
    let dest = ['./api/data', pag_dest, 'index.json'];

    fetch(dest.join('/'), {
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
      let max = data.pagination.pages;
      ss.set('pag-current', 1);
      ss.set('pag-max', max);
      ss.set('pag-count', data.pagination.count);
      let item;

      if(max < 6){
        item = h('ul.pagination');
        for (let i = 0; i < max; i++) {
          item.append(pagination.pageItem(max,g.js(i + 1), pag_dest, ptype))
        }
      } else {
        item = h('ul.pagination',
          pagination.prevlink(max, pag_dest, ptype),
          pagination.pag_back(max, pag_dest, ptype),
          pagination.pageItem(max,'2', ptype),
          pagination.pageItem(max,'3', ptype),
          pagination.pageItem(max,'4', ptype),
          pagination.pag_forw(max, pag_dest, ptype),
          pagination.nextlink(max, pag_dest, ptype)
        )
      }

      document.getElementById('pagination').append(item,h('div.pag-text', 'viewing page ', h('span#pagnum', '1'), ' of '+ max))
      cb(false);
    })
    .catch(function(err){
      return cb(err)
    })

  }
}

export { pagination }

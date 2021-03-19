import { h } from "/app/modules/h.mjs";
import { global as g } from  "/app/modules/global.mjs";
import { utils } from  "/app/modules/utils.mjs";
import { sidebar } from '/app/modules/sidebar.mjs';
import { workers } from "/app/modules/workers.mjs";
import { events } from "/app/modules/events.mjs";
import { enc } from "/app/modules/enc.mjs";
import { ls } from  "/app/modules/storage.mjs";
import { bot_net, rest_range, bread_crumb, welcome_msg, search_box, blog_prev } from "/app/modules/components.mjs";

const tpl = {
  build(config){
    let sidesel = h('div.row'),
    contype = 'container-fluid',
    bc = h('div.row',
      new bread_crumb(config.navlinks[0])
    )

    if(config.sb_first){
      sidesel.append(tpl.sidebar(config), h('div#main-content.col-lg-9'), h('span#menu_right.icon-menu.menu-link.float-right',{
        onclick(){
          utils.toggle_sb(this)
        }
      }))
    } else {
      sidesel.append(h('div#main-content.col-lg-9'), tpl.sidebar(config),h('span#menu_right.icon-menu.menu-link.float-right',{
        onclick(){
          utils.toggle_sb(this)
        }
      }))
    }

    if(config.main_container){
      contype = 'container'
    }

    sidesel = h('div.app-main.'+ contype, sidesel);

    if(config.welcome_back && ls.get('welcome_msg')){
      bc.append(new welcome_msg(config.welcome_back_msg, ls.get('welcome_msg')))
    } else {
      if(config.user_config){
        //bc.append(new user_cnf(ls.get('nomatec_user_cnf')))
      }
    }

    ls.set('welcome_msg', Date.now());

    return h('div',
      new bot_net(),
      h('img#para', {src: config.img.bg}),
      tpl.sidebar_nav(config),
      tpl.navbar(config),

      h('div.container-fluid.h12',
        h('div.header-main', bc)

      ),
      sidesel,
      tpl.rest_signup(config.nomatec_rest),
      tpl.footer(config),
      tpl.analytics(config)
    )

  },
  analytics(config){


      if(typeof Tawk_API === 'undefined'){
        window.Tawk_API = {};
      }

      window.Tawk_LoadStart = new Date();

      return h('script', {
        src: [config.tawk.url,config.tawk.api].join('/'),
        charset: 'UTF-8',
        crossorigin: '*',
        defer: ''
      })


  },
  footer(){

    let config = ls.get('config'),
    footer_left = h('div.col-md-6.foot-links'),
    footer_right = footer_left.cloneNode(true),
    footer_left_links = config.footer_nav.left,
    footer_right_links = config.footer_nav.right,
    copyright = config.copyright_msg.replace('{{year}}', utils.get_year());

    footer_left.classList.add('text-left');
    footer_right.classList.add('text-right');

    tpl.footer_links(footer_left, footer_left_links);
    tpl.footer_links(footer_right, footer_right_links);

    return h('div.footer',
      h('div.w-90',
        h('div.row',
          h('div#copyright.col-12.text-center',
            h('p', copyright),
            h('p', 'ABN: '+ config.app.abn)
          ),
          footer_left,
          footer_right
        )
      )
    )
  },
  sidebar(config){
    let sb_main = h('div#sidebar-main');

    if(config.search.enabled){
      sb_main.append(new search_box(config.search))
    }

    if(config.settings.enabled){
      sb_main.append(sidebar.site_settings(config))
    }

    for (let i in config.sidebar) {
      if(config.sidebar[i]){
        sb_main.append(sidebar[i]())
      }
    }

    return h('div#side-content.col-lg-3.hidden',
      sb_main
    )

  },
  sidebar_nav(config){
    let sb_nav = h('div#sidebar-nav-content'),
    cattag = ['categories', 'tags'],
    pag_lnks = config.navlinks.concat(cattag),
    obj = Object.assign({}, config.footer_nav.left, config.footer_nav.right);

    sb_nav.append(
      h('div.sb_nav_head',
        h('img', {
          src: config.logo.base
        }),
        h('span', config.app.title)
      )
    )

    for (let i = 0; i < pag_lnks.length; i++) {
      sb_nav.append(
        h('div.sb_nav_lnk', {
          onclick(){
            let dest = '/'
            if(cattag.indexOf(pag_lnks[i]) !== -1){
              dest+= 'list/'
            }
            utils.menu_rout(dest + pag_lnks[i], 'sidebar-nav');
          }
        }, utils.un_snake_case(pag_lnks[i]), h('span.icon-right-open.float-right'))
      )
    }

    for (let key in obj) {
      sb_nav.append(
        h('div.sb_nav_lnk', {
          onclick(){
            utils.menu_rout('/' + key, 'sidebar-nav');
          }
        }, obj[key], h('span.icon-right-open.float-right'))
      )
    }

    return h('div#sidebar-nav',
      sb_nav
    )

  },
  navbar(config){
    let navul = h('ul.navbar-nav.nav-lnks'),
    lnks = config.navlinks;

    for (let i = 0; i < lnks.length; i++) {
      navul.append(
        h('a.nav-link', {
          onclick(){
            location.hash = '/'+ lnks[i]
          }
        },config.navlinks[i])
      )
    }

    return h('nav#top-nav.navbar.navbar-expand-lg.navbar-light.bg-light.sticky-top',
      h('div.container-fluid',
        h('div.navbar-brand.nav-alt',
          h('span#menu_left.icon-menu.menu-link.float-left',{
            onclick(){
              document.getElementById('sidebar-nav').classList.toggle('show')
            }
          }),
          h('span.d-none.d-lg-block.d-xl-block.logo-m',
            h('span.d-inline-block',
              h('img.img-fluid', {src: config.logo.base})
            ),
            h('span.anc-fnt', 'Nomatec Labs')
          ),
          h('span',
            h('span.anc-m.d-lg-none.d-xl-none', 'Nomatec Labs')
          )
        ),
        navul
      )
    )

  },
  blog(sort_order){

    let div = h('div'),
    main_sub = div.cloneNode(),
    div_arr = ['postlist', 'pagination'],
    config = ls.get('config'),
    newdiv;

    for (let i = 0; i < div_arr.length; i++) {
      newdiv = div.cloneNode();
      newdiv.id = div_arr[i];
      main_sub.append(newdiv)
    }

    newdiv = null;



    return h('div.container-fluid',
      h('div.row',
        h('div.col-6',
          h('h3#pag_info','')
        ),
        h('div.col-6',
          h('div.form-group.float-right',
            utils.sort_type(sort_order)
          )
        )
      ),
      main_sub
    )

  },
  history(res){

    let item = h('div'),
    config = ls.get('config'),
    c_path = ls.get('path')[0];

    for (let i = 0; i < res.items.length; i++) {
      res.items[i].del_item = true;
      res.items[i].del_type = c_path;
      res.items[i].date = res.items[i].id;
      item.append(new blog_prev(res.items[i], config))
    }

    if(config.comments.enabled){

    }

    return h('div.container-fluid',
      h('div.row',
        h('div.col-6',
          h('h3', [utils.capitalize(c_path), 'items'].join(' '))
        ),
        h('div.col-6',
          h('h5#item_count.text-right', ['Showing', res.items.length, 'items'].join(' '))
        )
      ),
      item
    )
  },
  news(sort_order){

    return h('div.container-fluid',
      h('div.row',
        h('div.col-6',
          h('h3#pag_info','')
        ),
        h('div.col-6',
          h('div.form-group.float-right',
            utils.sort_type(sort_order)
          )
        )
      ),
      h('div',
        h('div#newslist'),
        h('div#pagination')
      )
    )
  },
  post(){
    return h('p', 'working')
  },
  search(){
    return h('p', 'working')
  },
  author(obj){
    let data = obj.data;
    let auth_data = h('div.row',
      h('div.col-12',
        h('img.img-thumbnail.mx-auto.d-block', {
          src: data.image
        }),
        h('h3.text-center.mb-4.mt-2', data.author),
        h('hr')
      )
    )

    data.first_post = utils.ts2datetime(data.first_post);
    data.last_post = utils.ts2datetime(data.last_post)

    function return_input_data(ele, title, text){
      if(ele === 'input'){
        return h('div.col-lg-6',
          h('div.form-group',
            h('label', title.replace('_', ' ')),
            h('input.form-control.mb-2', {
              type: 'text',
              readOnly: true,
              value: text
            })
          )
        )
      } else {
        return h('div.col-12',
          h('div.form-group',
            h('label', title),
            h('textarea.form-control.mb-2', {
              readOnly: true,
              value: text
            })
          )
        )
      }
    }

    for (let val in data) {
      if(['author', 'image'].indexOf(val) === -1){
        if(val === 'details'){
          auth_data.append(return_input_data('textarea', val, data[val]))
        } else {
          auth_data.append(return_input_data('input', val, data[val]))
        }
      }

    }

    return h('div.container-fluid',
      auth_data,
      h('div.row',
        h('div.col-6',
          h('h3#pag_info','')
        ),
        h('div.col-6',
          h('h5.float-right', 'Author: '+ ls.get('path')[1])
        )
      ),
      h('div',
        h('div#'+ obj.type +'list'),
        h('div#pagination')
      )
    )
  },
  categories(obj){
    return h('div.container-fluid',
      h('div.row',
        h('div.col-6',
          h('h3#pag_info','')
        ),
        h('div.col-6',
          h('h5.float-right', 'Category: '+ ls.get('path')[1])
        )
      ),
      h('div',
        h('div#'+ obj.type +'list'),
        h('div#pagination')
      )
    )
  },
  tags(){
    return h('div.container-fluid',
      h('div.row',
        h('div.col-6',
          h('h3#pag_info','')
        ),
        h('div.col-6',
          h('h5.float-right', 'Tag: '+ ls.get('path')[1])
        )
      ),
      h('div',
        h('div#postlist'),
        h('div#pagination')
      )
    )
  },
  timeline(){
    return h('div.container-fluid',
      h('div.row',
        h('div.col-6',
          h('h3#pag_info','')
        ),
        h('div.col-6',
          h('h5.float-right', 'Timeline: ')
        )
      ),
      h('div',
        h('div#postlist'),
        h('div#pagination')
      )
    )
  },
  feed(feedcnf){

    let feed_select = h('select.form-control', {
      size: 6
    }),
    feed_select2 = feed_select.cloneNode(true),
    feed_select3 = feed_select.cloneNode(true),
    feed_select4 = feed_select.cloneNode(true),
    feed_select5 = feed_select.cloneNode(true),
    feedarr = feedcnf.types,
    setarr = [{
      dest: feed_select,
      type: 'post_dump',
      ext: false
    },{
      dest: feed_select,
      type: 'post_dump',
      ext: 'tgz'
    },{
      dest: feed_select,
      type: 'post_dump',
      ext: 'zip'
    },{
      dest: feed_select2,
      type: 'post_recent',
      ext: false
    },{
      dest: feed_select2,
      type: 'post_recent',
      ext: 'tgz'
    },{
      dest: feed_select2,
      type: 'post_recent',
      ext: 'zip'
    },{
      dest: feed_select3,
      type: 'news_dump',
      ext: false
    },{
      dest: feed_select3,
      type: 'news_dump',
      ext: 'tgz'
    },{
      dest: feed_select3,
      type: 'news_dump',
      ext: 'zip'
    },{
      dest: feed_select4,
      type: 'news_recent',
      ext: false
    },{
      dest: feed_select4,
      type: 'news_recent',
      ext: 'tgz'
    },{
      dest: feed_select4,
      type: 'news_recent',
      ext: 'zip'
    },{
      dest: feed_select5,
      type: 'gallery_dump',
      ext: false
    },{
      dest: feed_select5,
      type: 'gallery_dump',
      ext: 'tgz'
    },{
      dest: feed_select5,
      type: 'gallery_dump',
      ext: 'zip'
    }]

    for (let i = 0; i < feedarr.length; i++) {
      for (let x = 0; x < setarr.length; x++) {
        setarr[x].dest.append(
          utils.append_feed_item(feedarr[i], {type: setarr[x].type, ext: setarr[x].ext}, feedcnf)
        )
      }
    }

    function return_input(id, text){
      return h('input#'+ id +'.form-control.mb-2', {
        type: 'text',
        readOnly: true,
        placeholder: text
      })
    }

    function return_row(sel, x, text){
      return h('div',
        h('div.row',
          h('div.col-6',
            h('h3', utils.capitalize(x).replace('_', ' ') +' feed')
          ),
          h('div.col-md-6',
            h('span.float-left', 'updated '+ feedcnf.update_timespan[x]),
            h('a#'+ x +'_download.float-right',{
              target: '_blank'
            }, 'download')
          )
        ),
        h('div.row',
          h('div.col-md-6',
            h('div.form-group',
              sel
            )
          ),
          h('div.col-md-6',
            h('div.form-group',
              return_input('blog_'+ x +'_url', 'GET endpoint'),
              return_input('blog_'+ x +'_hash', 'SHA3-512'),
              h('div.row',
                h('div.col-6',
                  h('div.form-group',
                    return_input('blog_'+ x +'_size', 'size')
                  )
                ),
                h('div.col-6',
                  h('div.form-group',
                    return_input('blog_'+ x +'_date', 'date')
                  )
                )
              )
            )
          )
        )
      )
    }


    return h('div.feeddiv',
      return_row(feed_select, 'post_dump'),
      return_row(feed_select2, 'post_recent'),
      return_row(feed_select3, 'news_dump'),
      return_row(feed_select4, 'news_recent'),
      return_row(feed_select5, 'gallery_dump')
    )
  },
  rss_atom(obj){

    return h('div.container-fluid',
      h('div.row',
        h('div.col-12.h3', 'RSS'),
        tpl.feed_item({type: 'rss', name: 'rss post', src: 'posts'}),
        tpl.feed_item({type: 'rss', name: 'rss news', src: 'news'}),
        tpl.feed_item({type: 'rss', name: 'rss gallery', src: 'gallery'}),
        h('div.col-12',
          h('hr')
        ),
        tpl.feed_cat_item({type: 'rss', name: 'rss post category', src: 'posts', items: obj.post_cat}),
        tpl.feed_cat_item({type: 'rss', name: 'rss news category', src: 'news', items: obj.news_cat}),
        tpl.feed_cat_item({type: 'rss', name: 'rss author posts', src: 'author', items: obj.author_cat}),
        h('hr.w-100'),
        h('div.col-12.h3.mt-4', 'ATOM'),
        tpl.feed_item({type: 'atom', name: 'atom post', src: 'posts'}),
        tpl.feed_item({type: 'atom', name: 'atom news', src: 'news'}),
        tpl.feed_item({type: 'atom', name: 'atom gallery', src: 'gallery'}),
        h('div.col-12',
          h('hr')
        ),
        tpl.feed_cat_item({type: 'atom', name: 'atom post category', src: 'posts', items: obj.post_cat}),
        tpl.feed_cat_item({type: 'atom', name: 'atom news category', src: 'news', items: obj.news_cat}),
        tpl.feed_cat_item({type: 'atom', name: 'atom author posts', src: 'author', items: obj.author_cat})
      )
    );
  },
  api(api_cnf){

    let items_div = h('div.row',
      h('div.col-12.h3', ' JSON API')
    );

    for (let i = 0; i < api_cnf.length; i++) {
      items_div.append(tpl.api_item(api_cnf[i]))
    }

    return h('div.container',items_div);

  },
  api_item(obj){
    const base_url = location.origin;
    return h('div.list-group.col-12.mb-4',
      h('li.list-group-item.list-group-item-secondary', obj.description),
      h('li.list-group-item', base_url + obj.url),
      h('li.list-group-item',
        h('div.form-group',
          h('label.w-100', 'example: ',
            h('a.float-right',{target: '_blank', href: base_url + obj.example}, obj.example)
          ),
          h('textarea.form-control', {
            rows: 6
          }),
          h('button.btn.btn-outline-secondary.btn-sm.float-right.mt-2', {
            onclick(){
              let $this = this,
              dest = this.parentNode.childNodes[1];
              fetch(base_url + obj.example, {
                method: 'GET',
                headers: g.headers.json,
                referrer: 'no-referrer'
              }).then(function(res) {
                if (res.status >= 200 && res.status < 300) {
                  return res.json();
                } else {
                  return Promise.reject(new Error(res.statusText))
                }
              }).then(function(data) {
                dest.value = g.js(data,0,2);
                $this.remove()
              }).catch(function(err) {
                console.log('Request failed', err);
              });
            }
          },'fetch')
        )
      )
    )
  },
  error(){
    return h('p', 'page not found!')
  },
  footer_links(i,e){
    for (let item in e) {
      i.append(h('a.mr-1.ml-1.cp.foot-lnk', {
        onclick(){
          if(item.slice(0,4) !== 'http'){
            let dest = '/'
            if(['categories', 'tags'].indexOf(item) !== -1){
              dest+= 'list/'
            }
            location.hash = dest + item;
            utils.totop(80);
          } else {
            window.open(item)
          }

        }
      }, e[item].toUpperCase()))
    }
  },
  feed_item(obj){
    const dest = [location.origin, 'api', obj.type, obj.src +'.xml'].join('/');
    return h('div.col-6',
      h('h5', obj.name +' feed',
        h('small.float-right',
          h('a', {
            target: '_blank',
            href: dest
          }, 'hyperlink')
        )
      ),
      h('div.form-group',
        h('label', 'endpoint'),
        h('input.form-control', {
          type: 'text',
          readOnly: true,
          value: dest
        })
      )
    )
  },
  feed_cat_item(obj){

    function return_dest(cat){
      g.cl(obj.src)
      if(obj.src === 'author'){
        return [location.origin, 'api', obj.type, obj.src, 'posts', cat +'.xml'].join('/');
      }
      return [location.origin, 'api', obj.type, obj.src, 'category', cat +'.xml'].join('/');
    }

    let sel = h('select.custom-select', {
      size: 5,
      onchange(){
        this.parentNode.previousSibling.lastChild.firstChild.dataset.href = return_dest(this.value)
        this.nextSibling.value = return_dest(this.value)
      }
    }),
    op = h('option'),
    newop;

    for (let i = 0; i < obj.items.length; i++) {
      newop = op.cloneNode();
      newop.value = obj.items[i];
      newop.innerText = obj.items[i];
      sel.append(newop);
    }

    newop = null;

    return h('div.col-6',
      h('h5', obj.name +' feed',
        h('small.float-right.cp',
          h('span', {
            'data-href': '',
            onclick(){
              let dest = this.dataset.href;
              if(dest === ''){
                return
              }
              window.open(this.dataset.href)
            }
          }, 'hyperlink')
        )
      ),
      h('div.form-group',
        h('label', 'select category to generate endpoint'),
        sel,
        h('input.form-control.mt-2', {
          type: 'text',
          readOnly: true
        })
      )
    )
  },
  postpag(obj){
    let cpath = ls.get('path')[0],
    ctype  = 'post';
    if(cpath === 'entries'){
      ctype = 'entry';
    }
    return h('div.row',
      h('div.col-md-6',
        h('button.btn.btn-outline-primary.btn-sm.mr-2.sh-95', {
          onclick(){
            let dest;
            if(obj.prev_post === null){
              return this.setAttribute('disabled', true)
            }
            if(cpath === 'entries'){
              dest = utils.getNewsByDate(obj.prev_post);
            } else {
              dest = utils.getPostByDate(obj.prev_post);
            }
            location.hash = dest;
            return utils.totop(80);
          }
        },'Prev '+ ctype),
        h('button.btn.btn-outline-primary.btn-sm.mr-2.sh-95', {
          onclick(){
            let dest;
            if(obj.next_post === null){
              return this.setAttribute('disabled', true)
            }
            if(cpath === 'entries'){
              dest = utils.getNewsByDate(obj.next_post);
            } else {
              dest = utils.getPostByDate(obj.next_post);
            }
            location.hash = dest;
            return utils.totop(80);

          }
        },'Next '+ ctype)
      ),
      h('div.col-md-6',
        h('div.input-group.float-right.input-group-sm.mt-2.mb-2',
          h('input.form-control', {
            type: 'number',
            max: obj.total_posts,
            min: 1,
            value: obj.total_posts,
            title: 'jump to post item from 1 to '+ obj.total_posts
          }),
          h('div.input-group-append',
            h('button.btn.btn-outline-primary.btn-sm', {
              onclick(){
                let item = parseInt(this.parentNode.previousSibling.value),
                itype = 'post';
                if(cpath === 'entries'){
                  itype = 'news'
                }
                if(item > 0 && item <= obj.total_posts){
                  workers.fetch_item({type:'byindex', item: item, src: itype});
                }
              }
            },'jump to '+ ctype)
          )
        )
      )
    )

  },
  tagcat_search(title){

    return h('div.row',
      h('div.col-lg-6.mb-4',
        h('h3', title),
      ),
      h('div.col-lg-6.mb-4',
        h('div.form-group',
          h('input.form-control', {
            type: 'text',
            placeholder: 'Search '+ title,
            onkeyup(){
              let items = this.parentNode.parentNode.parentNode.nextSibling.children;
              for (let i = 0; i < items.length; i++) {
                if(!items[i].dataset.id.includes(this.value)){
                  items[i].classList.add('hidden');
                } else {
                  items[i].classList.remove('hidden');
                }
              }
            }
          })
        )
      )
    )
  },
  list(obj){

    let list_box = h('div.container');
    if(obj.type === 'tags'){
      list_box.append(
        tpl.tagcat_search('Post tags'),
        tpl.tagcat_list(obj.data.tag_len, '/tags', obj.type)
      )
    } else {
      list_box.append(
        tpl.tagcat_search('Post categories'),
        tpl.tagcat_list(obj.data.cat_len, '/categories', obj.type),
        h('hr'),
        tpl.tagcat_search('News categories'),
        tpl.tagcat_list(obj.data.news_len, '/news_categories', obj.type)
      )
    }

    return list_box;
  },
  tagcat_list(arr, path, dtype){

    let lgroup = h('div.row');

    for (let i = 0; i < arr.length; i++) {
      lgroup.append(tpl.tagcat_item(arr[i].item, arr[i].count, path, dtype))
    }

    return lgroup;
  },
  tagcat_item(title, count, path, dtype){
    let ico = 'tag';
    if(dtype === 'tags'){
      ico += 's'
    }

    let final = h('div.col-md-6', {
        'data-id': title
      },
      h('div.cattag-item.list-group-item.d-flex.justify-content-between.align-items-center.cp.mb-4',
        h('h6', h('span.icon-'+ ico +'.mr-4'), title),
        h('div',
          h('span.badge.badge-primary.badge-pill.mr-2', {
            title: count + ' posts'
          },count),
          h('span.icon-right-open')
        ),{
          onclick(){
            location.hash = [path, title].join('/')
          }
        }
      )
    )
    return final;
  },
  theme_mask(){
    return h('div#theme-mask',
      h('span',
        h('span.spinner-grow.spinner-grow-lg.mr-1'),
        h('h3', 'updating theme')
      )
    )
  },
  settings(){
    let config = ls.get('config'),
    current_theme = ls.get('nomatec_theme'),
    ctheme = h('input.form-control', {
      value: current_theme
    }),
    theme_sel = h('select.custom-select', {
      size: 6,
      onchange(){
        let val = this.value,
        dest = config.theme.links_url.replace('{{theme}}', val),
        new_mask = tpl.theme_mask();
        document.getElementById('sub-content').append(new_mask);
        utils.update_theme(dest, val, function(err,res){
          if(err){
            new_mask.firstChild.lastChild.innerText = 'Failed'
            utils.fade_out({
              ele: new_mask, remove: true, duration: 1, delay: 1
            })
            return g.cl(err)
          }
          g.cl(res)
          let t_link = document.getElementById('theme'),
          release_url = t_link.href,
          new_URL = URL.createObjectURL(res.data);
          t_link.href = new_URL;
          URL.revokeObjectURL(release_url);
          ctheme.value = val;
          ls.set('nomatec_theme', val);
          new_mask.firstChild.lastChild.innerText = 'Success'
          utils.fade_out({
            ele: new_mask, remove: true, duration: 1, delay: 2
          })

        })

      }
    }),
    theme_lnk = config.theme.links,
    op = h('option'),
    newop;

    if(!current_theme){
      current_theme = config.theme.base_theme;
      ls.set('nomatec_theme', current_theme);
    }

    for (let i = 0; i < theme_lnk.length; i++) {
      newop = op.cloneNode();
      newop.value = theme_lnk[i];
      newop.innerText = theme_lnk[i];
      theme_sel.append(newop);
    }

    let theme_div = h('div.row',
      h('div.col-md-6',
        h('label', 'Select theme'),
        theme_sel
      ),
      h('div.col-md-6',
        h('label', 'Current theme'),
        ctheme,
        h('button.btn.btn-outline-secondary.btn-sm.sh-95.mt-2.float-right', {
          onclick(){
            let val = config.theme.base_theme,
            new_mask = tpl.theme_mask();
            document.getElementById('sub-content').append(new_mask);
            utils.update_theme(config.theme.base_url, val, function(err,res){
              if(err){
                new_mask.firstChild.lastChild.innerText = 'Failed'
                utils.fade_out({
                  ele: new_mask, remove: true, duration: 1, delay: 1
                })
                return g.cl(err)
              }

              let t_link = document.getElementById('theme'),
              release_url = t_link.href,
              new_URL = URL.createObjectURL(res.data);
              t_link.href = new_URL;
              URL.revokeObjectURL(release_url);
              ctheme.value = val;
              ls.set('nomatec_theme', val);
              new_mask.firstChild.lastChild.innerText = 'Success'
              utils.fade_out({
                ele: new_mask, remove: true, duration: 1, delay: 2
              })
            })
          }
        }, 'Reset')
      )
    )

    let settings_base = h('div.container-fluid',
      h('h3', 'Site settings'),
      theme_div
    )
    return settings_base
  },
  rest_signup(config){

    return h('div.card#rest-signup',
      h('div.card-body',
        h('div.row',
          h('div.col-md-6.align-self-center',
            h('h3.text-center', 'signup to our news letter')
          ),
          h('div.col-md-6',
            h('form',
              h('div.input-group.input-group-sm.mb-3',
                h('div.input-group-prepend',
                  h('span.input-group-text', 'name')
                ),
                h('input.form-control', {
                  type: 'text'
                })
              ),
              h('div.input-group.input-group-sm.mb-3',
                h('div.input-group-prepend',
                  h('span.input-group-text', 'email')
                ),
                h('input.form-control', {
                  type: 'email'
                })
              )
            ),
            h('div.w-100',
              h('button.btn.btn-outline-primary.btn-sm.btn-block', {
                onclick(){
                  let dest = this.parentNode;
                  this.setAttribute('disabled', true);
                  utils.empty(this);
                  this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Loading...')
                  setTimeout(function(){
                    utils.empty(dest);
                    dest.append(new rest_range())
                  },3000)
                }
              },'i am not a robot')
            ),
            h('input.bnet', {
              type: 'text',
              onchange(){
                ls.set('is_bot', true);
              }
            }),
            h('button#rest-submit.btn.btn-outline-primary.btn-block.btn-sm.hidden', {
              type: 'button',
              onclick(){
                if(ls.get('is_bot')){
                  return;
                }
                if(this.previousSibling.value !== ''){
                  return ls.set('is_bot', true);
                }

                let $this = this,
                obj = {
                  name: $this.parentNode.firstChild.firstChild.lastChild.value,
                  email: $this.parentNode.firstChild.lastChild.lastChild.value
                },
                hdiv = $this.nextSibling;

                if(!utils.is_email(obj.email)){
                  hdiv.style.color = 'red';
                  return hdiv.innerText = 'invalid email address';
                }

                if(!utils.is_letters(obj.name)){
                  hdiv.style.color = 'red';
                  return hdiv.innerText = 'name can only contain letters';
                }

                this.setAttribute('disabled', true);

                utils.empty(this);
                this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Encrypting...')

                fetch('./app/config/cert.json', {
                  method: 'GET',
                  headers: g.headers.json
                }).then(function(res) {
                  if (res.status >= 200 && res.status < 300) {
                    return res.json();
                  } else {
                    return Promise.reject(new Error(res.statusText));
                  }
                }).then(function(rsakey) {
                  rsakey = rsakey.RSA_OAEP.subscribe;

                  enc.rsa_oaep_enc(rsakey, {data: JSON.stringify(obj), u8: false, sha: '512'}, function(err, ctext){
                    if(err){
                      g.ce(err)
                      return $this.innerHTML = 'unable to subscribe';
                    }
                    obj = {
                      data: enc.u82hex(ctext)
                    }

                    enc.sha({data: navigator.userAgent, hash: 256}, function(err, res){
                      if(err){
                        g.ce(err)
                        return $this.innerHTML = 'unable to subscribe';
                      }
                      obj.key = config.mail.subscribe + res;
                      setTimeout(function(){
                        utils.empty($this);
                        $this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Sending...')

                        fetch([config.base_url,'subscribe'].join('/'), {
                          method: 'POST',
                          headers: g.headers.json_cors,
                          body: JSON.stringify(obj)
                        }).then(function(res) {
                          if (res.status >= 200 && res.status < 300) {
                            return res.json();
                          } else {
                            return Promise.reject(new Error(res.statusText))
                          }
                        }).then(function(data) {
                          if(data.msg && data.msg !== ''){
                            setTimeout(function(){
                              $this.innerHTML = data.msg;
                              setTimeout(function(){
                                document.getElementById('rest-signup').remove();
                              },3000)
                            },1000)
                          } else {
                            $this.innerHTML = 'unable to subscribe'
                          }

                          if(data.success){
                            ls.set('is_subscribed', true)
                          }
                        }).catch(function(err){
                          g.ce(err)
                          $this.innerHTML = 'unable to subscribe'
                        })
                      },1000)


                    })
                  })

                }).catch(function(err){
                  g.ce(err)
                  $this.innerHTML = 'unable to subscribe'
                })

              }
            }, 'signup'),
            h('small.mt-2')
          )
        )
      )
    )
  },
  unsubscribe(){

    let hash = location.hash.split('/'),
    config = ls.get('config').nomatec_rest,
    hash_confirm = h('input.form-control.mb-4.is-invalid', {
      type: 'text',
      readOnly: true
    });

    if(hash.length !== 3 || ls.get('is_bot')){
      setTimeout(function(){
        location.hash = '/blog'
      },1000)
      return h('p', 'no subscription id found.');
    }
    hash = hash.pop();

    return h('div.container-fluid',
      h('div.row.justify-content-center',
        h('div.col-lg-8.col-md-10',
          h('div.card.mt-4',
            h('div.card-body',
              h('div.align-self-center',
                h('h3.text-center', 'Enter email address to unsubscribe')
              ),
              h('form.form-group',
                h('input.form-control.mb-4',{
                  onkeyup(){
                    let $this = this,
                    nextSib = this.nextSibling;

                    enc.sha({data: $this.value, hash: 256}, function(err, res){
                      if(err){return $this.value = 'unable to unsubscribe';}
                      nextSib.value = res;
                      if(res === hash){
                        nextSib.classList.remove('is-invalid');
                        nextSib.classList.add('is-valid');
                        $this.setAttribute('disabled', '');
                        nextSib.nextSibling.firstChild.removeAttribute('disabled');
                      }
                    })
                  }
                }),
                hash_confirm,
                h('div.w-100',
                  h('button.btn.btn-outline-primary.btn-block', {
                    disabled: true,
                    onclick(){
                      let dest = this.parentNode;
                      this.setAttribute('disabled', true);
                      utils.empty(this);
                      this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Loading...')
                      setTimeout(function(){
                        utils.empty(dest);
                        dest.append(new rest_range())
                      },3000)
                    }
                  },'i am not a robot')
                ),
                h('input.bnet', {
                  type: 'text',
                  onchange(){
                    return ls.set('is_bot', true);
                  }
                }),
                h('button#rest-submit.btn.btn-outline-primary.btn-block.hidden',{
                  type: 'button',
                  onclick(){

                    if(ls.get('is_bot')){
                      return;
                    }
                    if(this.previousSibling.value !== '' || hash_confirm.value !== hash){
                      return ls.set('is_bot', true);
                    }

                    let $this = this,
                    obj = {
                      hash: hash
                    },
                    hdiv = $this.nextSibling;

                    this.setAttribute('disabled', true);
                    utils.empty(this);
                    this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Sending...')

                    enc.sha({data: navigator.userAgent, hash: 256}, function(err, res){
                      if(err){return $this.innerHTML = 'unable to unsubscribe';}
                      obj.key = config.mail.unsubscribe + res;

                      fetch([config.base_url,'unsubscribe'].join('/'), {
                        method: 'POST',
                        headers: g.headers.json_cors,
                        body: JSON.stringify(obj)
                      }).then(function(res) {
                        if (res.status >= 200 && res.status < 300) {
                          return res.json();
                        } else {
                          return Promise.reject(new Error(res.statusText))
                        }
                      }).then(function(data) {
                        if(data.msg && data.msg !== ''){
                          setTimeout(function(){
                            $this.innerHTML = data.msg;
                            setTimeout(function(){
                              location.hash = '/blog';
                            },3000)
                          },1000)
                        } else {
                          $this.innerHTML = 'unable to unsubscribe'
                        }

                        if(data.success){
                          ls.set('is_subscribed', false)
                        }
                      }).catch(function(err){
                        $this.innerHTML = 'unable to unsubscribe'
                      })

                    })

                    return hdiv.innerText = ''

                  }
                }, 'Unsubscribe'),
                h('small.mt-2')
              )
            )
          )
        )
      )
    )
  },
  sitemap_lg_item(i, e) {
    return h('div.list-group-item',
      h('div.row',
        h('div.col-6.text-left', i),
        h('div.col-6.text-right',
          h('a', {
            href: [location.origin, '#', e].join('/')
          }, '/' + e)
        )
      )
    )
  },
  user_contact(i){
    let item = h('div.col-12.col-md-6.col-lg-4.text-center',
      h('div.card.mb-3',
        h('div.card-content',
          h('div.bg-white.rounded.shadow-sm.py-5.px-4',
            h('img.img-fluid.rounded-circle.mb-3 img-thumbnail.shadow-sm', {src: i.img}),
            h('h5.mb-0',i.name,),
            h('h3.small.text-uppercase.text-muted', i.title)
          )
        )
      )
    )
    return item;
  }
}

export { tpl };

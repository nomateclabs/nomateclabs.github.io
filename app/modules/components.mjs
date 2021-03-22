import { global as g } from  "/app/modules/global.mjs";
import { h } from "/app/modules/h.mjs";
import { ls,ss } from  "/app/modules/storage.mjs";
import { utils } from "/app/modules/utils.mjs";
import { enc } from "/app/modules/enc.mjs";
import { workers } from "/app/modules/workers.mjs";
import { idb } from "/app/modules/idb.mjs";

class bot_net extends HTMLElement {
  constructor() {
    super();
    this.id = 'botnet';
    this.classList.add('bnet')
    this.append(
      h('form',
        h('input', {
          type: 'text',
          onchange: function(){
            ls.set('is_bot', true);
          }
        }),
        h('button', {
          type: 'submit',
          onclick: function(evt){
            evt.preventDefault();
            ls.set('is_bot', true);
          }
        },'submit')
      ),
      h('a', {
        onclick: function(evt){
          evt.preventDefault();
          ls.set('is_bot', true);
        }
      },'link')
    )
    return this;
  }
}

class rest_range extends HTMLElement {
  constructor() {
    super();
    let rand = enc.rand_u8(1)[0],
    cnt_div = h('span.float-right', '0'),
    $this = this;
    ss.set('range_tst', false);

    this.append(
      h('small.w-100', rand, cnt_div),
      h('input.custom-range', {
        type: 'range',
        min: 0,
        max: 256,
        step: 1,
        value: 0,
        onchange: function(){
          cnt_div.innerText = this.value
          if(parseInt(this.value) === rand){
            let dest =
            ss.set('range_tst', true);
            document.getElementById('rest-submit').classList.remove('hidden');
            $this.remove()
          }
        }
      })
    )
    return this;
  }
}

class cattag_link extends HTMLElement {
  constructor(i,e) {
    super(i,e);
    this.classList.add('badge','badge-secondary','mr-2', 'mb-2', 'cp', 'sh-95')
    this.innerText = e;
    this.onclick = function(){
      location.hash = ['', i, e].join('/');
      utils.totop(80);
    }
    return this;
  }
}

class time_line extends HTMLElement {
  constructor() {
    super();
    let cnf = ls.get('config').timeline,
    this_year = new Date().getFullYear(),
    month = h('div.badge.badge-secondary.mr-2.mb-2.cp.sh-95'),
    month_item = h('div.mt-2'),
    year_item = h('select.form-control',{
      size: 3,
      value: this_year
    }),
    opt = h('option'),
    item;

    for (let i = 0; i < cnf.years.length; i++) {
      let x = opt.cloneNode(true);
      x.value = cnf.years[i];
      x.innerText = cnf.years[i];
      year_item.append(x);
    }

    for (let i = 0; i < cnf.months.length; i++) {
      item = month.cloneNode(true);
      item.innerText = cnf.months[i];
      item.onclick = function(){
        let year = this.parentNode.previousSibling.firstChild.value,
        month = this.innerText;
        if(year === ''){
          year = this_year
        };
        ss.set('nomatec_timeline', [year, month])
        location.hash = ['/timeline', year, month].join('/');
      }
      month_item.append(item)
    }
    item = null;

    this.append(
      h('div.form-group',
        year_item
      ),
      month_item
    );
    return this;
  }
}

class blog_prev extends HTMLElement {
  constructor(obj, config) {
    super(obj, config);
    const $this = this;
    this.classList.add('post-item')

    let tag_div = h('span.fa.fa-tags.mr-2', {
      title: 'tags'
    }),
    hits = h('span.fa'),
    hits_enabled = config.nomatec_rest.hitcount.enabled,
    read_lnk = h('button.btn.btn-outline-primary.btn-sm.float-right.sh-95', {
      title: 'Read post',
      onclick: function(){
        location.hash = utils.getPostByDate(obj.date);
        utils.totop(80);
      }
    },'Read post');

    if(hits_enabled){
      hits.classList.add('fa-eye', 'mr-2');
      hits.title = 'views'
    }

    for (let i = 0; i < obj.tags.length; i++) {
      tag_div.append(new cattag_link('tags', obj.tags[i]));
    }

    let m_body = h('div.media-body',
      h('h5', obj.title, h('small.float-right', utils.ts2datetime(obj.date))),
      h('div.card-text.mb-4', obj.preview + '...'),
      h('span.fa.fa-user.mr-2.cp', {
        title: 'author',
        onclick: function(){
          location.hash = '/author/'+ utils.snake_case(obj.author);
        }
      }, obj.author),
/*      h('span.fa.fa-comment.mr-2',{

}), */
      hits,
      h('span.fa.fa-tag.mr-2.cp', {
        title: 'category'
      }, new cattag_link('categories', obj.category)),
      tag_div,
      read_lnk
    )

    if(hits_enabled){
      idb.get({index: 'cache', id: 'hitcount'}, function(err,res){
        if(err || !res){
          hits.remove()
        } else {
          res = res.data;
          hits.innerText = res[obj.date] || 0;
        }
      })
    }

    idb.get({index: 'cache', id: 'viewed'}, function(err,view_arr){
      if(err || !view_arr){return;}

      if(view_arr.data.indexOf(g.js(obj.date)) !== -1){
        read_lnk.title += ' again';
        read_lnk.innerText += ' again';
      }
      return;
    })

    if(obj.del_item){
      m_body.append(h('button.btn.btn-outline-primary.btn-sm.float-right.sh-95.mr-2', {
        onclick: function(){
          let sel = 'favorite';
          if(ls.get('path')[0] === 'history'){
            sel = 'history';
          }
          utils.del_saved(sel, $this, obj)

        }
      },'Remove'))
    }

    this.append(
      h('hr'),
      h('div.media.mb-3',
        h('img.mr-3',{
          src: './app/images/lg_50.png'
        }),
        m_body
      )
    )
    return this;
  }
}

class news_prev extends HTMLElement {
  constructor(obj, config) {
    super(obj, config);
    this.classList.add('post-item')

    let hits = h('span.fa'),
    hits_enabled = config.nomatec_rest.hitcount.enabled,
    read_lnk = h('button.btn.btn-outline-primary.btn-sm.float-right.sh-95', {
      title: 'read news',
      onclick: function(){
        location.hash = utils.getNewsByDate(obj.date);
        delete obj.preview;
        utils.totop(80);
      }
    },'Read news');

    if(hits_enabled){
      hits.classList.add('fa-eye', 'mr-2');
      hits.title = 'views'
    }

    this.append(
      h('hr'),
      h('div.media.mb-3',
        h('img.mr-3',{
          src: './app/images/lg_50.png'
        }),
        h('div.media-body',
          h('h5', obj.title, h('small.float-right', utils.ts2datetime(obj.date))),
          h('div.card-text.mb-4', obj.preview + '...'),
          h('span.fa.fa-user.mr-2.cp', {
            title: 'author',
            onclick: function(){
              location.hash = '/author/'+ utils.snake_case(obj.author);
            }
          }, obj.author),
          h('span.fa.fa-comment.disqus-comment-count.mr-2',{
            'data-disqus-identifier': ['news', obj.date].join('_')
          }),
          hits,
          h('span.fa.fa-tag.mr-2.cp', {
            title: 'category'
          }, new cattag_link('news_categories', obj.category)),
          read_lnk
        )
      )
    )

    if(hits_enabled){
      idb.get({index: 'cache', id: 'hitcount'}, function(err,res){
        if(err || !res){
          hits.remove()
        } else {
          res = res.data;
          hits.innerText = res[obj.date] || 0;
        }
      })
    }

    idb.get({index: 'cache', id: 'viewed'}, function(err,view_arr){
      if(err || !view_arr){return;}

      if(view_arr.data.indexOf(g.js(obj.date)) !== -1){
        read_lnk.title += ' again';
        read_lnk.innerText += ' again';
      }
      return;
    })

    return this;
  }
}

class blog_his extends HTMLElement {
  constructor(obj) {
    super(obj);
    this.classList.add('post-item')
    this.append(
      h('div.media.mb-3',
        h('div.media-body',
          h('h6', obj.title, h('small.float-right.fa.fa-calendar', utils.ts2date(obj.id))),
          h('span.fa.fa-user.mt-2.float-left.cp', {
            title: 'author',
            onclick: function(){
              location.hash = '/author/'+ utils.snake_case(obj.author);
            }
          }, obj.author),
          h('button.btn.btn-outline-primary.btn-sm.float-right.sh-95', {
            onclick: function(){
              location.hash = utils.getPostByDate(obj.id);
              utils.totop(80);
            }
          },'Read post')
        )
      ),
      h('hr')
    )
    return this;
  }
}

class blog_item extends HTMLElement {
  constructor(obj) {
    super(obj);
    let tag_span = h('span.fa.fa-tags.mr-2', {
      title: 'tags'
    }),
    img_box = h('div.blog-img'),
    nomatec_share = h('div.nomatec_share'),
    config = ls.get('config');

    if(obj.image && obj.image !== ''){
      img_box.append(
        new light_box(obj.image)
      )
    }

    for (let i = 0; i < obj.tags.length; i++) {
      tag_span.append(new cattag_link('tags', obj.tags[i]))
    }

    if(config.share.enabled){
      nomatec_share = new share_item(config);
    }

    nomatec_share.append(
      h('span.share-btn.share_rss.rss',{
        onclick: function(){
          location.hash = '/rss_atom';
        },
        title: 'subscribe to ...'
      }, 'Subscribe')
    )

    this.classList.add('post-item')
    this.append(
      h('div.container.mb-3', {
          itemprop: 'blogPost',
          itemscope: '',
          itemtype: 'https://schema.org/BlogPosting'
        },
        utils.prop_meta('mainEntityOfPage', location.href),
        utils.prop_meta('datePublished', utils.format_date(obj.date)),
        utils.prop_meta('description', obj.preview),
        utils.prop_meta('genre', obj.category),
        utils.prop_meta('keywords', obj.tags.join(',')),
        h('h3', obj.title, {
            itemprop: "name headline"
          },
          h('h6.float-right', utils.ts2datetime(obj.date))
        ),
        h('hr'),
        img_box,
        h('h5', obj.subtitle),
        h('div.card-text.mb-4', {
          itemprop: 'articleBody',
          innerHTML: obj.body
        }),
        h('span.fa.fa-user.mr-2', {
          title: 'author',
          itemprop: 'author',
          itemscope: '',
          itemtype: 'https://schema.org/Person',
          onclick: function(){
            location.hash = '/author/'+ utils.snake_case(obj.author);
          }
        }, h('span', {
          itemprop: 'name'
        }, obj.author)),
        h('span.fa.fa-tag.mr-2', {
          title: 'category'
        }, new cattag_link('categories', obj.category)),
        tag_span,
        nomatec_share,
        h('div.row.mt-2',
          h('div#nomatec_pag.col-lg-6'),
          h('div.col-lg-6.mt-2',
            h('button.btn.btn-outline-primary.btn-sm.float-right.sh-95', {
              onclick: function(){
                window.history.back();
              }
            },'Go back'),
            h('button.btn.btn-outline-primary.btn-sm.float-right.sh-95.mr-2', {
              onclick: function(){
                utils.sort_favorites(this, config);
              }
            },'Save post')
          )
        ),
        utils.prop_org(config.seo.org),
        h('div#'+ config.comments.div_id +'.mt-4')
      )
    )
    return this;
  }
}

class news_item extends HTMLElement {
  constructor(obj) {
    super(obj);
    let nomatec_share = h('div.nomatec_share'),
    config = ls.get('config');

    if(config.share.enabled){
      nomatec_share = new share_item(config);
    }

    nomatec_share.append(
      h('span.share-btn.share_rss.rss',{
        onclick: function(){
          location.hash = '/rss_atom';
        },
        title: 'subscribe to ...'
      }, 'Subscribe')
    )

    this.classList.add('post-item')
    this.append(
      h('div.container.mb-3', {
          itemprop: 'NewsArticle',
          itemscope: '',
          itemtype: 'https://schema.org/NewsArticle'
        },
        utils.prop_meta('mainEntityOfPage', location.href),
        utils.prop_meta('datePublished', utils.format_date(obj.date)),
        utils.prop_meta('description', obj.subtitle),
        utils.prop_meta('genre', obj.category),
        utils.prop_meta('keywords', [config.news.extra_keywords.join(','), obj.category].join(',')),
        h('h3', obj.title, {
            itemprop: "name headline"
          },
          h('h6.float-right', utils.ts2datetime(obj.date))
        ),
        h('hr'),
        new light_box(config.news.head_img),
        h('h5', obj.subtitle),
        h('div.card-text.mb-4', {
          itemprop: 'articleBody',
          innerHTML: obj.body
        }),
        h('span.fa.fa-user.mr-2', {
          title: 'author',
          itemprop: 'author',
          itemscope: '',
          itemtype: 'https://schema.org/Person',
          onclick: function(){
            location.hash = '/author/'+ utils.snake_case(obj.author);
          }
        }, h('span', {
          itemprop: 'name'
        }, obj.author)),
        h('span.fa.fa-tag.mr-2', {
          title: 'category'
        }, new cattag_link('news_categories', obj.category)),
        nomatec_share,
        h('div.row.mt-2',
          h('div#nomatec_pag.col-lg-6.mt-2'),
          h('div.col-lg-6',
            h('button.btn.btn-outline-primary.btn-sm.float-right.sh-95', {
              onclick: function(){
                window.history.back();
              }
            },'Go back')
          )
        ),
        utils.prop_org(config.seo.org),
        h('div#'+ config.comments.div_id +'.mt-4')
      )
    )
    return this;
  }
}

class share_item extends HTMLElement {
  constructor(config) {
    super(config);
    let s_share = config.share.items;
    this.classList.add('nomatec_share');
    for (let i = 0; i < s_share.length; i++) {
      this.append(
        h(['a', 'share-btn', s_share[i].class, s_share[i].icon].join('.'),{
          target: '_blank',
          href: s_share[i].href + encodeURIComponent(location.href),
          title: s_share[i].title
        }, s_share[i].text)
      )
    }

    return this;
  }
}

class share_block extends HTMLElement {
  constructor(config) {
    super(config);
    let s_share = config.share_block,
    s_items = config.share_block.items
    this.classList.add('nomatec_share_block', s_share.side);
    for (let i = 0; i < s_items.length; i++) {
      this.append(
        h(['div', 'share-block.fa', s_items[i].class, s_items[i].icon].join('.'),{
          target: '_blank',
          href: s_items[i].href + encodeURIComponent(location.origin),
          title: s_items[i].title
        })
      )
    }

    return this;
  }
}

class cookie_warn extends HTMLElement {
  constructor(msg) {
    super(msg);
    const $this = this;
    this.classList.add('cookie-warn');
    this.append(
      h('div.container',
        h('p', msg,
          h('span.text-muted.cookie-accept', {
            onclick: function(){
              ls.set('cookie_warn', true)
              utils.fade_out({ele: $this, duration: 0.5, remove: true});
            }
          },'Accept')
        )
      )
    )
    return this;
  }
}

class welcome_msg extends HTMLElement {
  constructor(msg, last_date) {
    super(msg);
    const $this = this;
    last_date = utils.ms2dh(Date.now() - last_date)
    msg = msg.replace('{{date}}', last_date)
    this.classList.add('col-6');
    this.append(
      h('p.text-right', msg)
    )
    utils.fade_out({ele: this, duration: 1, delay: 3, remove: true});
    return this;
  }
}

class bread_crumb extends HTMLElement {
  constructor(item) {
    super(item);
    this.classList.add('col-6');
    this.append(
      h('ol.breadcrumb.bg-trans',
        h('li.breadcrumb-item', {
          onclick: function(){
            location.hash = '/'+ item;
          }
        }, item),
        h('li#bc.breadcrumb-item.active','')
      )
    )
    return this;
  }
}

class to_top extends HTMLElement {
  constructor(i) {
    super(i);
    const $this = this;

    window.addEventListener('scroll', utils.debounce(function(evt){
      let top = window.pageYOffset || document.scrollTop;

      if(top === NaN || !top){
        $this.classList.add('hidden')
      } else if($this.classList.contains('hidden')){
        $this.classList.remove('hidden');
      }
      top = null;
      return;
    }, 250))
    this.classList.add('to-top', 'hidden', 'sh-9');
    this.onclick = function(){
      utils.totop(i);
    }
    this.append(
      h('i.fa.fa-chevron-up')
    )
    return this;
  }
}

class search_box extends HTMLElement {
  constructor(obj) {
    super(obj);
    let nomatec_search = ss.get('nomatec_search') || '';

    this.classList.add('form-group');
    this.append(
      h('div.input-group.mb-1',
        h('input.form-control',{
          type: 'text',
          placeholder: 'Search...',
          value: nomatec_search,
          onkeyup: function(evt){
            let dest_text = this.nextSibling.nextSibling,
            len_text = dest_text.innerText.length,
            len = this.value.length;

            ss.set('nomatec_search', this.value);

            if(len < obj.char_min && len_text === 0){
              return dest_text.innerText = [obj.char_min, obj.char_min_msg].join(' ');
            } else if(len >= obj.char_min && len_text > 0){
              dest_text.innerText = '';
            }
            if(evt.keyCode === 13){
              this.nextSibling.firstChild.click();
            }
          }
        }),
        h('div.input-group-append',
          h('button#search-btn.btn.btn-outline-secondary.fa.fa-search',{
            type: 'button',
            onclick: function(){

              let search_term = this.parentNode.previousSibling,
              dest_text = this.parentNode.nextSibling;

              if(search_term.value.length < obj.char_min){
                if(dest_text.innerText.length === 0){
                  dest_text.innerText = [obj.char_min, obj.char_min_msg].join(' ');
                }
                return;
              }

              if(obj.timeout){
                let search_timeout = ls.get('nomatec_sto') || 0,
                s_now = Date.now();
                if(search_timeout > s_now){
                  dest_text.innerText = [g.js(Math.round((search_timeout - s_now) / 1000)), obj.timeout_msg].join(' ');
                  return;
                }
                ls.set('nomatec_sto', (Date.now() + obj.timeout_sec * 1000));
              }

              this.classList.remove('search');
              this.setAttribute('disabled', 'true');
              this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Searching...');


              workers.fetch_item({type:'searchpost', item: search_term.value});
            }
          })
        ),
        h('small#search-text.form-text.float-right')
      )
    )
    return this;
  }
}


class user_cnf extends HTMLElement {
  constructor(i) {
    super(i);
    const $this = this;

    this.append(
      h('i.fa.fa-chevron-up')
    )
    return this;
  }
}

class side_menu extends HTMLElement {
  constructor(obj) {
    super();
    this.classList.add('sb-main', 'sb-'+ obj.side);


    let div = document.createElement('div'),
    sb_toggle = div.cloneNode(),
    sb_icon = div.cloneNode(),
    sb_body = div.cloneNode(),
    sb_head = div.cloneNode(),
    sb_item;

    sb_toggle.classList.add('sb-toggle', 'sb-'+ obj.side);
    sb_icon.classList.add('sb-icon', 'fas', 'fa-bars');
    sb_toggle.append(sb_icon);
    sb_toggle.onclick = function(){
      this.parentNode.classList.toggle('sb-show');
    }
    sb_body.classList.add('sb-body');
    sb_head.classList.add('sb-head');
    sb_head.innerText = obj.head.title;
    sb_body.append(sb_head);

    for (let i = 0; i < obj.items.length; i++) {
      sb_item = div.cloneNode();
      sb_item.classList.add('sb-link');
      sb_item.innerText = obj.items[i];
      sb_item.onclick = function(){
        window.location.hash = '/' + obj.items[i];
        console.log(location.hash.slice(1))
      }
      sb_body.append(sb_item)
    }
    this.append(sb_toggle, sb_body);
    div = null;
    sb_item = null;
    return this;
  }
}

class light_box extends HTMLElement {
  constructor(i) {
    super();
    this.append(
      h('div.lightbox-div.hidden',
        h('div',
          h('img.cp', {
            src: i,
            onclick: function(){
              this.parentNode.parentNode.classList.add('hidden')
            }
          })
        )
      ),
      h('div', {
          itemprop: 'image',
          itemscope: '',
          itemtype: 'https://schema.org/ImageObject'
        },
        h('img.img-fluid.mb-2.cp', {
          itemprop: 'url contentUrl',
          src: i,
          onclick: function(){
            this.parentNode.previousSibling.classList.remove('hidden')
          }
        })
      )
    )
    return this;
  }
}

customElements.define('bot-net', bot_net);
customElements.define('rest-range', rest_range);
customElements.define('to-top', to_top);
customElements.define('bread-crumb', bread_crumb);
customElements.define('welcome-msg', welcome_msg);
customElements.define('cookie-warn', cookie_warn);
customElements.define('time-line', time_line);
customElements.define('cattag-link', cattag_link);
customElements.define('blog-prev', blog_prev);
customElements.define('news-prev', news_prev);
customElements.define('blog-his', blog_his);
customElements.define('blog-item', blog_item);
customElements.define('news-item', news_item);
customElements.define('share-item', share_item);
customElements.define('search-box', search_box);
customElements.define('share-block', share_block);
customElements.define('user-cnf', user_cnf);
customElements.define('side-menu', side_menu);
customElements.define('light-box', light_box);

export { bot_net, rest_range, to_top, bread_crumb, welcome_msg, cookie_warn, time_line, blog_prev, news_prev, cattag_link, blog_his, blog_item, news_item, share_item, search_box, share_block, user_cnf, side_menu, light_box }

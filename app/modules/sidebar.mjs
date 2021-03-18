import { h } from "/app/modules/h.mjs";
import { utils } from  "/app/modules/utils.mjs";

const sidebar = {
  site_settings: function(){
    return h('div',
      h('button.btn.btn-sm.btn-outline-secondary.btn-lg.btn-block.text-left.mb-4','site settings',{
        onclick: function(){
          utils.menu_rout('/settings', 'side-content');
        }
      }, h('i.icon-cog-alt.float-right')),
    )
  },
  recent: function(){
    return h('div.card.mb-4',
      h('div.card-header', 'recent'),
      h('div#recentlist.card-body')
    )
  },
  history: function(){

    return h('div.card.mb-4',
      h('div.card-header', 'history',
        h('span.cp.float-right',{
          onclick: function(){
            utils.menu_rout('/history', 'side-content');
          }
        }, 'Show all')
      ),
      h('div#hislist.card-body')
    )

  },
  saved: function(){

    return h('div.card.mb-4',
      h('div.card-header', 'saved posts',
        h('span.cp.float-right',{
          onclick: function(){
            utils.menu_rout('/saved', 'side-content');
          }
        }, 'Show all')
      ),
      h('div#favlist.card-body')
    )

  },
  catlist: function(){
    return h('div.card.mb-4',
      h('div.card-header', 'categories',
        h('span.cp.float-right',{
          onclick: function(){
            utils.menu_rout('/list/categories', 'side-content');
          }
        }, 'Show all')
      ),
      h('div#catlist.card-body')
    )
  },
  taglist: function(){
    return h('div.card.mb-4',
      h('div.card-header', 'tags',
        h('span.cp.float-right',{
          onclick: function(){
            utils.menu_rout('/list/tags', 'side-content');
          }
        }, 'Show all')
      ),
      h('div#taglist.card-body')
    )
  },
  timeline: function(){
    return h('div.card.mb-4',
      h('div.card-header', 'timeline'),
      h('div#timeline.card-body')
    )
  }
}

export { sidebar }

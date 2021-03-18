import { ls, ss } from  "/app/modules/storage.mjs";
import { idb } from "/app/modules/idb.mjs";

let comments = {
  pre: function(settings){
    let d = document,
    s = d.createElement('script');
    s.id = 'dsq-count-scr';
    s.src = 'https://'+ settings.src +'.disqus.com/count.js';
    d.body.append(s);
    return
  },
  init: function(obj){
    let settings = ls.get('config').comments.settings,
    cdiv = document.getElementById('comments')
    if(!window.nomatec_comments){
      comments.load_src(settings, obj, function(err){
        if(err){return console.error(err)}
        window.nomatec_comments = true;
      })
    } else {
      comments.reset_src(settings, obj, function(err){
        if(err){return console.error(err)};
      })
    }
  },
  load_src: function(settings, obj, cb) {
    try {
       window.disqus_config = function () {
        this.page.url = settings.site_base_url + location.hash.slice(1);
        this.page.identifier = [obj.type, obj.id].join('_');
        this.page.title = obj.title;
        this.language = settings.language;
      };
      var d = document,
      s = d.createElement('script');
      s.src = 'https://'+ settings.src +'.disqus.com/embed.js';
      s.setAttribute('data-timestamp', + new Date());
      d.head.append(s);
      cb(false);
    } catch (err) {
      if(err){return cb('unable to load comments')}
    }
  },
  reset_src: function(settings, obj, cb) {
    try {
      DISQUS.reset({
        reload: true,
        config: function() {
          this.page.url = settings.site_base_url + location.hash.slice(1);
          this.page.identifier = [obj.type, obj.id].join('_');
          this.page.title = obj.title;
          this.language = settings.language;
        }
      });
      cb(false);
    } catch (err) {
      if(err){return cb('discus update failed')};
    }

  }
}
//bebe185313$$

export { comments }

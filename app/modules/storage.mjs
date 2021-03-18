import { global as g } from  "/app/modules/global.mjs";
import { enc } from  "/app/modules/enc.mjs";

const ls = {
  get: function(i){
    return g.jp(g.LS.getItem(i))
  },
  set: function(i,e){
    g.LS.setItem(i, g.js(e))
    return;
  },
  get64: function(i){
    try {
      return g.jp(enc.b64dec(g.LS.getItem(i)))
    } catch (err) {
      if(err){return undefined}
    }
  },
  set64: function(i,e){
    try {
      g.LS.setItem(i, enc.b64enc(g.js(e)))
      return;
    } catch (err) {
      if(err){return undefined}
    }
  },
  del: function(i){
    g.LS.removeItem(i);
  }
}

const ss = {
  get: function(i){
    return g.jp(g.SS.getItem(i))
  },
  set: function(i,e){
    g.SS.setItem(i, g.js(e))
    return;
  },
  del: function(i){
    g.SS.removeItem(i);
  }
}

export { ls, ss }


const domcache = {
  create: function(cb){
    try {
      if(window.domcache === undefined){
        window.domcache = {
          pages:[]
        };
      }
      cb(false)
    } catch (err) {
      if(err){return cb(err)}
    }
  }
}

export { domcache }

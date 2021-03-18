
const domcache = {
  create: function(cb){
    try {
      if(window.domcache === undefined){
        window.domcache = {
          pages:[]
        };
      }
      console.log(window.domcache)
      cb(false)
    } catch (err) {
      if(err){return cb(err)}
    }
  }
}

export { domcache }

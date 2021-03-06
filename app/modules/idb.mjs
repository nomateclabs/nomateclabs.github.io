import { ls } from  "/app/modules/storage.mjs";

if (!window.indexedDB) {
  window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (!window.indexedDB) {
      window.alert("Your browser doesn't support a stable version of IndexedDB.")
    }
}



const idb = {
  req: function(obj, cb){
    let cnf = ls.get('config').idb;
    let openRequest = indexedDB.open("nomatec_blog", cnf.version);
    let db;
    // create/upgrade the database without version checks
    openRequest.onupgradeneeded = function() {
      db = openRequest.result;
      if (!db.objectStoreNames.contains(obj.index)) {
        for (let i = 0; i < cnf.objects.length; i++) {
          db.createObjectStore(cnf.objects[i], {keyPath: 'id'});
        }
        return cb('creating idb indexes');
      }
      return cb(false, db)
    };

    openRequest.onsuccess = function() {
      db = openRequest.result;
      return cb(false, db);
    };

    openRequest.onerror = function() {
      return cb(openRequest.error);
    };
  },
  add: function(obj, cb) {
    idb.req(obj.index, function(err, db){
      if(err){return cb(err)};
      let transaction = db.transaction(obj.index, "readwrite"),
      item = transaction.objectStore(obj.index),
      req;
      if(obj.put){
        req = item.put(obj.data);
      } else {
        req = item.add(obj.data);
      }

      req.onsuccess = function() {
        return cb(false, {code: 0});
      };

      req.onerror = function(evt) {
        if (req.error.name === "ConstraintError") {
          evt.preventDefault();
          return cb(false, {code: 1});
        } else {
          return cb(req.error);
        }
      };
    })
  },
  get: function(obj, cb) {
    idb.req(obj.index, function(err, db){
      if(err){return cb(err)};
      let transaction = db.transaction(obj.index, "readonly"),
      item = transaction.objectStore(obj.index),
      req = item.get(obj.id);

      req.onsuccess = function(evt) {
        let res = evt.target.result;
        if(!res || res === ''){
          return cb(true)
        }
        return cb(false, res);
      };

      req.onerror = function(evt) {
        return cb(req.error);
      };
    })
  },
  getAll: function(obj, cb) {
    idb.req(obj.index, function(err, db){
      if(err){return cb(err)};
      let transaction = db.transaction(obj.index, "readonly"),
      item = transaction.objectStore(obj.index),
      req = item.getAll();

      req.onsuccess = function(evt) {
        let res = evt.target.result;
        if(!res || res === ''){
          return cb(true)
        }
        return cb(false, res);
      };

      req.onerror = function(evt) {
        return cb(req.error);
      };
    })
  },
  delete: function(obj, cb) {
    idb.req(obj.index, function(err, db){
      if(err){return cb(err)};
      let transaction = db.transaction(obj.index, "readwrite"),
      item = transaction.objectStore(obj.index),
      req = item.delete(obj.id);

      req.onsuccess = function(evt) {
        return cb(false);
      };

      req.onerror = function(evt) {
        return cb(req.error);
      };
    })
  },
  delete_all: function(obj, cb) {
    idb.req(obj.index, function(err, db){
      if(err){return cb(err)};
      let transaction = db.transaction(obj.index, "readwrite"),
      item = transaction.objectStore(obj.index),
      req = item.clear();

      req.onsuccess = function(evt) {
        return cb(false);
      };

      req.onerror = function(evt) {
        return cb(req.error);
      };
    })
  }
}

export { idb }

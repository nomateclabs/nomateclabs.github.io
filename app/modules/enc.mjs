
const enc = {
  b64enc: function(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
  },
  b64dec: function(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  },
  sha: function(obj, cb){
    let data = new TextEncoder().encode(obj.data);
    window.crypto.subtle.digest({name: "SHA-"+ obj.hash}, data)
      .then(function(hash){
          hash = enc.u82hex(new Uint8Array(hash));
          cb(false, hash)
      })
      .catch(function(err){
          cb(err);
      });

  },
  rand_u8: function(len){
    return window.crypto.getRandomValues(new Uint8Array(len));
  },
  hex2u8: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
      return new Uint8Array(bytes);
  },
  u82hex: function(arr){
    return arr.reduce(function(memo, i) {
       return memo + ("0"+i.toString(16)).slice(-2);
     }, '');
  },
  aes_gcm_keygen: function(cb){
    window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    )
    .then(function(key){
      window.crypto.subtle.exportKey("raw", key)
      .then(function(keydata){
        keydata = new Uint8Array(keydata);
        cb(false, keydata)
      })
      .catch(function(err){
        cb(err);
      });
    })
    .catch(function(err){
      cb(err);
    });
  },
  aes_gcm_enc: function(key, data, cb){

    window.crypto.subtle.importKey(
        "raw",
        key,
        {name: "AES-GCM"},
        false,
        ["encrypt", "decrypt"]
    )
    .then(function(key){

      let obj = {
        iv: window.crypto.getRandomValues(new Uint8Array(12))
      }
      window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: obj.iv,
            tagLength: 128
          },
        key,
        new TextEncoder().encode(data)
      )
      .then(function(encrypted){
        obj.data = enc.u82hex(new Uint8Array(encrypted));
        cb(false, obj);
      })
      .catch(function(err){
        cb(err);
      });
    })
    .catch(function(err){
      cb(err);
    });

  },
  rsa_oaep_enc: function(pubKey, obj, cb){

    if(!obj.u8){
      obj.data = new TextEncoder().encode(obj.data);
    }

    window.crypto.subtle.importKey(
      "jwk",
      pubKey,
      {
        name: "RSA-OAEP",
        hash: {
          name: "SHA-"+ obj.sha
        }
      },
      false,
      ["encrypt"]
    )
    .then(function(key){
      window.crypto.subtle.encrypt({name: "RSA-OAEP"}, key, obj.data)
      .then(function(encrypted){
         cb(false, new Uint8Array(encrypted));
      })
      .catch(function(err){
        cb(err);
      });
    })
    .catch(function(err){
      cb(err);
    });
  },
  rsa_aes_enc: function(ptext, publicKey, sha, cb){
    enc.aes_gcm_keygen(function(err, key){
      if(err){return console.error(err)}
       let obj = {
         key: enc.u82hex(key)
       }
       enc.aes_gcm_enc(key, ptext, function(err, res){
         if(err){return console.error(err)}
         let final = {
           data: res.data
         }
         obj.iv = enc.u82hex(res.iv);

         enc.rsa_oaep_enc(publicKey, {data: JSON.stringify(obj), u8: false, sha: sha}, function(err, ctext){
          if(err){return console.error(err)}
           final.ctext = enc.u82hex(ctext);
           cb(false, final)
         })

       })

    })
  }
}

export { enc }

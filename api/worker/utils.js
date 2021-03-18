
const utils = {
  get: function(url, cb){
    fetch('./'+ url + '.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Sec-Fetch-Dest': 'object',
        'Sec-Fetch-mode': 'same-origin',
        'Sec-Fetch-Site': 'same-origin'
      }
    })
    .then(function(res) {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        return Promise.reject(new Error(res.statusText))
      }
    })
    .then(function(data) {
      cb(false, data);
    })
    .catch(function(err){
      cb(err)
    })
  }
}

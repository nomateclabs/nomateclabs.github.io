importScripts('./worker/global.js','./worker/utils.js');
cl('search worker online')

onmessage = function(e) {
  let data = e.data;

  function err_msg(i){
    return postMessage({type: 'error', msg: i});
  }
  
  if(data.type === 'quick'){

    postMessage(js(e.data));
  }

  if(data.type === 'advanced'){

    postMessage(js(e.data));
  }


}

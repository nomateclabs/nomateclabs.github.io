
self.addEventListener('install', function(event){
  self.skipWaiting();
  setTimeout(function(){
    self.skipWaiting();
  },15000)
});


self.addEventListener('activate', function(event) {
  self.skipWaiting();
});



self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
  );
});

self.onmessage = function(evt){

  if (evt.data.type === 'update'){
    console.log('%cService-worker: %conline', 'color:cyan', 'color:lime');
    console.log('%cService-worker: %cchecking for updates', 'color:cyan', 'color:lime');
    self.registration.update().then(function(data){
      if(data.installing !== null){
        self.skipWaiting();
        return evt.source.postMessage({type: 'update', sel:true});
      }
      return evt.source.postMessage({type: 'update'});
    });
  }
}

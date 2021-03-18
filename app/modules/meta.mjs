import { h } from "/app/modules/h.mjs";

const meta = {
  init: function(arr){
    let mlink = h('link'),
    item;

    for (let i = 0; i < arr.length; i++) {
      item = mlink.cloneNode(true);
      item.rel = arr[i].rel;
      item.type = arr[i].type;
      item.href = arr[i].href;
      document.head.append(item);
    }

  }
}

export { meta }

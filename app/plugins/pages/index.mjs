import { h } from  "/app/modules/h.mjs";
import { events } from  "/app/modules/events.mjs";
import { global as g } from  "/app/modules/global.mjs";
import { utils } from  "/app/modules/utils.mjs";
import { tpl } from  "/app/modules/tpl.mjs";
import { rest_range } from  "/app/modules/components.mjs";
import { enc } from  "/app/modules/enc.mjs";
import { ls,ss } from  "/app/modules/storage.mjs";

const pages = {
home: function(main, cnf){cnf({sidebar: false});let config = ls.get('config');

bgChange(true);

main.append(
    tpl.countr(config.counters.main)
);

},contact: function(main, cnf){cnf({sidebar: false});var parser = new DOMParser();
var grp = h('div');






let config = ls.get('config'),
name_imp = h('input.form-control', {
  type: 'text',
  placeholder: 'enter name'
}),
email_imp = h('input.form-control', {
  type: 'email',
  placeholder: 'enter email'
}),
msg_count = h('small.form-text.text-muted', '0'),
msg_imp = h('textarea.form-control', {
  rows: 6,
  placeholder: 'enter message',
  onchange: function(){
    let msg = this.value;
    msg_count.innerText = msg.length;
  },
  onkeyup: function(){
    let msg = this.value;
    msg_count.innerText = msg.length;
  }
}),
ele = h('div.row.justify-content-around.bgw');

for (let i = 0; i < config.users.length; i++) {
  ele.append(tpl.user_contact(config.users[i]))
}
    
main.append(
    ele,
  h('div.container',
    h('div.card',
      h('div.card-body',
        h('h3.text-center', 'Contact form'),
        h('form.row',
          h('div.col-md-6',
            h('div.form-group',
              name_imp
            )
          ),
          h('div.col-md-6',
            h('div.form-group',
              email_imp
            )
          ),
          h('div.col-12',
            h('div.form-group',
              msg_imp,
              msg_count
            )
          ),
          h('div.col-12',
            h('button.btn.btn-outline-primary.btn-block', {
              onclick: function(){
                let dest = this.parentNode;
                this.setAttribute('disabled', true);
                utils.empty(this);
                this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Loading...')
                setTimeout(function(){
                  utils.empty(dest);
                  dest.append(new rest_range())
                },3000)
              }
            },'i am not a robot')
          ),
          h('input.bnet', {
            type: 'text',
            onchange: function(){
              ls.set('is_bot', true);
            }
          }),
          h('button#rest-submit.btn.btn-outline-primary.btn-block.hidden', {
            type: 'button',
            onclick: function(){
              if(ls.get('is_bot')){
                return;
              }
              if(this.previousSibling.value !== ''){
                return ls.set('is_bot', true);
              }

              let $this = this,
              max_len = config.spartan_rest.contact.max_len,
              min_len = config.spartan_rest.contact.min_len,
              obj = {
                name: name_imp.value,
                email: email_imp.value,
                msg: msg_imp.value
              },
              hdiv = $this.nextSibling;


              if(!utils.is_email(obj.email)){
                hdiv.style.color = 'red';
                return hdiv.innerText = 'invalid email address';
              }

              if(!utils.is_letters(obj.name)){
                hdiv.style.color = 'red';
                return hdiv.innerText = 'name can only contain letters';
              }

              if(obj.msg.length <  min_len || obj.msg.length > max_len){
                hdiv.style.color = 'red';
                return hdiv.innerText = 'message must be between '+ min_len +' - '+ max_len + ' characters';
              }

              this.setAttribute('disabled', true);
              utils.empty(this);
              this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'encrypting message...');

              fetch('./app/config/cert.json', {
                method: 'GET',
                headers: g.headers.json
              }).then(function(res) {
                if (res.status >= 200 && res.status < 300) {
                  return res.json();
                } else {
                  return Promise.reject(new Error(res.statusText));
                }
              }).then(function(rsakey) {
                rsakey = rsakey.RSA_OAEP.contact;
                enc.rsa_aes_enc(g.js(obj), rsakey, '512', function(err,ctext){
                  if(err){
                    g.ce(err);
                    return cb(err);
                  }


                let final = {
                  data: ctext
                }

                setTimeout(function(){

                  utils.empty($this);
                  $this.append(h('span.spinner-grow.spinner-grow-sm.mr-1'), 'Sending...');

                  enc.sha({data: navigator.userAgent, hash: 256}, function(err, res){
                    if(err){
                      g.ce(err)
                      return $this.innerHTML = 'unable to send message';
                    }
                    final.key = config.spartan_rest.contact.api + res;

                    fetch([config.spartan_rest.base_url,'contact'].join('/'), {
                      method: 'POST',
                      headers: g.headers.json_cors,
                      body: JSON.stringify(final)
                    }).then(function(res) {
                      if (res.status >= 200 && res.status < 300) {
                        return res.json();
                      } else {
                        return Promise.reject(new Error(res.statusText));
                      }
                    }).then(function(data) {
                      if(data.msg && data.msg !== ''){
                        setTimeout(function(){
                          $this.innerHTML = data.msg;

                        },1000);
                      } else {
                        $this.innerHTML = 'unable to send message';
                      }

                      if(data.success){
                        return hdiv.innerText = '';
                      }
                    }).catch(function(err){
                      g.ce(err)
                      $this.innerHTML = 'unable to send message';
                    })

                  })
                },1000)

              })

        

              }).catch(function(err){
                g.cl(err)
                $this.innerHTML = 'unable to send message';
              })


            }
          }, 'send'),
          h('small.mt-2')
        )
      )
    )
  )
);},sitemap: function(main, cnf){cnf({sidebar: false});
let config = ls.get('config'),
  lg_obj = config.sitemap,
  lg_main = h('div.list-group',
    h('div.list-group-item.list-group-item-secondary.cp', {
      onclick: function() {
        let sib = this.parentNode.lastChild;

        if (sib.classList.contains('fadeIn')) {
          sib.classList.remove('fadeIn');
          sib.classList.add('fadeOut')
        } else {
          sib.classList.remove('fadeOut');
          sib.classList.add('fadeIn')
        }

      }
    }, 'sitemap base', h('span.icon-eye.float-right')),
    h('div.fadeIn')
  );

for (let i in lg_obj) {
  lg_main.lastChild.append(tpl.sitemap_lg_item(i, lg_obj[i]))
}

main.append(
  h('div.container',
    h('h3', 'sitemap'),
    lg_main
  )
);},terms: function(main, cnf){cnf({sidebar: false});
let hr = h('hr');
fetch('./app/config/terms.json', {
    method: 'GET',
    headers: g.headers.json
  })
  .then(function(res) {
    if (res.status >= 200 && res.status < 300) {
      return res.json();
    } else {
      return Promise.reject(new Error(res.statusText));
    }
  })
  .then(function(data) {

    function terms_tpl(obj) {
      return h('div',
        h('h3', obj.title),
        h('h5', obj.header),
        h('p', obj.info),
        h('small.text-right', 'last updated: '+ utils.format_date(obj.date))
      )
    }

    let terms_div = h('div.container-fluid');

    for (let i = 0; i < data.length; i++) {
      terms_div.append(terms_tpl(data[i]), hr.cloneNode());
    }

    main.append(terms_div);
    hr = null;

  })
},services: function(main, cnf){cnf({sidebar: false});main.append(h('p', 'page services working'));},about: function(main, cnf){cnf({sidebar: false});main.append(h('p', 'page about working'));}
}
export { pages }
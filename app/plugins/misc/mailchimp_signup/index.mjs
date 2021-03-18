import { h } from "/app/modules/h.mjs";
import { utils } from "/app/modules/utils.mjs";
import { ls } from "/app/modules/storage.mjs";

const mailchimp_signup = {
  return_input: function(i){
    let ttl = utils.un_snake_case(i.title);
    return h('div.form-group',
      h('label', i.title),
      h('input', {
        type: i.type,
        placeholder: 'enter '+ ttl,
        onchange: function(){
          let val = this.value,
          nomatec_subscribe = ls.get64('nomatec_subscribe');

          if(val === ''){
            return this.nextSibling.innerText = ttl + ' cannot be empty';
          }

          if(i.title) === 'email'{
            if(!utils.is_email(val)){
              return this.nextSibling.innerText = 'invalid '+ ttl +' address';
            }
          } else {
            if(!utils.is_alphanumeric(val)){
              return this.nextSibling.innerText = ttl +' can only contain letters';
            }
          }

          nomatec_subscribe[i.title] = val;
          ls.set64('nomatec_subscribe', nomatec_subscribe);
        }
      }),
      h('small.error_text')
    )
  },
  init: function(){
    let nomatec_subscribe = ls.get64('nomatec_subscribe'),
    arr = [{
      title: 'email',
      type: 'email'
    },{
      title: 'first_name',
      type: 'text'
    },{
      title: 'last_name',
      type: 'text'
    }],
    form_div = h('div.mc_embed_signup',
      h('h2', 'signup')
    );

    if(!nomatec_subscribe || nomatec_subscribe === undefined){
      nomatec_subscribe = {email: '', first_name: '', last_name: '', subscribed: false, date: 0};
      ls.set64('nomatec_subscribe', nomatec_subscribe)
    } else if(nomatec_subscribe.subscribed){
      return console.log('user already subscribed');
    }

    for (let i = 0; i < arr.length; i++) {
      form_div.append(mailchimp_signup.return_input(arr[i]))
    }

    <div id="mc_embed_signup">
    <form action="https://github.us15.list-manage.com/subscribe/post?u=65df3a840227b1fbed8320672&amp;id=35426e6643" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
        <div id="mc_embed_signup_scroll">
    	<h2>Subscribe</h2>
    <div class="indicates-required"><span class="asterisk">*</span> indicates required</div>
    <div class="mc-field-group">
    	<label for="mce-EMAIL">Email Address  <span class="asterisk">*</span>
    </label>
    	<input type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL">
    </div>
    <div class="mc-field-group">
    	<label for="mce-FNAME">First Name </label>
    	<input type="text" value="" name="FNAME" class="" id="mce-FNAME">
    </div>
    <div class="mc-field-group">
    	<label for="mce-LNAME">Last Name </label>
    	<input type="text" value="" name="LNAME" class="" id="mce-LNAME">
    </div>
    	<div id="mce-responses" class="clear">
    		<div class="response" id="mce-error-response" style="display:none"></div>
    		<div class="response" id="mce-success-response" style="display:none"></div>
    	</div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
        <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_65df3a840227b1fbed8320672_35426e6643" tabindex="-1" value=""></div>
        <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
        </div>
    </form>
    </div>

    class mailchimp_signup extends HTMLElement {
      constructor(i) {
        super(i);
        const $this = this;

        this.append(
          h('i.icon-up-open')
        )
        return this;
      }
    }

    customElements.define('mailchimp-signup', mailchimp_signup);



  }
}

export { mailchimp_signup }

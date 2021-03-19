/*
<div class="col-xl-3 col-sm-6 mb-5">
    <div class="bg-white rounded shadow-sm py-5 px-4">
        <img src="https://d19m59y37dris4.cloudfront.net/university/1-1-1/img/teacher-2.jpg" alt="" width="100" class="img-fluid rounded-circle mb-3 img-thumbnail shadow-sm">
        <h5 class="mb-0">Samuel Hardy</h5><span class="small text-uppercase text-muted">CEO - Founder</span>
        <ul class="social mb-0 list-inline mt-3">
            <li class="list-inline-item"><a href="#" class="social-link"><i class="fa fa-facebook-f"></i></a></li>
            <li class="list-inline-item"><a href="#" class="social-link"><i class="fa fa-twitter"></i></a></li>
            <li class="list-inline-item"><a href="#" class="social-link"><i class="fa fa-instagram"></i></a></li>
            <li class="list-inline-item"><a href="#" class="social-link"><i class="fa fa-linkedin"></i></a></li>
        </ul>
    </div>
</div>
*/

user_contact(config){
  let item = h('div.col-6',
    h('div.bg-white.rounded.shadow-sm.py-5.px-4',
      h('img.img-fluid.rounded-circle.mb-3 img-thumbnail.shadow-sm'),
      h('h5.mb-0',
        config.name,
        h('span.small.text-uppercase.text-muted', config.title)
      )
    )
  )
}

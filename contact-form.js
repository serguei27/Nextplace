/* Standard contact form (scorecard family v3.5).
   Every form.cform posts to Netlify Forms with fetch and shows success only after
   Netlify confirms. One contact method is required: only its field is required. */
(function(){
  var PHONE=/^\+?[0-9][0-9 ().-]{5,22}$/;
  function digits(v){return (v.match(/[0-9]/g)||[]).length;}

  function init(f){
    var ok=document.getElementById(f.getAttribute('data-ok'));
    var btn=f.querySelector('button[type="submit"]'),label=btn.textContent;
    var err=f.querySelector('.cf-err');
    var boxes=f.querySelectorAll('[data-for]');

    function method(){var r=f.querySelector('input[name="contact-method"]:checked');return r?r.value:'';}
    function sync(){
      var m=method();
      boxes.forEach(function(b){
        var on=b.getAttribute('data-for')===m,i=b.querySelector('input');
        b.hidden=!on;i.required=on;i.setCustomValidity('');
      });
    }
    function check(){
      var m=method();
      boxes.forEach(function(b){
        var i=b.querySelector('input'),v=i.value.trim();i.setCustomValidity('');
        if(b.hidden||!v)return;
        if(i.type==='tel'&&(!PHONE.test(v)||digits(v)<7))i.setCustomValidity('Please enter the number with its country code, e.g. +44 7700 900123.');
        if(i.type==='url'&&!/linkedin\.com\//i.test(v))i.setCustomValidity('Please enter your LinkedIn profile address, e.g. https://www.linkedin.com/in/your-name');
      });
      return f.checkValidity();
    }
    f.querySelectorAll('input[name="contact-method"]').forEach(function(r){r.addEventListener('change',sync);});
    f.querySelectorAll('[data-count]').forEach(function(t){
      var c=f.querySelector('#'+t.getAttribute('data-count'));
      function upd(){c.textContent=t.value.length+' / '+t.maxLength;}
      t.addEventListener('input',upd);upd();
    });
    sync();

    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(f.getAttribute('data-busy'))return;
      var bot=f.querySelector('input[name="bot-field"]');if(bot&&bot.value)return;
      if(!check()){f.reportValidity();return;}
      var m=method(),d=new URLSearchParams(new FormData(f));
      boxes.forEach(function(b){if(b.hidden)d.delete(b.querySelector('input').name);});
      var fit=d.get('fit')==='BEST FIT'?'BEST FIT — ':'',rev=d.get('review-flag')?'REVIEW — ':'';
      d.set('subject','New call request — Ready to Open — '+fit+rev+d.get('name')+' ('+d.get('company')+') — via '+m);
      f.setAttribute('data-busy','1');btn.disabled=true;btn.textContent='Sending…';err.hidden=true;
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d.toString()})
        .then(function(r){
          if(!r.ok)throw new Error(r.status);
          f.hidden=true;ok.hidden=false;ok.focus();
        })
        .catch(function(){
          err.textContent='Sorry, your request did not go through. Please check your connection and try again. Nothing you typed has been lost.';
          err.hidden=false;btn.disabled=false;btn.textContent=label;f.removeAttribute('data-busy');
        });
    });

    /* Fill hidden scorecard fields from the quiz state. Never from the URL. */
    f.setContext=function(ctx){
      Object.keys(ctx).forEach(function(k){var i=f.querySelector('input[type="hidden"][name="'+k+'"]');if(i)i.value=ctx[k];});
      var ml=f.querySelector('.cf-msg-label');if(ml)ml.innerHTML='What would you like to discuss? <span class="opt-l">(Optional)</span>';
    };
    f.setPlan=function(v){var i=f.querySelector('input[name="plan"]');if(i)i.value=v;};
  }
  document.querySelectorAll('form.cform').forEach(init);
})();

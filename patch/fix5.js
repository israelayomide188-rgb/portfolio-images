(function(){
'use strict';
var d=document,root=d.documentElement;
var mm=function(q){return window.matchMedia&&matchMedia(q).matches};
var reduce=mm('(prefers-reduced-motion: reduce)');
var fine=mm('(hover: hover) and (pointer: fine)');

/* ---- live Lagos clock (Africa/Lagos, 24h, ticks every second) ---- */
(function(){
  var els=d.querySelectorAll('[data-lagos]');
  if(!els.length)return;
  var fmt=null;
  try{fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})}catch(e){}
  function p2(n){return (n<10?'0':'')+n}
  function now(){
    var t=new Date();
    if(fmt)return fmt.format(t);
    var u=new Date(t.getTime()+3600000);
    return p2(u.getUTCHours())+':'+p2(u.getUTCMinutes())+':'+p2(u.getUTCSeconds());
  }
  var last='',timer=0;
  function tick(){
    var v=now();
    if(v!==last){last=v;for(var i=0;i<els.length;i++)els[i].textContent=v}
    timer=setTimeout(tick,1000-(Date.now()%1000)+10);
  }
  tick();
  d.addEventListener('visibilitychange',function(){
    clearTimeout(timer);
    if(!d.hidden)tick();
  });
})();

/* ---- magnetic buttons ---- */
if(fine&&!reduce){
  var btns=d.querySelectorAll('.btn');
  Array.prototype.forEach.call(btns,function(b){
    if(b.closest('.sheet'))return;
    var tm=0;
    b.addEventListener('pointermove',function(e){
      if(e.pointerType&&e.pointerType!=='mouse')return;
      var r=b.getBoundingClientRect();
      var x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;
      clearTimeout(tm);b.style.transition='';
      b.style.translate=(x*12).toFixed(1)+'px '+(y*9).toFixed(1)+'px';
    },{passive:true});
    b.addEventListener('pointerleave',function(){
      b.style.transition='translate .55s cubic-bezier(.2,.8,.2,1),background .3s,color .3s,border-color .3s';
      b.style.translate='0 0';
      tm=setTimeout(function(){b.style.transition='';b.style.translate=''},600);
    });
  });
}

/* ---- cursor: dot + ring + short trail ---- */
if(fine){
  var mk=function(c){var e=d.createElement('div');e.className='cur '+c;e.setAttribute('aria-hidden','true');d.body.appendChild(e);return e};
  var dot=mk('cur-dot'),ring=mk('cur-ring'),lab=d.createElement('b');
  ring.appendChild(lab);
  var t1=reduce?null:mk('cur-t t1'),t2=reduce?null:mk('cur-t t2');
  var mx=0,my=0,rx=0,ry=0,ax=0,ay=0,bx=0,by=0,running=false,seen=false;
  var put=function(e,x,y){e.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)'};
  var loop=function(){
    if(reduce){rx=mx;ry=my}else{
      rx+=(mx-rx)*.2;ry+=(my-ry)*.2;ax+=(mx-ax)*.12;ay+=(my-ay)*.12;bx+=(mx-bx)*.07;by+=(my-by)*.07;
      put(t1,ax,ay);put(t2,bx,by);
    }
    put(dot,mx,my);put(ring,rx,ry);
    if(!reduce&&(Math.abs(mx-rx)+Math.abs(my-ry)+Math.abs(mx-bx)+Math.abs(my-by)>.4))requestAnimationFrame(loop);else running=false;
  };
  var HOV='a,button,summary,label,[role="button"],[data-vm],.wcard,.filters button,input[type="submit"],select';
  d.addEventListener('pointermove',function(e){
    if(e.pointerType&&e.pointerType!=='mouse')return;
    mx=e.clientX;my=e.clientY;
    if(!seen){seen=true;rx=ax=bx=mx;ry=ay=by=my;root.classList.add('cur-on')}
    root.classList.remove('cur-out');
    if(!running){running=true;requestAnimationFrame(loop)}
  },{passive:true});
  d.addEventListener('pointerover',function(e){
    if(e.pointerType&&e.pointerType!=='mouse')return;
    var t=e.target&&e.target.closest?e.target:null;
    var h=t&&t.closest(HOV),v=t&&t.closest('.wcard .shot');
    root.classList.toggle('cur-hover',!!h);
    root.classList.toggle('cur-view',!!v);
    lab.textContent='';
  },{passive:true});
  d.addEventListener('pointerdown',function(){root.classList.add('cur-press')});
  d.addEventListener('pointerup',function(){root.classList.remove('cur-press')});
  root.addEventListener('mouseleave',function(){root.classList.add('cur-out')});
  root.addEventListener('mouseenter',function(){root.classList.remove('cur-out')});
  window.addEventListener('blur',function(){root.classList.add('cur-out')});
}
})();

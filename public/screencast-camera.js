"use strict";(()=>{var k="225, 17, 17",N=`
  #evidence-chapter {
    --chapter-title: #ffd24a;
    --chapter-white: #fff;
    --chapter-black: #000;
    --chapter-panel: rgba(17, 17, 17, .78);
    --chapter-dim: rgba(0, 0, 0, .48);
    --chapter-font: ui-sans-serif, system-ui, sans-serif;
    z-index: 1;
  }
  #evidence-chapter > :first-child {
    position: absolute;
    inset: 0;
    background: var(--chapter-dim);
    opacity: 0;
  }
  #evidence-chapter > :last-child {
    position: absolute;
    top: 24px;
    left: 24px;
    transition: top 150ms ease-out, left 150ms ease-out, transform 150ms ease-out;
    width: max-content;
    max-width: min(60vw, calc(100vw - 48px));
    box-sizing: border-box;
    padding: 18px 20px;
    border: 1px solid rgba(255, 255, 255, .35);
    border-radius: 12px;
    background: var(--chapter-panel);
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, .3);
    text-align: left;
    font-family: var(--chapter-font);
    font-weight: 600;
    font-style: normal;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }
  #evidence-chapter > :last-child > :first-child {
    color: var(--chapter-title);
    font-size: 16px;
    line-height: 1.4;
  }
  #evidence-chapter[data-focused] > :last-child {
    transition: none;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  #evidence-chapter > :last-child > :last-child {
    margin-top: 8px;
    color: var(--chapter-white);
    font-size: 22px;
    line-height: 1.4;
  }
  #evidence-chapter > :last-child > :last-child:empty { display: none; }
  #evidence-guide {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow: hidden;
    pointer-events: none;
    z-index: 2147483647;
  }
  #evidence-cursor {
    z-index: 2;
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    opacity: 0;
    will-change: transform;
  }
  #evidence-cursor .halo {
    position: absolute;
    left: -30px;
    top: -30px;
    width: 60px;
    height: 60px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(${k}, .45) 0%, rgba(${k}, .18) 42%, rgba(${k}, 0) 70%);
    will-change: transform, opacity;
  }
  #evidence-cursor svg {
    position: absolute;
    left: -4px;
    top: -4px;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, .45));
  }
  .evidence-ripple {
    position: absolute;
    left: 0;
    top: 0;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border-radius: 999px;
    border: 2px solid rgba(${k}, .9);
    will-change: transform, opacity;
  }
`;function A(){let s=document.createElement("style");s.id="evidence-guide-style",s.textContent=N;let t=document.createElement("div");t.id="evidence-guide",t.setAttribute("popover","manual");let d=document.createElement("div");d.id="evidence-cursor";let c=document.createElement("div");c.className="halo";let u=document.createElementNS("http://www.w3.org/2000/svg","svg");for(let[v,r]of Object.entries({width:"32",height:"32",viewBox:"0 0 24 24",fill:"none"}))u.setAttribute(v,r);let f=document.createElementNS("http://www.w3.org/2000/svg","path");for(let[v,r]of Object.entries({d:"M22 10.2069L3 3L10.2069 22L13.4828 13.4828L22 10.2069Z",fill:"#ffffff",stroke:"#0b1220","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round",filter:"drop-shadow(0 0 2px rgba(0,0,0,.8))"}))f.setAttribute(v,r);u.appendChild(f),d.append(c,u),t.appendChild(d);function x(){if(!document.documentElement||(s.isConnected||document.documentElement.appendChild(s),t.isConnected))return!1;document.documentElement.appendChild(t);try{t.showPopover()}catch{t.style.zIndex="2147483647"}return!0}function E(){if(!(!t.isConnected||!document.querySelector("dialog[open]:not(#evidence-guide), [popover]:popover-open:not(#evidence-guide)")))try{t.hidePopover(),t.showPopover()}catch{}}function w(v,r){let p=document.createElement("div");p.id=v,p.style.cssText="position:absolute;inset:0;pointer-events:none;";let a=({style:e,text:n,children:o=[]})=>{let l=document.createElement("div");return l.style.cssText=e,n!==void 0&&(l.textContent=n),l.append(...o.map(a)),l};p.append(...r.map(a)),t.insertBefore(p,d)}function M(){t.remove(),s.remove(),t.replaceChildren(d)}return{root:t,cursor:d,halo:c,mount:x,raise:E,mountOverlay:w,clear:M}}function L(s,t,d){let c=null,u=null,f=0,x=[];function E(r,p){c={x:r,y:p}}function w(r,p){let a=document.createElement("div");a.className="evidence-ripple",a.style.opacity="0",s.appendChild(a),x.push({el:a,x:r,y:p,elapsed:0})}function M(r){let p=!1;if(c){u||(u={x:0,y:0});let a=1-Math.exp(-r/70),e=(c.x-u.x)*a,n=(c.y-u.y)*a,o=40*r/16.7,l=Math.hypot(e,n);l>o&&(e=e/l*o,n=n/l*o);let h=u.x+e,i=u.y+n,m=Math.hypot(e,n);f+=(m/r*1e3-f)*.3,m<.05?(u={x:c.x,y:c.y},f*=.5):(u={x:h,y:i},p=!0),f>2&&(p=!0),t.style.opacity="1",t.style.transform=`translate3d(${u.x}px, ${u.y}px, 0)`;let b=Math.min(f/1500,1);d.style.transform=`scale(${.55+b*.75})`,d.style.opacity=String(b*.9)}return x=x.filter(a=>{a.elapsed+=r;let e=Math.min(1,a.elapsed/560),n=1-Math.pow(1-e,3);return a.el.style.transform=`translate3d(${a.x}px, ${a.y}px, 0) scale(${.4+n*3})`,a.el.style.opacity=String((1-n)*.9),e>=1?(a.el.remove(),!1):!0}),p||x.length>0}function v(){c=null,u=null,f=0;for(let r of x)r.el.remove();x=[],t.style.opacity="0",d.style.opacity="0"}return{setTarget:E,ripple:w,frame:M,reset:v}}var P=s=>new Promise(t=>setTimeout(t,s));function S(s){let t=0,d=!1,c;function u(){c=void 0,s.clear()}async function f(e){if(e){if(e instanceof Element){if(!e.isConnected||!e.getClientRects().length)throw new Error("screencast target is not visible");for(s.prepare(e,900);s.busy();)await new Promise(n=>requestAnimationFrame(()=>n()));e=e.getBoundingClientRect()}await s.move(e.x+e.width/2,e.y+e.height/2)}}async function x(e,n){let o=`evidence-overlay-${++t}`;s.mountOverlay(o,e);let l=document.getElementById(o),h=async()=>{l.remove()};return n?.duration!=null&&(await P(n.duration),await h()),{dispose:h}}async function E(e,n){let o=n?.description??"";if(c?.title===e&&c.description===o)return;c={title:e,description:o};let l="evidence-chapter",h=document.getElementById(l);h||(s.mountOverlay(l,[{style:""},{style:"",children:[{style:""},{style:""}]}]),h=document.getElementById(l));let i=h.lastElementChild;i.children[0].textContent=e,i.children[1].textContent=o;let m=n?.duration??3e3;if(m<=0)return;let b=h.firstElementChild;h.setAttribute("data-focused",""),b.style.opacity="1";let y=Math.min(300,m),g;try{await P(m-y),g=b.animate([{opacity:1},{opacity:0}],{duration:y,easing:"ease-out",fill:"forwards"}),await g.finished}finally{h.removeAttribute("data-focused"),b.style.opacity="0",g?.cancel()}}async function w(e,n,o){await f(e),d||await P(o?.lead??350);let l=e.getBoundingClientRect();s.ripple(l.x+l.width/2,l.y+l.height/2),M(e,n),d||await P(o?.trail??450)}function M(e,n){if(!(e instanceof HTMLElement))throw new Error("DOM click requires an HTMLElement");if(e.focus({preventScroll:!0}),n==="click")e.click();else{let o=e.getBoundingClientRect();e.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0,view:window,button:0,buttons:1,clientX:o.x+o.width/2,clientY:o.y+o.height/2}))}}let v=(e,n)=>w(e,"click",n),r=(e,n)=>w(e,"mousedown",n);async function p(e,n){await f(e);let o=e.getBoundingClientRect(),l=Math.min(o.y+o.height+10,innerHeight-80),h=Math.max(12,Math.min(o.x,innerWidth-440));await x([{style:`position:absolute;top:${o.y-3}px;left:${o.x-3}px;width:${o.width+6}px;height:${o.height+6}px;border:2px solid #e11;border-radius:4px;box-shadow:0 0 0 9999px rgba(0,0,0,.28);`},{style:`position:absolute;top:${l}px;left:${h}px;max-width:420px;padding:8px 12px;border:1px solid rgba(255,255,255,.35);background:#111;color:#fff;border-radius:8px;font:14px/1.4 ui-sans-serif,system-ui;box-shadow:0 4px 16px rgba(0,0,0,.35);`,text:n}],{duration:2600})}function a(e="?"){let n=location.href.indexOf("?");return x([{style:"position:absolute;top:10px;left:50%;transform:translateX(-50%);padding:8px 14px;background:rgba(17,17,17,.9);color:#fff;border-radius:999px;font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.01em;white-space:nowrap;",text:n===-1?e:location.href.slice(n)}])}return{configure:e=>{d=!!e.debug},clear:u,focus:f,click:v,mousedown:r,callout:p,chapter:E,urlChip:a}}function Y(){let s=globalThis;if(s.__screencastCamera)return;let t=null,d=!1,c=0,{root:u,cursor:f,halo:x,mount:E,raise:w,mountOverlay:M,clear:v}=A(),r=L(u,f,x),p=!1;function a(){return p=!1,E()}function e(i){return i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2}function n(i){let m=c?Math.min(64,i-c):16;c=i;let b=!1;if(t){if(t.toX==null){let C=document.scrollingElement||document.documentElement,O=Math.max(0,C.scrollWidth-window.innerWidth),T=Math.max(0,C.scrollHeight-window.innerHeight);t.fromX=window.scrollX,t.fromY=window.scrollY,t.toX=Math.max(0,Math.min(O,t.fromX+t.dx)),t.toY=Math.max(0,Math.min(T,t.fromY+t.dy))}t.elapsed+=m;let y=Math.min(1,t.elapsed/t.duration),g=e(y);window.scrollTo(t.fromX+(t.toX-t.fromX)*g,t.fromY+(t.toY-t.fromY)*g),y>=1?t=null:b=!0}r.frame(m)&&(b=!0),b?requestAnimationFrame(n):(d=!1,c=0)}function o(){d||(d=!0,c=0,requestAnimationFrame(n))}function l(i,m){if(a(),w(),i.closest("dialog, [popover]")?.matches(":modal, :popover-open"))return 0;let y=i.getBoundingClientRect(),g=window.innerWidth,C=window.innerHeight,O=y.x<0||y.right>g?y.x+y.width/2-g/2:0,T=y.y<0||y.bottom>C?y.y+y.height/2-C/2:0;if(Math.abs(O)<1&&Math.abs(T)<1)return 0;let X=Math.max(1,Math.round(m*.7));return t={dx:O,dy:T,fromX:window.scrollX,fromY:window.scrollY,toX:null,toY:null,elapsed:0,duration:X},o(),X}document.addEventListener("mousemove",i=>{p||(a(),r.setTarget(i.clientX,i.clientY),o())},!0),document.addEventListener("mousedown",i=>{p||(a(),r.setTarget(i.clientX,i.clientY),r.ripple(i.clientX,i.clientY),o())},!0);let h={clear(){p=!0,t=null,r.reset(),v()},prepare:l,busy:()=>!!t,mountOverlay(i,m){a(),w(),M(i,m)}};s.__screencastCamera=S({...h,async move(i,m){for(a(),w(),r.setTarget(Math.max(1,Math.min(innerWidth-1,i)),Math.max(1,Math.min(innerHeight-1,m))),o();d;)await new Promise(b=>requestAnimationFrame(()=>b()))},ripple(i,m){r.ripple(i,m),o()}}),s.__getScreencast=function(){let i=s.__screencastCamera;if(!i)throw new Error("screencast guide is not installed");return i}}Y();})();

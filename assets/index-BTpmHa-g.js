const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.esm-CT5ry5Ab.js","assets/index.esm-CIT60TIA.js","assets/index.esm-Cro855-6.js","assets/index.esm-BRDcivt7.js"])))=>i.map(i=>d[i]);
var Pt=Object.defineProperty;var at=Object.getOwnPropertySymbols;var xt=Object.prototype.hasOwnProperty,Ct=Object.prototype.propertyIsEnumerable;var rt=(t,e,n)=>e in t?Pt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,L=(t,e)=>{for(var n in e||(e={}))xt.call(e,n)&&rt(t,n,e[n]);if(at)for(var n of at(e))Ct.call(e,n)&&rt(t,n,e[n]);return t};var _t=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var u=(t,e,n)=>new Promise((r,s)=>{var a=c=>{try{d(n.next(c))}catch(g){s(g)}},l=c=>{try{d(n.throw(c))}catch(g){s(g)}},d=c=>c.done?r(c.value):Promise.resolve(c.value).then(a,l);d((n=n.apply(t,e)).next())});var me=_t(Bt=>{(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const i={body:document.body,html:document.documentElement,timeDisplay:document.getElementById("time-display"),mainBtn:document.getElementById("main-btn"),skipBtn:document.getElementById("skip-btn"),statusText:document.getElementById("status-text"),modeBtns:document.querySelectorAll(".mode-btn"),progressCircle:document.querySelector(".progress-ring__circle"),sounds:{bell:document.getElementById("bell-sound"),bird:document.getElementById("bird-sound"),digital:document.getElementById("digital-sound"),tick:document.getElementById("tick-sound"),rain:document.getElementById("rain-sound")},form:document.getElementById("add-task-form"),taskInput:document.getElementById("task-input"),estPomodorosInput:document.getElementById("est-pomodoros-input"),taskList:document.getElementById("task-list"),settingsBtn:document.getElementById("settings-btn"),settingsModal:document.getElementById("settings-modal"),closeSettingsBtn:document.getElementById("close-settings-btn"),saveSettingsBtn:document.getElementById("save-settings-btn"),inputs:{pomodoro:document.getElementById("setting-pomodoro"),shortBreak:document.getElementById("setting-shortBreak"),longBreak:document.getElementById("setting-longBreak"),longBreakInterval:document.getElementById("setting-longBreakInterval"),autoStartBreaks:document.getElementById("setting-autoStartBreaks"),autoStartPomodoros:document.getElementById("setting-autoStartPomodoros"),alarmSound:document.getElementById("setting-alarmSound"),tickingSound:document.getElementById("setting-tickingSound"),volume:document.getElementById("setting-volume"),darkMode:document.getElementById("setting-darkMode")},volumeDisplay:document.getElementById("volume-display"),authBtn:document.getElementById("auth-btn"),authUsername:document.getElementById("auth-username"),authModal:document.getElementById("auth-modal"),closeAuthBtn:document.getElementById("close-auth-btn"),authLoggedOutView:document.getElementById("auth-logged-out-view"),authLoggedInView:document.getElementById("auth-logged-in-view"),googleLoginBtn:document.getElementById("google-login-btn"),emailAuthForm:document.getElementById("email-auth-form"),authEmail:document.getElementById("auth-email"),authPassword:document.getElementById("auth-password"),emailLoginBtn:document.getElementById("email-login-btn"),emailRegisterBtn:document.getElementById("email-register-btn"),authErrorMsg:document.getElementById("auth-error-msg"),logoutBtn:document.getElementById("logout-btn"),userDisplayName:document.getElementById("user-display-name"),userEmail:document.getElementById("user-email"),syncIndicator:document.getElementById("sync-indicator"),statTotalPomodoros:document.getElementById("stat-total-pomodoros"),statTodayTime:document.getElementById("stat-today-time"),timerSection:document.querySelector(".timer-section"),pipBtn:document.getElementById("pip-btn")},o={mode:"pomodoro",timeRemaining:1500,isRunning:!1,timerId:null,pomodorosCompleted:0,tasks:[],activeTaskId:null,settings:{pomodoro:25,shortBreak:5,longBreak:15,longBreakInterval:4,autoStartBreaks:!1,autoStartPomodoros:!1,alarmSound:"bell",tickingSound:"none",volume:50,darkMode:!0},focusHistory:{}},mt={onStateChange:()=>{}};function S(){mt.onStateChange(o)}function At(){const t=localStorage.getItem("pomodoro_settings");if(t)try{const e=JSON.parse(t);e.settings?o.settings=L(L({},o.settings),e.settings):e.pomodoro&&(o.settings=L(L({},o.settings),e)),o.focusHistory=e.focusHistory||{}}catch(e){console.error("Failed to parse pomodoro_settings from localStorage",e)}}function Dt(){const t=Object.keys(o.focusHistory).sort((e,n)=>new Date(n)-new Date(e));if(t.length>365){const e={};for(let n=0;n<365;n++)e[t[n]]=o.focusHistory[t[n]];o.focusHistory=e}localStorage.setItem("pomodoro_settings",JSON.stringify({settings:o.settings,focusHistory:o.focusHistory}))}function Mt(){const t=i.sounds[o.settings.alarmSound];t&&(!t.src&&t.dataset.src&&(t.src=t.dataset.src,t.load()),t.currentTime=0,t.play().catch(e=>console.log("Audio blocked",e)))}function ut(t){if(i.sounds.tick&&i.sounds.tick.pause(),i.sounds.rain&&i.sounds.rain.pause(),t&&o.settings.tickingSound!=="none"){const e=i.sounds[o.settings.tickingSound];e&&(!e.src&&e.dataset.src&&(e.src=e.dataset.src,e.load()),e.loop=!0,e.play().catch(n=>console.log("Audio blocked",n)))}}function G(){const t=o.settings.volume/100;Object.values(i.sounds).forEach(e=>{e&&(e.volume=t)})}function Rt(t){const e=t.target;return e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.isContentEditable}function Ot(t,e){let n;return function(...s){const a=()=>{clearTimeout(n),t(...s)};clearTimeout(n),n=setTimeout(a,e)}}function ct(t,e){if(t.key!=="Tab")return;const n=e.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),r=n[0],s=n[n.length-1];t.shiftKey?document.activeElement===r&&(s.focus(),t.preventDefault()):document.activeElement===s&&(r.focus(),t.preventDefault())}function X(t){return new Promise(e=>{const n=document.getElementById("confirm-modal"),r=document.getElementById("confirm-message"),s=document.getElementById("confirm-ok-btn"),a=document.getElementById("confirm-cancel-btn");if(!n){e(window.confirm(t));return}r.textContent=t,n.classList.remove("hidden");const l=()=>{n.classList.add("hidden"),s.removeEventListener("click",d),a.removeEventListener("click",c)},d=()=>{l(),e(!0)},c=()=>{l(),e(!1)};s.addEventListener("click",d),a.addEventListener("click",c)})}let C=null,q=0,F=null;const _={onPomodoroComplete:()=>{},onPomodoroStart:null},Nt=i.progressCircle.r.baseVal.value,V=Nt*2*Math.PI;i.progressCircle.style.strokeDasharray=`${V} ${V}`;i.progressCircle.style.strokeDashoffset=0;function $t(t){const e=V-t/100*V;i.progressCircle.style.strokeDashoffset=e}function Ht(t){const n=`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="${t==="pomodoro"?"#ba4949":t==="shortBreak"?"#38858a":"#397097"}" />
            <path d="M50 20V50L70 70" stroke="white" stroke-width="8" stroke-linecap="round" fill="none" />
        </svg>
    `.trim();let r=document.querySelector("link[rel~='icon']");r||(r=document.createElement("link"),r.rel="icon",document.head.appendChild(r)),r.href=`data:image/svg+xml,${encodeURIComponent(n)}`}function J(t){const e=Math.floor(t/60),n=t%60;return`${e.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`}function z(){i.timeDisplay.textContent=J(o.timeRemaining);const t=o.settings[o.mode]*60,n=Math.max(0,o.timeRemaining/t)*100;$t(100-n),document.title=`${J(o.timeRemaining)} - ${Ut(o.mode)}`}function Ut(t){switch(t){case"pomodoro":return"Focus";case"shortBreak":return"Short Break";case"longBreak":return"Long Break";default:return"Pomodoro"}}function b(t){return u(this,null,function*(){if(o.isRunning){if(!(yield X("Timer is running. Are you sure you want to switch modes?"))){i.modeBtns.forEach(n=>{n.classList.toggle("active",n.dataset.mode===o.mode)});return}Z(!1)}q=0,C=null,o.mode=t,o.timeRemaining=o.settings[t]*60,i.body.className=`mode-${t}`,i.modeBtns.forEach(e=>{const n=e.dataset.mode===t;e.classList.toggle("active",n),e.setAttribute("aria-pressed",n.toString())}),z(),Q(),Ht(t)})}function Q(){o.isRunning?i.statusText.textContent=o.mode==="pomodoro"?"Focus time!":"Take a break":i.statusText.textContent=o.mode==="pomodoro"?"Ready to focus?":"Ready to rest?"}function Y(){return u(this,null,function*(){o.mode==="pomodoro"&&!o.activeTaskId&&_.onPomodoroStart&&!(yield _.onPomodoroStart())||(o.isRunning=!0,i.mainBtn.textContent="Pause",i.mainBtn.setAttribute("aria-label","Pause Timer"),i.timeDisplay.parentElement.classList.add("is-running"),i.timeDisplay.closest(".timer-section").classList.add("running"),Q(),ut(!0),"Notification"in window&&Notification.permission!=="granted"&&Notification.permission!=="denied"&&Notification.requestPermission(),C=Date.now(),F=C+o.timeRemaining*1e3,o.timerId=setInterval(()=>{const t=Math.max(0,Math.ceil((F-Date.now())/1e3));o.timeRemaining!==t&&(o.timeRemaining=t,z()),o.timeRemaining<=0&&nt()},200))})}document.addEventListener("visibilitychange",()=>{if(!document.hidden&&o.isRunning&&F){const t=Math.max(0,Math.ceil((F-Date.now())/1e3));o.timeRemaining=t,z(),o.timeRemaining<=0&&nt()}});function Z(t=!1){o.timerId&&(clearInterval(o.timerId),o.timerId=null),C&&(q+=Date.now()-C,C=null),o.isRunning=!1,i.mainBtn.textContent="Start",i.mainBtn.setAttribute("aria-label","Start Timer"),i.timeDisplay.parentElement.classList.remove("is-running"),i.timeDisplay.closest(".timer-section").classList.remove("running"),ut(!1),t||Q()}function tt(){return u(this,null,function*(){o.isRunning?Z():yield Y()})}function et(){return u(this,null,function*(){o.isRunning&&!(yield X("Are you sure you want to skip the current phase?"))||nt(!0)})}function K(t,e){"Notification"in window&&Notification.permission==="granted"&&new Notification(t,{body:e,icon:"favicon.ico"})}function nt(t=!1){if(Z(!0),t||Mt(),o.mode==="pomodoro"){if(!t){o.pomodorosCompleted++;const e=new Date().toISOString().split("T")[0];o.focusHistory[e]||(o.focusHistory[e]={seconds:0,pomodoros:0}),o.focusHistory[e].pomodoros++;const n=Math.round(q/1e3);o.focusHistory[e].seconds+=n,q=0,S(),_.onPomodoroComplete()}o.pomodorosCompleted>0&&o.pomodorosCompleted%o.settings.longBreakInterval===0?(t||K("Pomodoro Completed!","Time for a long break."),b("longBreak")):(t||K("Pomodoro Completed!","Time for a short break."),b("shortBreak")),o.settings.autoStartBreaks&&setTimeout(Y,1e3)}else t||K("Break is over!","Time to focus."),b("pomodoro"),o.settings.autoStartPomodoros&&setTimeout(Y,1e3)}const O=Object.freeze(Object.defineProperty({__proto__:null,formatTime:J,setMode:b,skipPhase:et,timerEvents:_,toggleTimer:tt,updateDisplay:z},Symbol.toStringTag,{value:"Module"})),pt={onTaskActivated:()=>{}};function qt(){return o.tasks.find(t=>!t.isCompleted)||null}function Ft(){const t=localStorage.getItem("pomodoro_tasks");if(t){try{o.tasks=JSON.parse(t)}catch(n){o.tasks=[]}const e=o.tasks.find(n=>n.isActive);e&&(o.activeTaskId=e.id),B()}}function P(){localStorage.setItem("pomodoro_tasks",JSON.stringify(o.tasks))}function Vt(t,e){t=t.substring(0,200);const n=o.tasks.length===0,s={id:typeof crypto!="undefined"&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),title:t,estPomodoros:Math.min(100,Math.max(1,parseInt(e)||1)),actualPomodoros:0,isCompleted:!1,isActive:n};n&&(o.activeTaskId=s.id),o.tasks.push(s),P(),B(),S()}function jt(t){const e=o.tasks.find(n=>n.id===t);e&&(e.isCompleted=!e.isCompleted,e.isCompleted&&e.isActive&&(e.isActive=!1,o.activeTaskId=null),P(),B(),S())}function gt(t){const e=o.tasks.find(n=>n.id===t);e&&!e.isCompleted&&(o.tasks.forEach(n=>n.isActive=!1),e.isActive=!0,o.activeTaskId=t,P(),B(),S(),pt.onTaskActivated())}function zt(t){o.tasks=o.tasks.filter(e=>e.id!==t),o.activeTaskId===t&&(o.activeTaskId=null),P(),B(),S()}function Wt(){if(!o.activeTaskId)return;const t=o.tasks.find(e=>e.id===o.activeTaskId);t&&(t.actualPomodoros++,P(),B(),S())}function B(){if(o.tasks.length===0){i.taskList.innerHTML='<div style="text-align: center; color: var(--clr-text-muted); font-size: 0.9rem; padding: 1rem 0;">No tasks yet. Add one above!</div>';return}const t=i.taskList.querySelector("div[style]");t&&t.remove();const e=Array.from(i.taskList.children),n=new Map;e.forEach(s=>{const a=s.querySelector('[data-action="toggle"]');a&&a.dataset.id?n.set(a.dataset.id,s):s.remove()});let r=null;o.tasks.forEach(s=>{let a=n.get(s.id);const l=document.createElement("div");l.textContent=s.title;const d=l.innerHTML,c=`${s.actualPomodoros} / ${s.estPomodoros} ${s.actualPomodoros===1&&s.estPomodoros===1?"pomodoro":"pomodoros"}`;if(a){a.className=`task-item ${s.isActive?"active":""} ${s.isCompleted?"completed":""}`;const g=a.querySelector(".task-text");g.innerHTML!==d&&(g.innerHTML=d);const m=a.querySelector(".task-stats");m.textContent!==c&&(m.textContent=c),n.delete(s.id)}else{a=document.createElement("div"),a.className=`task-item ${s.isActive?"active":""} ${s.isCompleted?"completed":""}`,a.innerHTML=`
                <div class="task-check" data-action="toggle" data-id="${s.id}" title="Toggle completion">
                    <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                </div>
                <div class="task-content" data-action="activate" data-id="${s.id}" draggable="true">
                    <div class="task-text">${d}</div>
                    <div class="task-stats">${c}</div>
                </div>
                <div class="task-actions">
                    <button class="action-btn delete-btn" data-action="delete" data-id="${s.id}" title="Delete Task">
                        <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                    </button>
                </div>
            `;const g=a.querySelector(".task-content");g.addEventListener("dragstart",m=>{a.classList.add("dragging"),m.dataTransfer.setData("text/plain",s.id),m.dataTransfer.effectAllowed="move"}),g.addEventListener("dragend",()=>{a.classList.remove("dragging"),document.querySelectorAll(".task-item").forEach(m=>m.classList.remove("drag-over"))}),a.addEventListener("dragover",m=>{m.preventDefault(),m.dataTransfer.dropEffect="move",a.classList.add("drag-over")}),a.addEventListener("dragleave",()=>a.classList.remove("drag-over")),a.addEventListener("drop",m=>{m.preventDefault();const y=m.dataTransfer.getData("text/plain");y!==s.id&&Kt(y,s.id)})}r?r.nextSibling!==a&&r.after(a):i.taskList.firstChild!==a&&i.taskList.prepend(a),r=a}),n.forEach(s=>s.remove())}function Kt(t,e){const n=o.tasks.findIndex(s=>s.id===t),r=o.tasks.findIndex(s=>s.id===e);if(n!==-1&&r!==-1){const[s]=o.tasks.splice(n,1);o.tasks.splice(r,0,s),P(),B(),S()}}function ft(){i.inputs.pomodoro.value=o.settings.pomodoro,i.inputs.shortBreak.value=o.settings.shortBreak,i.inputs.longBreak.value=o.settings.longBreak,i.inputs.longBreakInterval.value=o.settings.longBreakInterval,i.inputs.autoStartBreaks.checked=o.settings.autoStartBreaks,i.inputs.autoStartPomodoros.checked=o.settings.autoStartPomodoros,i.inputs.alarmSound.value=o.settings.alarmSound,i.inputs.tickingSound.value=o.settings.tickingSound,i.inputs.volume.value=o.settings.volume,i.volumeDisplay.textContent=o.settings.volume,i.inputs.darkMode.checked=o.settings.darkMode}function ot(){o.settings.darkMode?i.html.removeAttribute("data-theme"):i.html.setAttribute("data-theme","light")}function Jt(){o.settings.pomodoro=Math.min(90,Math.max(1,parseInt(i.inputs.pomodoro.value)||25)),o.settings.shortBreak=Math.min(30,Math.max(1,parseInt(i.inputs.shortBreak.value)||5)),o.settings.longBreak=Math.min(60,Math.max(1,parseInt(i.inputs.longBreak.value)||15)),o.settings.longBreakInterval=Math.min(10,Math.max(1,parseInt(i.inputs.longBreakInterval.value)||4)),o.settings.autoStartBreaks=i.inputs.autoStartBreaks.checked,o.settings.autoStartPomodoros=i.inputs.autoStartPomodoros.checked,o.settings.alarmSound=i.inputs.alarmSound.value,o.settings.tickingSound=i.inputs.tickingSound.value,o.settings.volume=parseInt(i.inputs.volume.value),o.settings.darkMode=i.inputs.darkMode.checked,Dt(),ot(),G(),o.isRunning||b(o.mode),S()}function D(t){t?(ft(),i.settingsModal.classList.remove("hidden")):i.settingsModal.classList.add("hidden")}const Yt="modulepreload",Gt=function(t){return"/pomodoro/"+t},dt={},k=function(e,n,r){let s=Promise.resolve();if(n&&n.length>0){let g=function(m){return Promise.all(m.map(y=>Promise.resolve(y).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};var l=g;document.getElementsByTagName("link");const d=document.querySelector("meta[property=csp-nonce]"),c=(d==null?void 0:d.nonce)||(d==null?void 0:d.getAttribute("nonce"));s=g(n.map(m=>{if(m=Gt(m),m in dt)return;dt[m]=!0;const y=m.endsWith(".css"),f=y?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${f}`))return;const E=document.createElement("link");if(E.rel=y?"stylesheet":Yt,y||(E.as="script"),E.crossOrigin="",E.href=m,c&&E.setAttribute("nonce",c),document.head.appendChild(E),y)return new Promise((M,R)=>{E.addEventListener("load",M),E.addEventListener("error",()=>R(new Error(`Unable to preload CSS for ${m}`)))})}))}function a(d){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=d,window.dispatchEvent(c),!c.defaultPrevented)throw d}return s.then(d=>{for(const c of d||[])c.status==="rejected"&&a(c.reason);return e().catch(a)})},Xt={apiKey:"YOUR_API_KEY",authDomain:"YOUR_PROJECT_ID.firebaseapp.com",projectId:"YOUR_PROJECT_ID",storageBucket:"YOUR_PROJECT_ID.appspot.com",messagingSenderId:"YOUR_MESSAGING_SENDER_ID",appId:"YOUR_APP_ID"};let N,ht,yt,vt;function it(){return u(this,null,function*(){if(!N)try{const[{initializeApp:t},{getAuth:e,GoogleAuthProvider:n},{getFirestore:r}]=yield Promise.all([k(()=>import("./index.esm-CT5ry5Ab.js"),__vite__mapDeps([0,1])),k(()=>import("./index.esm-Cro855-6.js"),__vite__mapDeps([2,1])),k(()=>import("./index.esm-BRDcivt7.js"),__vite__mapDeps([3,1]))]);N=t(Xt),ht=e(N),yt=r(N),vt=new n,console.log("Firebase modular SDK initialized (Lazy Loaded).")}catch(t){console.error("Firebase initialization failed:",t)}})}function W(){return ht}function kt(){return yt}function Qt(){return vt}const U={onSyncStatusChange:()=>{}};let $=!1,A=!1;function wt(t){return u(this,null,function*(){if(!t||$||A)return;$=!0;const e=kt();if(!e){$=!1;return}U.onSyncStatusChange("syncing");try{const{doc:n,setDoc:r,serverTimestamp:s}=yield k(()=>u(null,null,function*(){const{doc:l,setDoc:d,serverTimestamp:c}=yield import("./index.esm-BRDcivt7.js");return{doc:l,setDoc:d,serverTimestamp:c}}),__vite__mapDeps([3,1])),a=n(e,"users",t.uid);yield r(a,{tasks:o.tasks,settings:o.settings,focusHistory:o.focusHistory,lastSynced:s()},{merge:!0}),U.onSyncStatusChange("synced"),console.log("Data synced to cloud successfully.")}catch(n){U.onSyncStatusChange("error"),console.error("Error syncing to cloud:",n)}finally{$=!1}})}function Zt(t){return u(this,null,function*(){if(!t||A)return;A=!0;const e=kt();if(!e){A=!1;return}try{const{doc:n,getDoc:r}=yield k(()=>u(null,null,function*(){const{doc:l,getDoc:d}=yield import("./index.esm-BRDcivt7.js");return{doc:l,getDoc:d}}),__vite__mapDeps([3,1])),s=n(e,"users",t.uid),a=yield r(s);if(a.exists()){const l=a.data();if(console.log("Cloud data found, merging with local state..."),l.settings&&typeof l.settings=="object"&&(o.settings=L(L({},o.settings),l.settings),ft(),ot(),G(),o.isRunning||b(o.mode)),Array.isArray(l.tasks)){const d=o.tasks,c=l.tasks,g=[...c],m=new Set(c.map(f=>f.id));d.forEach(f=>{m.has(f.id)||g.push(f)}),o.tasks=g;const y=o.tasks.find(f=>f.isActive);y?o.activeTaskId=y.id:o.activeTaskId=null,P(),B()}l.focusHistory&&typeof l.focusHistory=="object"&&(o.focusHistory=l.focusHistory)}else console.log("No cloud data found. Pushing local data up."),yield wt(t)}catch(n){console.error("Error loading from cloud:",n)}finally{A=!1}})}let Et=null;function te(){return u(this,null,function*(){yield it();const t=W();if(!t)return;const{onAuthStateChanged:e}=yield k(()=>u(null,null,function*(){const{onAuthStateChanged:n}=yield import("./index.esm-Cro855-6.js");return{onAuthStateChanged:n}}),__vite__mapDeps([2,1]));e(t,n=>u(null,null,function*(){Et=n,n?(console.log("User logged in:",n.email),ne(n),window.lucide&&window.lucide.createIcons(),yield Zt(n)):(console.log("User logged out"),oe(),window.lucide&&window.lucide.createIcons())})),i.authBtn.addEventListener("click",()=>T(!0)),i.closeAuthBtn.addEventListener("click",()=>T(!1)),i.googleLoginBtn.addEventListener("click",ie),i.emailLoginBtn.addEventListener("click",n=>lt(n,"login")),i.emailRegisterBtn.addEventListener("click",n=>lt(n,"register")),U.onSyncStatusChange=n=>{bt(n)},i.logoutBtn.addEventListener("click",se)})}function ee(){return Et}function T(t){t?(i.authErrorMsg.style.display="none",i.authModal.classList.remove("hidden")):i.authModal.classList.add("hidden")}function ne(t){i.authLoggedOutView.style.display="none",i.authLoggedInView.style.display="block";const e=t.displayName||"Focus Timer User";i.userDisplayName.textContent=e,i.userEmail.textContent=t.email,i.authUsername.textContent=e.split(" ")[0],i.authUsername.style.display="inline"}function oe(){i.authLoggedInView.style.display="none",i.authLoggedOutView.style.display="block",i.authEmail.value="",i.authPassword.value="",i.authUsername.style.display="none",bt("none")}function bt(t){const e=i.syncIndicator;e&&(e.classList.remove("syncing","synced","error"),t==="syncing"?(e.textContent="Syncing...",e.classList.add("syncing")):t==="synced"?(e.textContent="Synced",e.classList.add("synced")):t==="error"?(e.textContent="Sync Error",e.classList.add("error")):t==="none"&&(e.textContent="Not Logged In"))}function j(t){i.authErrorMsg.textContent=t,i.authErrorMsg.style.display="block"}function ie(){return u(this,null,function*(){yield it();const t=W(),e=Qt();if(!t||!e)return j("Firebase not configured");const{signInWithPopup:n}=yield k(()=>u(null,null,function*(){const{signInWithPopup:r}=yield import("./index.esm-Cro855-6.js");return{signInWithPopup:r}}),__vite__mapDeps([2,1]));try{yield n(t,e),T(!1)}catch(r){j(r.message)}})}function lt(t,e){return u(this,null,function*(){if(t.preventDefault(),!i.emailAuthForm.checkValidity()){i.emailAuthForm.reportValidity();return}yield it();const n=W();if(!n)return j("Firebase not configured");const r=i.authEmail.value,s=i.authPassword.value,{signInWithEmailAndPassword:a,createUserWithEmailAndPassword:l}=yield k(()=>u(null,null,function*(){const{signInWithEmailAndPassword:d,createUserWithEmailAndPassword:c}=yield import("./index.esm-Cro855-6.js");return{signInWithEmailAndPassword:d,createUserWithEmailAndPassword:c}}),__vite__mapDeps([2,1]));try{e==="login"?yield a(n,r,s):yield l(n,r,s),T(!1)}catch(d){let c="An error occurred. Please try again.";d.code==="auth/email-already-in-use"?c="Email already in use.":d.code==="auth/wrong-password"||d.code==="auth/user-not-found"||d.code==="auth/invalid-credential"?c="Invalid email or password.":d.code==="auth/too-many-requests"?c="Too many attempts. Please try again later.":d.code==="auth/weak-password"?c="Password is too weak. Must be at least 6 characters.":d.code==="auth/invalid-email"&&(c="Invalid email format."),j(c)}})}function se(){return u(this,null,function*(){const t=W();if(!t)return;const{signOut:e}=yield k(()=>u(null,null,function*(){const{signOut:n}=yield import("./index.esm-Cro855-6.js");return{signOut:n}}),__vite__mapDeps([2,1]));try{yield e(t),T(!1)}catch(n){console.error("Sign out error",n)}})}function It(){const t=new Date().toLocaleDateString("en-CA"),e=o.focusHistory[t]||{seconds:0},n=Object.values(o.focusHistory).reduce((a,l)=>a+l.pomodoros,0),r=Math.floor(e.seconds/3600),s=Math.floor(e.seconds%3600/60);i.statTotalPomodoros.textContent=n,i.statTodayTime.textContent=`${r}h ${s}m`}let p=null,H=null;function ae(){return"documentPictureInPicture"in window}function re(){if(ae()){const t=document.getElementById("pip-btn");t&&(t.style.display="block")}}function St(){return u(this,null,function*(){if(p){p.close();return}try{const t=document.querySelector(".timer-section");if(!t)return console.error("Timer section not found");console.log("PiP: Requesting window..."),p=yield window.documentPictureInPicture.requestWindow({width:240,height:240}),console.log("PiP: Copying styles..."),de(p),requestAnimationFrame(()=>{try{console.log("PiP: Injecting content..."),H=t.parentNode;const e=t.nextSibling,n=p.document.adoptNode(t);p.document.body.append(n),p.document.body.classList.add("pip-body");const r=n.querySelector("#current-task-display"),s=n.querySelector(".timer-display"),a=n.querySelector(".progress-ring");a&&!a.getAttribute("viewBox")&&a.setAttribute("viewBox","0 0 250 250");const l=r?ce(r):null,d=r?r.nextSibling:null;r&&s&&s.appendChild(r);const c=p.document.createElement("div");c.id="pip-overlay",c.className="pip-overlay hidden";const g='<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',m='<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',y='<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>';c.innerHTML=`
                    <div class="pip-control-icon play-pause-btn">
                        ${o.isRunning?m:g}
                        <span class="pip-control-label">${o.isRunning?"Stop":"Resume"}</span>
                    </div>
                    <div class="pip-control-icon skip-btn">
                        ${y}
                        <span class="pip-control-label">Skip</span>
                    </div>
                `,p.document.body.appendChild(c);const f=()=>{if(!p||p.closed)return;const v=document.body.className.split(" ").find(w=>w.startsWith("mode-"))||"mode-pomodoro";p.document.body.className=`pip-body ${v}`,s&&(o.isRunning?s.classList.add("is-running"):s.classList.remove("is-running"));const h=c.querySelector(".play-pause-btn");if(h){const w='<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',x='<svg viewBox="0 0 24 24" width="min(12vmin, 2.8rem)" height="min(12vmin, 2.8rem)" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';h.innerHTML=`
                            ${o.isRunning?x:w}
                            <span class="pip-control-label">${o.isRunning?"Stop":"Resume"}</span>
                        `}I()},E=new MutationObserver(f);E.observe(document.body,{attributes:!0,attributeFilter:["class"]});const M=new MutationObserver(I),R=document.getElementById("task-list");R&&M.observe(R,{subtree:!0,attributes:!0,attributeFilter:["class"]}),p.document.body.addEventListener("mouseenter",()=>c.classList.remove("hidden")),p.document.body.addEventListener("mouseleave",()=>c.classList.add("hidden"));const Lt=c.querySelector(".play-pause-btn"),Tt=c.querySelector(".skip-btn");Lt.addEventListener("click",v=>u(null,null,function*(){v.stopPropagation();const{toggleTimer:h}=yield k(()=>u(null,null,function*(){const{toggleTimer:w}=yield Promise.resolve().then(()=>O);return{toggleTimer:w}}),void 0);h(),f()})),Tt.addEventListener("click",v=>u(null,null,function*(){v.stopPropagation();const{skipPhase:h}=yield k(()=>u(null,null,function*(){const{skipPhase:w}=yield Promise.resolve().then(()=>O);return{skipPhase:w}}),void 0);h()}));const st=v=>{const h=p.document.createElement("div");h.className="pip-action-feedback";let w="",x="";v==="play"?(w=g,x="Resume"):v==="pause"?(w=m,x="Stop"):v==="skip"&&(w=y,x="Skip"),h.innerHTML=`
                        <div class="icon">${w}</div>
                        <div class="text">${x}</div>
                    `,p.document.body.appendChild(h),requestAnimationFrame(()=>{h.classList.add("show"),setTimeout(()=>{h.classList.remove("show"),setTimeout(()=>h.remove(),300)},600)})};p.document.addEventListener("keydown",v=>{v.code==="Space"?(v.preventDefault(),k(()=>Promise.resolve().then(()=>O),void 0).then(h=>{h.toggleTimer(),f(),st(o.isRunning?"play":"pause")})):v.key.toLowerCase()==="s"?k(()=>Promise.resolve().then(()=>O),void 0).then(h=>{h.skipPhase(),f(),st("skip")}):v.key.toLowerCase()==="p"&&p.close()}),p.addEventListener("pagehide",()=>{console.log("PiP: Closing and restoring..."),p=null,E.disconnect(),M.disconnect(),r&&l&&(d?l.insertBefore(r,d):l.appendChild(r)),H&&n&&(document.adoptNode(n),e?H.insertBefore(n,e):H.appendChild(n))}),f(),console.log("PiP: Success")}catch(e){console.error("PiP Injection Error:",e)}})}catch(t){console.error("PiP Launch Error:",t)}})}function ce(t){return t.parentNode}function de(t){const e=t.document,n=e.createElement("link");n.rel="stylesheet",n.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",e.head.appendChild(n),[...document.styleSheets].forEach(s=>{try{if(s.cssRules){const a=e.createElement("style"),l=[...s.cssRules].map(d=>d.cssText).join("");a.textContent=l,e.head.appendChild(a)}}catch(a){if(s.href){const l=e.createElement("link");l.rel="stylesheet",l.href=s.href,e.head.appendChild(l)}}});const r=e.createElement("style");r.textContent=`
        * { box-sizing: border-box !important; }
        
        body.pip-body {
            background-color: var(--clr-bg-pomodoro) !important;
            margin: 0 !important;
            padding: 0 !important;
            display: grid !important;
            place-items: center !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
            font-family: 'Inter', sans-serif !important;
            color: white !important;
        }
        body.pip-body.mode-shortBreak { background-color: var(--clr-bg-short) !important; }
        body.pip-body.mode-longBreak { background-color: var(--clr-bg-long) !important; }
        
        .timer-section {
            width: 100% !important; 
            height: 100% !important;
            display: flex !important; 
            flex-direction: column !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: 1vmin !important;
            margin: 0 !important; 
            padding: 0 !important;
            background: transparent !important; 
            box-shadow: none !important; 
            border: none !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        .mode-selector, .status-text, .controls, .stats-section, .tasks-section, header { display: none !important; }
        
        .timer-display {
            position: relative !important; 
            width: 90vmin !important; 
            height: 90vmin !important;
            display: flex !important; 
            flex-direction: column !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: 2.5vmin !important;
            background: transparent !important;
            border: none !important;
            margin: 0 !important;
        }
        
        .timer-display.is-running .progress-ring__circle {
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)) !important;
        }
        
        .progress-ring {
            position: absolute !important; 
            top: 50% !important; 
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-90deg) !important; 
            width: 100% !important; 
            height: 100% !important;
            pointer-events: none !important;
        }
        
        .progress-ring__circle, .progress-ring__circle-bg {
            stroke-width: 12 !important;
        }
        
        .time { 
            font-size: min(18vmin, 4.5rem) !important; 
            font-weight: 700 !important; 
            line-height: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 10 !important;
            letter-spacing: -1.5px !important;
        }
        
        #current-task-display {
            font-size: min(4.5vmin, 0.85rem) !important; 
            max-width: 85% !important;
            margin: 0 !important;
            display: none !important;
        }
        #current-task-display.has-task {
            display: block !important;
        }

        .pip-overlay {
            position: fixed !important; 
            top: 0 !important; 
            left: 0 !important;
            width: 100% !important; 
            height: 100% !important;
            background: rgba(0,0,0,0.6) !important;
            display: flex !important; 
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: center !important; 
            align-items: center !important;
            gap: min(8vmin, 20px) !important;
            padding: 0 !important;
            z-index: 1000 !important;
            transition: opacity 0.2s ease !important;
            min-width: 0 !important;
        }
        .pip-overlay.hidden { opacity: 0 !important; pointer-events: none !important; }
        
        .pip-control-icon {
            display: flex !important; 
            flex-direction: column !important;
            align-items: center !important; 
            gap: min(3vmin, 8px) !important;
            cursor: pointer !important;
            pointer-events: auto !important;
            transition: transform 0.2s ease !important;
        }
        .pip-control-icon:hover {
            transform: scale(1.1) !important;
        }
        .pip-control-icon i { font-size: min(12vmin, 2.8rem) !important; color: white !important; }
        .pip-control-icon span { 
            font-weight: 600 !important; 
            text-transform: uppercase !important; 
            letter-spacing: 1.5px !important;
            font-size: min(3vmin, 0.65rem) !important;
        }

        /* Action Feedback Animation */
        .pip-action-feedback {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) scale(0.8) !important;
            background: rgba(0, 0, 0, 0.65) !important;
            color: white !important;
            padding: min(4vmin, 15px) min(6vmin, 25px) !important;
            border-radius: 12px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: min(2vmin, 8px) !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            z-index: 2000 !important;
            backdrop-filter: blur(4px) !important;
            -webkit-backdrop-filter: blur(4px) !important;
        }
        .pip-action-feedback.show {
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(1) !important;
        }
        .pip-action-feedback .icon svg {
            width: min(10vmin, 40px) !important;
            height: min(10vmin, 40px) !important;
        }
        .pip-action-feedback .text {
            font-size: min(3.5vmin, 14px) !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
        }

        /* Responsive Layout for Short Windows or narrow windows */
        @media (max-height: 160px), (max-width: 200px) {
            .progress-ring {
                display: none !important;
            }
            .timer-display {
                width: 100vw !important;
                height: 100vh !important;
            }
            .time {
                font-size: min(40vh, 20vw, 4rem) !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #current-task-display {
                font-size: min(15vh, 8vw, 1.2rem) !important;
                margin: 0 !important;
            }
        }
    `,e.head.appendChild(r)}function I(){let t=null;if(p&&!p.closed&&(t=p.document.getElementById("current-task-display")),t||(t=document.getElementById("current-task-display")),t){const e=document.querySelector(".task-item.active .task-text");e?(t.textContent=e.textContent,t.classList.add("has-task")):(t.textContent="",t.classList.remove("has-task"))}}_.onPomodoroComplete=()=>{Wt(),It()};_.onPomodoroStart=()=>u(null,null,function*(){const t=qt();return t?((yield X(`Bạn chưa chọn công việc nào. Bạn có muốn bắt đầu làm "${t.title}" không?`))&&gt(t.id),!0):(i.form.classList.add("pulse-warning"),setTimeout(()=>i.form.classList.remove("pulse-warning"),1e3),!0)});pt.onTaskActivated=()=>{b("pomodoro"),I()};i.modeBtns.forEach(t=>{t.addEventListener("click",e=>{e.target.classList.contains("active")||b(t.dataset.mode)})});i.mainBtn.addEventListener("click",tt);i.skipBtn.addEventListener("click",et);i.form.addEventListener("submit",t=>{t.preventDefault();const e=i.taskInput.value.trim(),n=i.estPomodorosInput.value;e&&(Vt(e,n),i.taskInput.value="",i.estPomodorosInput.value="1",i.taskInput.focus(),I())});i.taskList.addEventListener("click",t=>{const e=t.target.closest('[data-action="toggle"]');if(e){jt(e.dataset.id),I();return}const n=t.target.closest('[data-action="activate"]');if(n){gt(n.dataset.id),I();return}const r=t.target.closest('[data-action="delete"]');if(r){zt(r.dataset.id),I();return}});i.settingsBtn.addEventListener("click",()=>D(!0));i.closeSettingsBtn.addEventListener("click",()=>D(!1));i.saveSettingsBtn.addEventListener("click",()=>{Jt(),D(!1)});i.inputs.volume.addEventListener("input",t=>{i.volumeDisplay.textContent=t.target.value});i.pipBtn.addEventListener("click",St);document.addEventListener("keydown",t=>{const e=Rt(t),n=!i.settingsModal.classList.contains("hidden"),r=!i.authModal.classList.contains("hidden");n?ct(t,i.settingsModal):r&&ct(t,i.authModal),t.key==="Escape"&&(n&&D(!1),r&&T(!1)),!e&&!t.ctrlKey&&!t.altKey&&!t.metaKey&&!n&&!r&&((t.code==="Space"||t.key===" ")&&(t.preventDefault(),tt()),t.key.toLowerCase()==="s"&&et(),t.key.toLowerCase()==="t"&&(t.preventDefault(),i.taskInput.focus()),t.key.toLowerCase()==="p"&&St())});i.settingsModal.addEventListener("click",t=>{t.target===i.settingsModal&&D(!1)});i.authModal.addEventListener("click",t=>{t.target===i.authModal&&T(!1)});function le(){At(),ot(),G(),Ft(),I(),It(),b("pomodoro"),re(),window.lucide&&window.lucide.createIcons();const t=Ot(()=>{const e=ee();e&&wt(e)},2e3);mt.onStateChange=t,te()}le()});export default me();

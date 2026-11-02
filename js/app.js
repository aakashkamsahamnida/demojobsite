/* Mogus Jobs static demo. For production, replace localStorage auth/jobs with a Java + Spring Boot API. */
const STORAGE_JOBS = "mogusJobs.posts.v1";
const STORAGE_USERS = "mogusJobs.users.v1";
const STORAGE_SESSION = "mogusJobs.session.v1";

const seedJobs = [
  {id:"seed-1",title:"Java Backend Developer",company:"Northstar Technologies",location:"Hyderabad",type:"Full-time",workMode:"Hybrid",level:"Mid level",salary:1200000,skills:"Java, Spring Boot, REST APIs, SQL",description:"Build and maintain reliable REST APIs, collaborate with product teams, and improve backend performance. Experience with Java, Spring Boot, SQL, and testing is helpful.",createdAt:"2026-10-28T10:00:00.000Z",owner:"demo"},
  {id:"seed-2",title:"Frontend Developer",company:"Brightpath Digital",location:"Remote",type:"Full-time",workMode:"Remote",level:"Entry level",salary:700000,skills:"HTML, CSS, JavaScript",description:"Create responsive, accessible web experiences and work with designers and backend developers to deliver polished product features.",createdAt:"2026-10-26T09:00:00.000Z",owner:"demo"},
  {id:"seed-3",title:"Product Designer",company:"Northstar Studio",location:"Hyderabad",type:"Full-time",workMode:"Hybrid",level:"Mid level",salary:1400000,skills:"Figma, UX, UI, Prototyping",description:"Help shape intuitive user experiences from early discovery through high-fidelity design. Work closely with engineering and product partners.",createdAt:"2026-10-24T08:30:00.000Z",owner:"demo"},
  {id:"seed-4",title:"Data Analyst Intern",company:"Greenfield Labs",location:"Bengaluru",type:"Internship",workMode:"On-site",level:"Internship",salary:300000,skills:"SQL, Excel, Python",description:"Support data quality, build clear reports, and help teams turn business questions into useful analysis.",createdAt:"2026-10-22T07:30:00.000Z",owner:"demo"},
  {id:"seed-5",title:"Senior QA Engineer",company:"Orbit Systems",location:"Pune",type:"Full-time",workMode:"Remote",level:"Senior",salary:1800000,skills:"Automation, API testing, Selenium",description:"Own test strategy for key product workflows, develop automation suites, and collaborate with engineering to improve release quality.",createdAt:"2026-10-20T07:30:00.000Z",owner:"demo"},
  {id:"seed-6",title:"Technical Support Associate",company:"Bluepeak Services",location:"Chennai",type:"Part-time",workMode:"On-site",level:"Entry level",salary:450000,skills:"Troubleshooting, Communication, SQL",description:"Help customers solve technical issues, document common fixes, and collaborate with product teams to improve support quality.",createdAt:"2026-10-18T07:30:00.000Z",owner:"demo"}
];
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const safeParse = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
const readJobs = () => safeParse(localStorage.getItem(STORAGE_JOBS), null) || [...seedJobs];
const writeJobs = jobs => localStorage.setItem(STORAGE_JOBS, JSON.stringify(jobs));
const money = amount => amount ? new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(amount)) : "Salary not specified";
const dateText = value => new Date(value).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const initials = name => String(name || "M").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
const toast = message => { const node=$("#toast"); node.textContent=message; node.classList.remove("hidden"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>node.classList.add("hidden"),2800); };
let activeAuthTab = "login";
let otpMode = false;
let generatedOtp = "";
let activeUser = safeParse(localStorage.getItem(STORAGE_SESSION), null);
let savedJobIds = new Set(safeParse(localStorage.getItem("mogusJobs.saved"), []));
let jobs = readJobs();

function renderJobs() {
  const keyword = $("#search-keyword").value.trim().toLowerCase();
  const location = $("#search-location").value.trim().toLowerCase();
  const type = $("#filter-type").value, work = $("#filter-work").value, level = $("#filter-level").value;
  const salary = Number($("#filter-salary").value || 0), sort = $("#sort-jobs").value;
  let list = jobs.filter(job => {
    const searchable = [job.title,job.company,job.skills,job.description,job.location].join(" ").toLowerCase();
    return (!keyword || searchable.includes(keyword)) &&
      (!location || String(job.location).toLowerCase().includes(location) || (location.includes("remote") && job.workMode==="Remote")) &&
      (!type || job.type===type) && (!work || job.workMode===work) && (!level || job.level===level) && Number(job.salary||0)>=salary;
  });
  if(sort==="salary") list.sort((a,b)=>(b.salary||0)-(a.salary||0));
  else if(sort==="company") list.sort((a,b)=>a.company.localeCompare(b.company));
  else list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  $("#results-total").textContent=`${list.length} ${list.length===1?"opportunity":"opportunities"}`;
  $("#results-caption").textContent=`Showing ${list.length} of ${jobs.length} jobs`;
  $("#job-list").innerHTML = list.map((job,index)=>`
    <article class="job-card">
      <div class="job-card-top"><div class="company-logo ${["","purple","orange"][index%3]}">${escapeHTML(initials(job.company))}</div><div><h3>${escapeHTML(job.title)}</h3><div class="job-company">${escapeHTML(job.company)} · ${escapeHTML(job.location)}</div></div><button class="job-save ${savedJobIds.has(job.id)?"saved":""}" data-save-job="${escapeHTML(job.id)}" aria-label="${savedJobIds.has(job.id)?"Unsave":"Save"} job">${savedJobIds.has(job.id)?"♥":"♡"}</button></div>
      <div class="job-meta"><span>${escapeHTML(job.type)}</span><span>${escapeHTML(job.workMode)}</span><span>${escapeHTML(job.level)}</span>${job.skills?`<span>${escapeHTML(job.skills.split(",").slice(0,2).join(", "))}</span>`:""}</div>
      <p class="job-description">${escapeHTML(job.description.length>190?job.description.slice(0,190)+"…":job.description)}</p>
      <div class="job-card-bottom"><div><div class="job-salary">${escapeHTML(money(job.salary))}${job.salary?" / year":""}</div><div class="job-date">Posted ${escapeHTML(dateText(job.createdAt))}</div></div><button class="job-apply" data-apply-job="${escapeHTML(job.id)}">View details ↗</button></div>
    </article>`).join("");
  $("#empty-state").classList.toggle("hidden", list.length!==0);
}
function renderHistory() {
  const ownJobs = jobs.filter(job=>activeUser?.role==="recruiter" ? job.owner===activeUser.email : job.owner!=="demo");
  $("#history-count").textContent=`${ownJobs.length} ${ownJobs.length===1?"posting":"postings"}`;
  $("#history-empty").classList.toggle("hidden", ownJobs.length!==0);
  $("#history-list").innerHTML=ownJobs.map(job=>`
    <article class="history-item"><div class="company-logo">${escapeHTML(initials(job.company))}</div><div class="history-main"><strong>${escapeHTML(job.title)}</strong><small>${escapeHTML(job.company)} · ${escapeHTML(job.location)} · Posted ${escapeHTML(dateText(job.createdAt))}</small></div><div class="history-tags"><span>${escapeHTML(job.type)}</span><span>${escapeHTML(job.workMode)}</span></div><div class="history-actions"><button class="small-action" data-edit-job="${escapeHTML(job.id)}">Edit</button><button class="small-action delete" data-delete-job="${escapeHTML(job.id)}">Delete</button></div></article>`).join("");
}
function refresh(){renderJobs();renderHistory();}
function openAuth(tab="login") {
  activeAuthTab=tab; otpMode=false; generatedOtp="";
  $("#auth-modal").classList.remove("hidden");
  $("#auth-message").textContent="";
  $("#auth-form").reset();
  $("#otp-wrap").classList.add("hidden");
  $("#auth-password").required=true;
  $("#password-wrap").classList.remove("hidden");
  $("#otp-mode").textContent="Continue with OTP";
  updateAuthTab();
}
function closeAuth(){ $("#auth-modal").classList.add("hidden"); }
function updateAuthTab(){
  $$(".auth-tab").forEach(tab=>tab.classList.toggle("active",tab.dataset.authTab===activeAuthTab));
  $("#auth-title").textContent=activeAuthTab==="login"?"Welcome back.":"Create your account.";
  $("#auth-submit").textContent=activeAuthTab==="login"?"Log in":"Create account";
  $("#auth-password").autocomplete=activeAuthTab==="login"?"current-password":"new-password";
}
function authMessage(message,error=false){const node=$("#auth-message");node.textContent=message;node.classList.toggle("error",error);}
function authSubmit(event){
  event.preventDefault();
  const email=$("#auth-email").value.trim().toLowerCase(), password=$("#auth-password").value, role=$("#auth-role").value;
  if(otpMode){
    if(!generatedOtp){authMessage("Select Get OTP first.",true);return;}
    if($("#auth-otp").value.trim()!==generatedOtp){authMessage("That demo OTP does not match. Try again.",true);return;}
    activeUser={email,role,authMethod:"demo-otp"}; localStorage.setItem(STORAGE_SESSION,JSON.stringify(activeUser));
    authMessage(`Signed in as ${role}. This is a local demo session.`);
    finishLogin();return;
  }
  const users=safeParse(localStorage.getItem(STORAGE_USERS),[]);
  const existing=users.find(user=>user.email===email && user.role===role);
  if(activeAuthTab==="register"){
    if(users.some(user=>user.email===email && user.role===role)){authMessage("An account for this email and role already exists. Try logging in.",true);return;}
    users.push({email,role,password});localStorage.setItem(STORAGE_USERS,JSON.stringify(users));
    activeUser={email,role,authMethod:"demo-password"};localStorage.setItem(STORAGE_SESSION,JSON.stringify(activeUser));
    authMessage("Demo account created successfully.");finishLogin();return;
  }
  if(!existing || existing.password!==password){authMessage("No matching demo account. Create an account first or use OTP.",true);return;}
  activeUser={email,role,authMethod:"demo-password"};localStorage.setItem(STORAGE_SESSION,JSON.stringify(activeUser));
  authMessage("Logged in successfully.");finishLogin();
}
function finishLogin(){
  renderHistory();
  setTimeout(()=>{closeAuth();toast(`Welcome${activeUser?.role==="recruiter"?", recruiter":" back"}!`);if(activeUser?.role==="recruiter")location.hash="post-job";},450);
}
function sendOtp(){
  const phone=$("#auth-phone").value.trim();
  if(phone.replace(/\D/g,"").length<10){authMessage("Enter a valid phone number first.",true);return;}
  generatedOtp=String(Math.floor(100000+Math.random()*900000));
  $("#otp-wrap").classList.remove("hidden");
  $("#auth-password").required=false;
  $("#password-wrap").classList.add("hidden");
  $("#otp-mode").textContent="Use password instead";
  $("#auth-otp").value="";
  authMessage(`Demo OTP: ${generatedOtp}. No SMS was sent.`);
}
function switchOtpMode(){
  otpMode=!otpMode;
  $("#otp-wrap").classList.toggle("hidden",!otpMode);
  $("#password-wrap").classList.toggle("hidden",otpMode);
  $("#auth-password").required=!otpMode;
  $("#otp-mode").textContent=otpMode?"Use password instead":"Continue with OTP";
  if(!otpMode){generatedOtp="";$("#auth-otp").value="";authMessage("");}
}
function postJob(event){
  event.preventDefault();
  if(!activeUser || activeUser.role!=="recruiter"){openAuth("login");authMessage("Log in or create an account as a Company Owner / Recruiter to publish jobs.");return;}
  const data=Object.fromEntries(new FormData(event.currentTarget).entries());
  const job={...data,id:crypto.randomUUID?crypto.randomUUID():`job-${Date.now()}`,salary:Number(data.salary)||0,createdAt:new Date().toISOString(),owner:activeUser.email};
  jobs.unshift(job);writeJobs(jobs);event.currentTarget.reset();$("#post-message").textContent="Job published! It is now visible in search results and your posting history.";$("#post-message").classList.remove("error");refresh();toast("Job published successfully.");$("#history").scrollIntoView({behavior:"smooth",block:"start"});
}
function deleteJob(id){
  const job=jobs.find(item=>item.id===id);
  if(!job || job.owner==="demo")return;
  if(!confirm(`Delete "${job.title}"? This cannot be undone.`))return;
  jobs=jobs.filter(item=>item.id!==id);writeJobs(jobs);refresh();toast("Job deleted.");
}
function editJob(id){
  const job=jobs.find(item=>item.id===id);if(!job)return;
  if(!activeUser || job.owner!==activeUser.email){toast("Log in as the recruiter who posted this job to edit it.");return;}
  const form=$("#post-job-form");
  Object.keys(job).forEach(key=>{const field=form.elements.namedItem(key);if(field)field.value=job[key];});
  jobs=jobs.filter(item=>item.id!==id);writeJobs(jobs);refresh();$("#post-message").textContent="Editing this job: update the form and publish it again.";$("#post-job").scrollIntoView({behavior:"smooth"});
}
function clearFilters(){ $("#job-search-form").reset();$("#filter-type").value="";$("#filter-work").value="";$("#filter-level").value="";$("#filter-salary").value="0";$("#sort-jobs").value="newest";renderJobs(); }
function exportJobs(){
  const ownJobs=jobs.filter(job=>job.owner!=="demo");
  const blob=new Blob([JSON.stringify(ownJobs,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="mogus-jobs-postings.json";a.click();URL.revokeObjectURL(url);
}
document.addEventListener("click",event=>{
  const authButton=event.target.closest("[data-open-auth]");if(authButton){openAuth(authButton.dataset.openAuth);return;}
  const tab=event.target.closest("[data-auth-tab]");if(tab){activeAuthTab=tab.dataset.authTab;updateAuthTab();authMessage("");return;}
  const save=event.target.closest("[data-save-job]");if(save){const id=save.dataset.saveJob;savedJobIds.has(id)?savedJobIds.delete(id):savedJobIds.add(id);localStorage.setItem("mogusJobs.saved",JSON.stringify([...savedJobIds]));renderJobs();return;}
  const apply=event.target.closest("[data-apply-job]");if(apply){const job=jobs.find(item=>item.id===apply.dataset.applyJob);if(job)alert(`${job.title}\n${job.company}\n${job.location}\n\n${job.description}\n\nSalary: ${money(job.salary)}\n\nDemo: connect a backend to add real applications.`);return;}
  const del=event.target.closest("[data-delete-job]");if(del){deleteJob(del.dataset.deleteJob);return;}
  const edit=event.target.closest("[data-edit-job]");if(edit){editJob(edit.dataset.editJob);return;}
});
$("#job-search-form").addEventListener("submit",event=>{event.preventDefault();renderJobs();});
["filter-type","filter-work","filter-level","filter-salary","sort-jobs"].forEach(id=>$("#"+id).addEventListener("change",renderJobs));
$("#clear-filters").addEventListener("click",clearFilters);
$("#reset-search").addEventListener("click",clearFilters);
$("#post-job-form").addEventListener("submit",postJob);
$("#auth-form").addEventListener("submit",authSubmit);
$("#close-auth").addEventListener("click",closeAuth);
$("#auth-modal").addEventListener("click",event=>{if(event.target.id==="auth-modal")closeAuth();});
$("#send-otp").addEventListener("click",sendOtp);
$("#otp-mode").addEventListener("click",switchOtpMode);
$("#export-jobs").addEventListener("click",exportJobs);
$("#mobile-menu").addEventListener("click",()=>$(".main-nav").classList.toggle("open"));
$$(".main-nav a").forEach(link=>link.addEventListener("click",()=>$(".main-nav").classList.remove("open")));
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeAuth();});
$("#year").textContent=new Date().getFullYear();
refresh();

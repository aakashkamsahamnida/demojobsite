(() => {
  const USERS_KEY = "mogusDemoUsersV1";
  const SESSION_KEY = "mogusDemoSessionV1";
  const getUsers = () => { try { const v = JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
  const getSession = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
  const setSession = user => sessionStorage.setItem(SESSION_KEY, JSON.stringify({phone:user.phone, name:user.name, role:user.role}));
  const normalizePhone = value => String(value || "").replace(/[^\d+]/g, "");
  const here = location.pathname.split("/").pop() || "index.html";
  const session = getSession();
  const protectedPage = here === "jobs.html" || here === "recruiter.html";
  if (protectedPage && !session) {
    location.replace("index.html?next=" + encodeURIComponent(here));
    return;
  }

  // Auth entry page
  if (document.getElementById("login-form")) {
    const loginPanel = document.getElementById("auth-login-panel"), registerPanel = document.getElementById("auth-register-panel");
    const loginTab = document.getElementById("tab-login"), registerTab = document.getElementById("tab-register");
    const showAuth = mode => {
      const isLogin = mode === "login";
      loginPanel.classList.toggle("hidden", !isLogin); registerPanel.classList.toggle("hidden", isLogin);
      loginTab.classList.toggle("active", isLogin); registerTab.classList.toggle("active", !isLogin);
    };
    loginTab.addEventListener("click",()=>showAuth("login"));
    registerTab.addEventListener("click",()=>showAuth("register"));
    document.getElementById("switch-register").addEventListener("click",()=>showAuth("register"));
    document.getElementById("switch-login").addEventListener("click",()=>showAuth("login"));
    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "register") showAuth("register");
    const next = ["jobs.html","recruiter.html"].includes(params.get("next")) ? params.get("next") : null;
    document.getElementById("login-form").addEventListener("submit",event=>{
      event.preventDefault();
      const phone = normalizePhone(document.getElementById("login-phone").value);
      const password = document.getElementById("login-password").value;
      const user = getUsers().find(u=>u.phone===phone && u.password===password);
      const error = document.getElementById("login-error");
      if (!user) { error.textContent = "We couldn't find an account with those details. Check them or choose Get Started."; return; }
      setSession(user);
      location.href = next || (user.role === "recruiter" ? "recruiter.html" : "jobs.html");
    });
    document.getElementById("register-form").addEventListener("submit",event=>{
      event.preventDefault();
      const name = document.getElementById("register-name").value.trim();
      const phone = normalizePhone(document.getElementById("register-phone").value);
      const password = document.getElementById("register-password").value;
      const role = document.getElementById("register-role").value;
      const error = document.getElementById("register-error");
      const users = getUsers();
      if (phone.length < 7) { error.textContent = "Enter a valid phone number."; return; }
      if (users.some(u=>u.phone===phone)) { error.textContent = "An account with this phone number already exists. Please log in."; return; }
      if (password.length < 6) { error.textContent = "Password must be at least 6 characters."; return; }
      const user = {name,phone,password,role};
      users.push(user); localStorage.setItem(USERS_KEY,JSON.stringify(users)); setSession(user);
      location.href = next || (role === "recruiter" ? "recruiter.html" : "jobs.html");
    });
  }

  // Add a small signed-in status and logout button to protected pages.
  if (protectedPage && session) {
    const nav = document.querySelector(".site-header nav");
    if (nav && !document.getElementById("logout-button")) {
      const status = document.createElement("span");
      status.className = "signed-in-status";
      status.textContent = "Hi, " + (session.name || "there");
      nav.appendChild(status);
      const logout = document.createElement("button");
      logout.type = "button"; logout.id = "logout-button"; logout.className = "logout-button"; logout.textContent = "Log out";
      logout.addEventListener("click",()=>{sessionStorage.removeItem(SESSION_KEY);location.href="index.html";});
      document.querySelector(".site-header").appendChild(logout);
    }
    // Respect the role selected at account creation for the recruiter workspace.
    if (here === "recruiter.html" && session.role !== "recruiter") {
      document.addEventListener("DOMContentLoaded",()=>{
        const main = document.querySelector("main");
        if (main) main.innerHTML = '<section class="empty-state role-denied"><span class="empty-icon">⌑</span><h3>Recruiter account required</h3><p>Your account is registered as an applicant. Create or use a recruiter account to post and manage jobs.</p><a class="btn" href="index.html?mode=register">Create recruiter account</a></section>';
      });
      return;
    }
  }

  const STORAGE_KEY = "mogusJobsListingsV2";
  const readJobs = () => { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } };
  const saveJobs = jobs => localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const initials = value => (String(value || "M").trim()[0] || "M").toUpperCase();
  const dateText = value => { try { return new Date(value).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); } catch { return ""; } };

  // Applicant job search page
  const results = document.getElementById("job-results");
  if (results) {
    const query = document.getElementById("job-query"), location = document.getElementById("job-location");
    const type = document.getElementById("type-filter"), work = document.getElementById("work-filter"), experience = document.getElementById("experience-filter");
    const count = document.getElementById("results-count");
    const render = () => {
      const q = query.value.trim().toLowerCase(), loc = location.value.trim().toLowerCase();
      const jobs = readJobs().filter(j => (!q || `${j.title} ${j.company} ${j.description}`.toLowerCase().includes(q)) && (!loc || String(j.location).toLowerCase().includes(loc)) && (!type.value || j.type === type.value) && (!work.value || j.work === work.value) && (!experience.value || j.experience === experience.value)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      count.textContent = jobs.length === 1 ? "1 job found" : `${jobs.length} jobs found`;
      if (!jobs.length) {
        results.innerHTML = `<div class="empty-state"><span class="empty-icon">⌕</span><h3>${readJobs().length ? "No matching jobs" : "No jobs posted yet"}</h3><p>${readJobs().length ? "Try changing your keywords or filters." : "New opportunities will appear here when a recruiter publishes a job."}</p><a class="btn btn-light" href="recruiter.html">Go to recruiter page</a></div>`;
        return;
      }
      results.innerHTML = jobs.map(j=>`<article class="job-card"><div class="company-mark">${esc(initials(j.company))}</div><div class="job-card-main"><h3>${esc(j.title)}</h3><div class="job-company">${esc(j.company)} · ${esc(j.location)}</div><div class="job-meta"><span class="tag">${esc(j.type)}</span><span class="tag">${esc(j.work)}</span>${j.experience?`<span class="tag">${esc(j.experience)}</span>`:""}</div><p class="job-desc">${esc(j.description)}</p>${j.salary?`<div class="job-salary">${esc(j.salary)}</div>`:""}</div></article>`).join("");
    };
    [query,location,type,work,experience].forEach(el=>el.addEventListener("input",render));
    document.getElementById("search-btn").addEventListener("click",render);
    document.getElementById("clear-filters").addEventListener("click",()=>{query.value="";location.value="";type.value="";work.value="";experience.value="";render();});
    window.addEventListener("storage",render); render();
  }

  // Recruiter create/edit/delete and JSON backup
  const form = document.getElementById("job-form");
  if (form) {
    const byId = id => document.getElementById(id);
    const fields = ["title","company","location","type","work","experience","salary","description"];
    const renderList = () => {
      const jobs = readJobs().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      byId("total-jobs").textContent = jobs.length; byId("active-jobs").textContent = jobs.length;
      const list = byId("posting-list");
      if (!jobs.length) { list.innerHTML = `<div class="small-empty"><span>▤</span><b>No postings yet</b><p>Your jobs will appear here after you publish them.</p></div>`; return; }
      list.innerHTML = jobs.map(j=>`<article class="posting-item"><h3>${esc(j.title)}</h3><p>${esc(j.company)} · ${esc(j.location)}<br>Posted ${esc(dateText(j.createdAt))}</p><div class="posting-actions"><button type="button" data-edit="${esc(j.id)}">Edit</button><button type="button" class="delete-btn" data-delete="${esc(j.id)}">Delete</button></div></article>`).join("");
    };
    const resetForm = () => { form.reset(); byId("edit-id").value=""; byId("form-title").textContent="Post a new job"; byId("publish-btn").innerHTML='Publish job <span>→</span>'; byId("cancel-edit").classList.add("hidden"); };
    form.addEventListener("submit", event => {
      event.preventDefault();
      const jobs = readJobs(), id = byId("edit-id").value;
      const data = Object.fromEntries(fields.map(f=>[f,byId(f).value.trim()]));
      if (id) {
        const index = jobs.findIndex(j=>String(j.id)===String(id));
        if (index >= 0) jobs[index] = {...jobs[index],...data,updatedAt:new Date().toISOString()};
        byId("form-message").textContent = "Job listing updated.";
      } else {
        jobs.push({...data,id:`job-${Date.now()}`,createdAt:new Date().toISOString()});
        byId("form-message").textContent = "Job published. It is now visible on the Find Jobs page in this browser.";
      }
      saveJobs(jobs); resetForm(); renderList();
    });
    byId("posting-list").addEventListener("click",event=>{
      const edit = event.target.closest("[data-edit]"), del = event.target.closest("[data-delete]");
      if (edit) {
        const job = readJobs().find(j=>String(j.id)===String(edit.dataset.edit)); if (!job) return;
        fields.forEach(f=>byId(f).value=job[f] || ""); byId("edit-id").value=job.id;
        byId("form-title").textContent="Edit job listing"; byId("publish-btn").innerHTML="Save changes <span>✓</span>"; byId("cancel-edit").classList.remove("hidden");
        byId("form-message").textContent=""; byId("posting-form").scrollIntoView({behavior:"smooth",block:"start"});
      }
      if (del) {
        const job = readJobs().find(j=>String(j.id)===String(del.dataset.delete)); if (!job) return;
        if (confirm(`Delete "${job.title}"? This cannot be undone unless you have a backup.`)) {
          saveJobs(readJobs().filter(j=>String(j.id)!==String(del.dataset.delete))); renderList();
          byId("form-message").textContent="Job listing deleted.";
        }
      }
    });
    byId("cancel-edit").addEventListener("click",()=>{resetForm();byId("form-message").textContent="Edit cancelled.";});
    byId("export-json").addEventListener("click",()=>{
      const blob = new Blob([JSON.stringify(readJobs(),null,2)],{type:"application/json"}), url=URL.createObjectURL(blob), a=document.createElement("a");
      a.href=url;a.download="mogus-jobs-backup.json";a.click();URL.revokeObjectURL(url);
    });
    byId("import-json").addEventListener("change",async event=>{
      const file=event.target.files[0]; if(!file)return;
      try { const data=JSON.parse(await file.text()); if(!Array.isArray(data))throw new Error("Backup must be a JSON array.");
        if(confirm(`Import ${data.length} job(s)? This replaces the current listings in this browser.`)){saveJobs(data);renderList();byId("form-message").textContent="Backup imported successfully.";}
      } catch { alert("Could not import this file. Please choose a valid Mogus Jobs JSON backup."); }
      event.target.value="";
    });
    renderList();
  }

})();

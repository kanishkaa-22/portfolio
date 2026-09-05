/* ═══════════════════════════════════════════
   app.js — Portfolio Frontend JS
   Kanishkaa S. Portfolio
   Connects to Flask backend API
   ═══════════════════════════════════════════ */

/* ════════════════════════════════════════
   ADMIN MODE
   ════════════════════════════════════════ */
let isAdmin = false;

function setAdminMode(val) {
  isAdmin = val;
  document.body.classList.toggle('admin-mode', val);
  const bar = document.getElementById('admin-bar');
  if (bar) bar.style.display = val ? 'flex' : 'none';
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    if (isAdmin) { logoutAdmin(); return; }
    openAdminLogin();
  }
});

function openAdminLogin() {
  document.getElementById('adminLoginOverlay').classList.add('open');
  setTimeout(() => document.getElementById('adminPassInput').focus(), 100);
}

function closeAdminLogin() {
  document.getElementById('adminLoginOverlay').classList.remove('open');
  document.getElementById('adminPassInput').value = '';
  document.getElementById('adminLoginError').textContent = '';
}

async function submitAdminLogin() {
  const pass = document.getElementById('adminPassInput').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({password: pass})
  });
  const data = await res.json();
  if (data.ok) {
    setAdminMode(true);
    closeAdminLogin();
  } else {
    document.getElementById('adminLoginError').textContent = 'Incorrect password.';
    document.getElementById('adminPassInput').value = '';
  }
}

async function logoutAdmin() {
  await fetch('/api/logout', {method:'POST'});
  setAdminMode(false);
}

document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('adminPassInput');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') submitAdminLogin(); });
  // Check if already logged in (session persists)
  fetch('/api/check-auth').then(r=>r.json()).then(d=>{ if(d.admin) setAdminMode(true); });
});




/* ════════════════════════════════════════
   LOAD ALL DATA FROM API
   ════════════════════════════════════════ */
let projData = [];
let expData = [];

async function loadPortfolioData() {
  const res = await fetch('/api/data');
  const data = await res.json();

  renderAbout(data.about);
  renderSoftSkills(data.soft_skills);
  renderTechSkills(data.tech_skills);
  renderProjects(data.projects);
  renderExperience(data.experience);
  renderCertifications(data.certifications);
  renderAchievements(data.achievements);
  updateHomeStats();
  triggerNameAnim();
  setTimeout(observeFades, 100);
  setTimeout(observeCounters, 150);
}

/* ── RENDER ABOUT ── */
let currentEmail = '';
function renderAbout(a) {
  currentEmail = a.email || '';
  const nameEl = document.getElementById('about-name');
  if (nameEl) {
    const parts = a.name.trim().split(' ');
    const last = parts.pop();
    nameEl.innerHTML = parts.join(' ') + ' <em>' + last + '</em>';
  }
  const roleEl = document.getElementById('about-role');
  if (roleEl) roleEl.textContent = a.role;
  const bioEl = document.getElementById('about-bio');
  if (bioEl) bioEl.textContent = a.bio;
  const tagsEl = document.getElementById('about-tags');
  if (tagsEl) tagsEl.innerHTML = a.tags.map(t=>`<span class="atag">${t}</span>`).join('');
  const ghLink = document.getElementById('social-github');
  if (ghLink) ghLink.href = a.github || '#';
  const liLink = document.getElementById('social-linkedin');
  if (liLink) liLink.href = a.linkedin || '#';
  const fg = document.getElementById('footer-github');
  if (fg) fg.href = a.github || '#';
  const fl = document.getElementById('footer-linkedin');
  if (fl) fl.href = a.linkedin || '#';
  // stat sub-texts
  const sp = document.getElementById('stat-sub-projects');
  if (sp && a.stat_projects_sub) sp.textContent = a.stat_projects_sub;
  const se = document.getElementById('stat-sub-education');
  if (se && a.stat_education_sub) se.textContent = a.stat_education_sub;
  const sc = document.getElementById('stat-sub-certs');
  if (sc && a.stat_certs_sub) sc.textContent = a.stat_certs_sub;
  const si = document.getElementById('stat-sub-internship');
  if (si && a.stat_internship_sub) si.textContent = a.stat_internship_sub;
}

/* ── EMAIL DIALOG ── */
function openEmailDialog(e) {
  if (e) e.preventDefault();
  const disp = document.getElementById('emailDisplay');
  const mailto = document.getElementById('emailMailto');
  if (disp) disp.textContent = currentEmail || 'your@email.com';
  if (mailto) mailto.href = 'mailto:' + (currentEmail || '');
  const copied = document.getElementById('emailCopied');
  if (copied) copied.textContent = '';
  document.getElementById('emailDialogOverlay').classList.add('open');
}
function closeEmailDialog(e) {
  if (e && e.target !== document.getElementById('emailDialogOverlay')) return;
  document.getElementById('emailDialogOverlay').classList.remove('open');
}
function copyEmail() {
  navigator.clipboard.writeText(currentEmail).then(() => {
    const el = document.getElementById('emailCopied');
    if (el) { el.textContent = '✓ Copied to clipboard!'; setTimeout(()=>el.textContent='', 2000); }
  });
}

/* ── RENDER SOFT SKILLS ── */
/* ── RENDER SOFT SKILLS (compact, name-only pills) ── */
let allSoftSkills = [];
const SOFT_SKILLS_VISIBLE = 5;

function renderSoftSkills(skills) {
  allSoftSkills = skills;
  const compact = document.getElementById('softSkillsCompact');
  const moreBtn = document.getElementById('softSkillsMoreBtn');
  if (!compact) return;
  const visible = skills.slice(0, SOFT_SKILLS_VISIBLE);
  compact.innerHTML = visible.map(s => `<div class="scc-pill">${s.icon} ${s.name}</div>`).join('');
  if (skills.length > SOFT_SKILLS_VISIBLE && moreBtn) {
    moreBtn.style.display = 'block';
    moreBtn.textContent = `+${skills.length - SOFT_SKILLS_VISIBLE} more ↓`;
  } else if (moreBtn) {
    moreBtn.style.display = 'none';
  }
}

function toggleSoftSkillsMore() {
  const view = document.getElementById('softSkillsFullView');
  view.innerHTML = allSoftSkills.map(s => `
    <div class="scc-pill-full" data-si="${s.id}">
      <span>${s.icon} ${s.name}</span>
      <button class="skill-del-btn admin-only" onclick="deleteSoftSkill(${s.id});closeSoftSkillsDialog();">✕</button>
    </div>`).join('');
  document.getElementById('softSkillsDialogOverlay').classList.add('open');
}
function closeSoftSkillsDialog(e) {
  if (e && e.target !== document.getElementById('softSkillsDialogOverlay')) return;
  document.getElementById('softSkillsDialogOverlay').classList.remove('open');
}

/* ── RENDER TECH SKILLS (compact pills + categorized dialog) ── */
let allTechSkills = [];
const TECH_SKILLS_VISIBLE = 6;

function renderTechSkills(skills) {
  allTechSkills = skills;
  const compact = document.getElementById('techSkillsCompact');
  const moreBtn = document.getElementById('techSkillsMoreBtn');
  if (!compact) return;
  const visible = skills.slice(0, TECH_SKILLS_VISIBLE);
  compact.innerHTML = visible.map(s => `<div class="scc-pill"><span class="skill-dot" style="background:${s.color}"></span>${s.name}</div>`).join('');
  if (skills.length > TECH_SKILLS_VISIBLE && moreBtn) {
    moreBtn.style.display = 'block';
    moreBtn.textContent = `+${skills.length - TECH_SKILLS_VISIBLE} more ↓`;
  } else if (moreBtn) {
    moreBtn.style.display = 'none';
  }
}

function toggleTechSkillsMore() {
  const view = document.getElementById('techSkillsFullView');
  const groups = {};
  allTechSkills.forEach(s => { if (!groups[s.grp]) groups[s.grp]=[]; groups[s.grp].push(s); });
  view.innerHTML = Object.entries(groups).map(([grp, items]) => `
    <div class="skill-group" data-group="${grp}">
      <div class="skill-group-label">${grp}</div>
      <div class="skill-pills">
        ${items.map(s=>`<div class="skill-pill"><span class="skill-dot" style="background:${s.color}"></span>${s.name}<button class="pill-del admin-only" onclick="deleteTechSkill(this,${s.id})">✕</button></div>`).join('')}
      </div>
    </div>`).join('');
  document.getElementById('techSkillsDialogOverlay').classList.add('open');
}
function closeTechSkillsDialog(e) {
  if (e && e.target !== document.getElementById('techSkillsDialogOverlay')) return;
  document.getElementById('techSkillsDialogOverlay').classList.remove('open');
}

/* ── RENDER PROJECTS ── */
function renderProjects(projects) {
  projData = projects;
  // Featured top 3
  const featured = projects.filter(p=>p.featured).slice(0,3);
  const fGrid = document.getElementById('featuredGrid');
  if (fGrid) {
    fGrid.innerHTML = featured.map((p,i) => `
      <div class="feat-card fade-in" style="--accent:${p.col};transition-delay:${i*0.05}s" onclick="openCard(${p.id})">
        <div class="feat-glow"></div>
        <div class="feat-cat">${p.cat}</div>
        <div class="feat-title">${p.title.replace(' ','<br>')}</div>
        <div class="feat-hook">${p.chips.slice(0,3).join(' · ')}</div>
        <div class="feat-chips">${p.chips.slice(0,3).map(c=>`<span class="feat-chip">${c}</span>`).join('')}</div>
        <div class="feat-arrow">↗</div>
      </div>`).join('');
  }
  // All projects
  const allGrid = document.getElementById('projAllGrid');
  if (allGrid) {
    allGrid.innerHTML = projects.map((p,i) => `
      <div class="proj-row-card fade-in" data-proj-id="${p.id}" onclick="openCard(${p.id})">
        <div class="prc-left"><span class="prc-num">${String(i+1).padStart(2,'0')}</span><span class="prc-dot" style="background:${p.col}"></span></div>
        <div class="prc-body"><div class="prc-cat" style="color:${p.col}">${p.cat}</div><div class="prc-title">${p.title}</div><div class="prc-chips">${p.chips.slice(0,3).map(c=>`<span>${c}</span>`).join('')}</div></div>
        <div class="prc-btns"><button class="prc-edit admin-only" onclick="event.stopPropagation();openEditProject(${p.id})">✎</button><span class="prc-arr">→</span></div>
      </div>`).join('') + `
      <div class="proj-add-btn admin-only" onclick="openAddProject()">
        <span class="proj-add-icon">＋</span><span class="proj-add-label">Add Project</span>
      </div>`;
  }
}

/* ── RENDER EXPERIENCE ── */
function renderExperience(exps) {
  expData = exps;
  const container = document.getElementById('vtlContainer');
  if (!container) return;
  container.querySelectorAll('.vtl-item').forEach(el=>el.remove());
  exps.forEach((d,i) => {
    const side = i%2===0 ? 'vtl-left' : 'vtl-right';
    const glowPos = side==='vtl-left' ? '0% 0%' : '100% 0%';
    const dateDisplay = d.start_date&&d.end_date ? `${d.start_date} – ${d.end_date}` : String(d.year);
    const item = document.createElement('div');
    item.className = `vtl-item ${side}`;
    item.setAttribute('data-year', d.year);
    item.setAttribute('data-exp-id', d.id);
    item.innerHTML = `
      <div class="vtl-node"><div class="vtl-node-ring"></div><div class="vtl-node-dot"></div></div>
      <div class="vtl-connector"></div>
      <div class="vtl-card">
        <div class="vtl-card-glow" style="background:radial-gradient(circle at ${glowPos},${hexToRgba(d.col,0.12)},transparent 70%)"></div>
        <div class="vtl-card-top">
          <div class="vtl-year" style="color:${d.col}">${dateDisplay}</div>
          ${expStatusBadge(d.status)}
        </div>
        <div class="vtl-type">${d.type}</div>
        <div class="vtl-role">${d.role}</div>
        <div class="vtl-org"><span class="vtl-org-dot" style="background:${d.col}"></span>${d.org}</div>
        <div class="vtl-desc">${d.desc}</div>
        <div class="vtl-tags">${d.tags.map(t=>`<span class="vtl-tag">${t}</span>`).join('')}</div>
        ${d.proof ? `<div class="ach-proof-wrap"><button class="ach-proof-btn" onclick="viewProof('${d.proof}')">View Certificate ↗</button></div>` : ''}
        <button class="vtl-edit-btn admin-only" onclick="openEditExp(${d.id})">✎ Edit</button>
      </div>`;
    container.appendChild(item);
  });
  initTimelineScroll();
}

/* ── RENDER CERTIFICATIONS ── */
function renderCertifications(certs) {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;
  const statusColors = {
    completed:{bg:'rgba(251,191,36,.12)',color:'#fbbf24',label:'✓ Completed'},
    inprogress:{bg:'rgba(96,165,250,.12)',color:'#60a5fa',label:'⧖ In Progress'},
    ongoing:{bg:'rgba(167,139,250,.12)',color:'#a78bfa',label:'↻ Ongoing'},
  };
  grid.innerHTML = certs.map((c,i) => {
    const sc = statusColors[c.status]||statusColors.inprogress;
    const dateDisplay = c.start_date&&c.end_date ? `${c.start_date} – ${c.end_date}` : c.start_date||'';
    const viewBtn = c.status==='completed'&&c.link ? `<button class="cert-view-btn" onclick="viewCert('${c.link}')">View Certificate ↗</button>` : '';
    const updateBtn = c.status!=='completed' ? `<button class="cert-update-btn admin-only" onclick="openUpdateCert(${c.id})">Update ✎</button>` : '';
    const delBtn = `<button class="cert-del-btn admin-only" onclick="deleteCertCard(${c.id})">✕</button>`;
    return `<div class="cert-card fade-in" style="transition-delay:${i*0.05}s;position:relative" data-cert-id="${c.id}">
      ${delBtn}
      <div class="cert-icon">${c.icon}</div>
      <div class="cert-info"><div class="cert-issuer">${c.issuer}</div><div class="cert-name">${c.name}</div><div class="cert-date">${dateDisplay}</div></div>
      <div class="cert-footer"><span class="cert-badge" style="background:${sc.bg};color:${sc.color}">${sc.label}</span>${viewBtn}${updateBtn}</div>
    </div>`;
  }).join('') + `<div class="cert-card cert-add-btn admin-only" onclick="openAddCert()">
    <div class="cert-add-inner"><div class="cert-add-icon">＋</div><div class="cert-add-label">Add Certification</div><div class="cert-add-sub">Click to add a new credential</div></div>
  </div>`;
  updateHomeStats();
}

/* ── RENDER ACHIEVEMENTS ── */
function renderAchievements(achs) {
  achData = achs;
  const grid = document.getElementById('achGrid');
  if (!grid) return;
  grid.innerHTML = achs.map((a,i) => {
    const proofBtn = a.proof ? `<button class="ach-proof-btn" onclick="viewProof('${a.proof}')">View Proof ↗</button>` : '';
    return `
    <div class="ach-card fade-in" data-ach-id="${a.id}" draggable="true" style="transition-delay:${i*0.04}s">
      <div class="ach-drag-handle admin-only" title="Drag to reorder">⠿</div>
      <div class="ach-icon-wrap" style="background:${a.icon_bg}">${a.icon}</div>
      <div class="ach-body">
        <div class="ach-category">${a.category}</div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-desc">${a.desc}</div>
        <div class="ach-date">${a.date}</div>
        ${proofBtn ? `<div class="ach-proof-wrap">${proofBtn}</div>` : ''}
      </div>
      <div class="ach-edit-controls admin-only">
        <button class="ach-edit-btn" onclick="openEditAchievement(${a.id})">✎</button>
        <button class="ach-del-btn" onclick="deleteAchievement(${a.id})">✕</button>
      </div>
    </div>`;
  }).join('') + `
  <div class="ach-card ach-add-btn admin-only" onclick="openAddAchievement()">
    <div class="ach-add-inner"><div class="cert-add-icon">＋</div><div class="cert-add-label">Add Achievement</div><div class="cert-add-sub">Awards, ranks, memberships...</div></div>
  </div>`;
  initAchDragDrop();
}

/* ── DRAG & DROP REORDERING ── */
function initAchDragDrop() {
  const grid = document.getElementById('achGrid');
  if (!grid) return;
  let dragged = null;

  grid.querySelectorAll('.ach-card[draggable="true"]').forEach(card => {
    card.addEventListener('dragstart', e => {
      if (!document.body.classList.contains('admin-mode')) { e.preventDefault(); return; }
      dragged = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      saveAchOrder();
    });
    card.addEventListener('dragover', e => {
      e.preventDefault();
      const afterEl = getDragAfterElement(grid, e.clientY);
      const addBtn = grid.querySelector('.ach-add-btn');
      if (!dragged) return;
      if (afterEl == null) {
        grid.insertBefore(dragged, addBtn);
      } else {
        grid.insertBefore(dragged, afterEl);
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll('.ach-card[draggable="true"]:not(.dragging)')];
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function saveAchOrder() {
  const grid = document.getElementById('achGrid');
  const ids = [...grid.querySelectorAll('.ach-card[draggable="true"]')].map(c => parseInt(c.dataset.achId));
  await fetch('/api/achievements/reorder', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({order: ids})});
}

/* ════════════════════════════════════════
   PAGE NAVIGATION
   ════════════════════════════════════════ */
const pageOrder = ['home','projects','experience','certs'];
let currentPage = 'home';
let isTransitioning = false;

function showPage(id) {
  if (id===currentPage||isTransitioning) return;
  isTransitioning = true;
  const oldIdx=pageOrder.indexOf(currentPage), newIdx=pageOrder.indexOf(id);
  const goingRight=newIdx>oldIdx;
  const outPage=document.getElementById('page-'+currentPage);
  const inPage=document.getElementById('page-'+id);
  document.querySelectorAll('.nav-links button').forEach(b=>b.classList.remove('active'));
  document.getElementById('nb-'+id).classList.add('active');
  outPage.classList.remove('active');
  outPage.classList.add(goingRight?'slide-out-left':'slide-out-right');
  inPage.scrollTop=0;
  inPage.classList.add(goingRight?'slide-in-right':'slide-in-left');
  currentPage=id;
  setTimeout(()=>{
    outPage.classList.remove('slide-out-left','slide-out-right');
    outPage.style.display='none';
    inPage.classList.remove('slide-in-right','slide-in-left');
    inPage.classList.add('active');
    inPage.style.display='block';
    isTransitioning=false;
    setTimeout(()=>{
      observeFades();
      initTimelineScroll();
      updateFooter(id);
      if(id==='home'){setTimeout(triggerNameAnim,80);setTimeout(observeCounters,100);}
    },30);
  },400);
}

/* ── FADE IN ── */
function observeFades() {
  const activePage=document.querySelector('.page.active');
  if(!activePage) return;
  const els=activePage.querySelectorAll('.fade-in');
  els.forEach(el=>el.classList.add('visible'));
  const pageIO=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');else e.target.classList.remove('visible');});
  },{threshold:0.08,root:activePage});
  els.forEach(el=>pageIO.observe(el));
}

/* ── NAME ANIMATION ── */
function triggerNameAnim() {
  const nm=document.querySelector('.about-name');
  if(!nm) return;
  nm.classList.remove('animate'); void nm.offsetWidth; nm.classList.add('animate');
  setTimeout(fitNameToContainer, 100);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => fitNameToContainer());
  }
}

/* shrink name font-size further if it still overflows the card width */
function fitNameToContainer() {
  const nm = document.querySelector('.about-name');
  if (!nm) return;
  const container = nm.parentElement;
  if (!container) return;
  // reset to CSS default first so we measure from a clean state
  nm.style.fontSize = '';
  let fontSize = parseFloat(getComputedStyle(nm).fontSize);
  const maxWidth = container.clientWidth - 8;
  let guard = 0;
  while (nm.scrollWidth > maxWidth && fontSize > 11 && guard < 60) {
    fontSize -= 0.5;
    nm.style.fontSize = fontSize + 'px';
    guard++;
  }
}
window.addEventListener('resize', () => { setTimeout(fitNameToContainer, 100); });

/* ── COUNTERS ── */
function animateCounter(el) {
  const target=parseInt(el.dataset.target);
  const start=performance.now();
  function step(now){
    const p=Math.min((now-start)/400,1);
    el.textContent=Math.floor(p*target);
    if(p<1) requestAnimationFrame(step); else el.textContent=target;
  }
  requestAnimationFrame(step);
}
const counterIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.querySelectorAll('.count-num').forEach(el=>{el.textContent='0';animateCounter(el);});
  });
},{threshold:0.4});
function observeCounters(){const row=document.getElementById('stats-row');if(row)counterIO.observe(row);}

function updateHomeStats() {
  const projEl=document.getElementById('stat-projects');
  const certEl=document.getElementById('stat-certs');
  if(projEl){projEl.dataset.target=projData.length;projEl.textContent=projData.length;}
  if(certEl){const c=document.querySelectorAll('#certsGrid .cert-card:not(.cert-add-btn)').length;certEl.dataset.target=c;certEl.textContent=c;}
}

/* ── TIMELINE ── */
function initTimelineScroll() {
  const expPage=document.getElementById('page-experience');
  if(!expPage) return;
  const items=expPage.querySelectorAll('.vtl-item');
  const spine=document.getElementById('spineFill');
  const tlObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vtl-visible');else e.target.classList.remove('vtl-visible');});
  },{threshold:0.2,root:expPage});
  items.forEach(item=>{item.classList.remove('vtl-visible');tlObs.observe(item);});
  expPage.addEventListener('scroll',()=>{
    const s=expPage.scrollTop,t=expPage.scrollHeight-expPage.clientHeight;
    if(spine)spine.style.height=Math.min(100,(s/(t||1))*100+6)+'%';
  },{passive:true});
  setTimeout(()=>items[0]&&items[0].classList.add('vtl-visible'),200);
}

/* ── FOOTER ── */
function updateFooter(id){
  const footer=document.getElementById('site-footer');
  if(!footer) return;
  const page=document.getElementById('page-'+id);
  if(page){page.appendChild(footer);footer.style.display='flex';}
}
updateFooter('home');

/* ── HELPERS ── */
function hexToRgba(hex,a){
  if(!hex||!hex.startsWith('#'))return`rgba(124,58,237,${a})`;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return`rgba(${r},${g},${b},${a})`;
}
function expStatusBadge(status){
  const map={completed:{bg:'rgba(251,191,36,.12)',color:'#fbbf24',label:'✓ Completed'},ongoing:{bg:'rgba(52,211,153,.12)',color:'#34d399',label:'↻ Ongoing'},inprogress:{bg:'rgba(96,165,250,.12)',color:'#60a5fa',label:'⧖ In Progress'}};
  const s=map[status]||map.ongoing;
  return`<span class="vtl-status-badge" style="background:${s.bg};color:${s.color}">${s.label}</span>`;
}
function gv(id){return(document.getElementById(id)?.value||'').trim();}
const accentColors=['#60a5fa','#34d399','#fb7185','#a78bfa','#fbbf24','#f97316','#e879f9'];

/* ════════════════════════════════════════
   SHARED DIALOG ENGINE
   ════════════════════════════════════════ */
let dialogSaveCallback=null;
function openSharedDialog(title,fields,onSave){
  document.getElementById('sharedDialogTitle').textContent=title;
  document.getElementById('sharedDialogForm').innerHTML=fields;
  document.getElementById('sharedDialogSave').textContent='Save';
  dialogSaveCallback=onSave;
  document.getElementById('sharedDialogSave').onclick=()=>{if(dialogSaveCallback)dialogSaveCallback();};
  document.getElementById('sharedDialogOverlay').classList.add('open');
}
function closeSharedDialog(e){
  if(e&&e.target!==document.getElementById('sharedDialogOverlay'))return;
  document.getElementById('sharedDialogOverlay').classList.remove('open');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCard();closeSharedDialog();}});

/* ════════════════════════════════════════
   PROJECT MODAL
   ════════════════════════════════════════ */
function openCard(id){
  const d=projData.find(p=>p.id===id);
  if(!d) return;
  document.getElementById('m-cat').textContent=d.cat;
  document.getElementById('m-cat').style.color=d.col;
  document.getElementById('m-title').textContent=d.title;
  document.getElementById('m-desc').textContent=d.desc;
  document.getElementById('m-chips').innerHTML=d.chips.map(c=>`<span class="mchip">${c}</span>`).join('');
  document.getElementById('m-btns').innerHTML=`
    <a href="${d.github}" target="_blank" class="mbtn-primary">GitHub ↗</a>
    ${d.live?`<a href="${d.live}" target="_blank" class="mbtn-outline">Live Demo ↗</a>`:''}
    <button class="mbtn-ghost" onclick="closeCard()">Close</button>`;
  document.getElementById('cardOverlay').classList.add('open');
}
function closeCard(){document.getElementById('cardOverlay').classList.remove('open');}
function overlayClick(e){if(e.target===document.getElementById('cardOverlay'))closeCard();}

/* ════════════════════════════════════════
   EDIT ABOUT ME
   ════════════════════════════════════════ */
function openEditAbout(){
  const nameEl=document.getElementById('about-name');
  const name=nameEl?nameEl.innerText.replace(/\n/g,'').trim():'';
  const role=document.getElementById('about-role')?.textContent||'';
  const bio=document.getElementById('about-bio')?.textContent||'';
  const tags=[...document.querySelectorAll('#about-tags .atag')].map(t=>t.textContent).join(', ');
  const ghLink=document.getElementById('social-github')?.href||'';
  const liLink=document.getElementById('social-linkedin')?.href||'';
  const emLink=(document.getElementById('social-email')?.href||'').replace('mailto:','');
  const sp=document.getElementById('stat-sub-projects')?.textContent||'';
  const se=document.getElementById('stat-sub-education')?.textContent||'';
  const sc=document.getElementById('stat-sub-certs')?.textContent||'';
  const si=document.getElementById('stat-sub-internship')?.textContent||'';
  openSharedDialog('Edit About Me',`
    <div class="cf-row"><label class="cf-label">Display Name</label><input class="cf-input" id="ab-name" value="${name}" placeholder="Kanishkaa S."/></div>
    <div class="cf-row"><label class="cf-label">Role / Subtitle</label><input class="cf-input" id="ab-role" value="${role}"/></div>
    <div class="cf-row"><label class="cf-label">Bio</label><textarea class="cf-input" id="ab-bio" rows="4">${bio}</textarea></div>
    <div class="cf-row"><label class="cf-label">Tags (comma separated)</label><input class="cf-input" id="ab-tags" value="${tags}"/></div>
    <div class="cf-row"><label class="cf-label">GitHub URL</label><input class="cf-input" id="ab-github" value="${ghLink}"/></div>
    <div class="cf-row"><label class="cf-label">LinkedIn URL</label><input class="cf-input" id="ab-linkedin" value="${liLink}"/></div>
    <div class="cf-row"><label class="cf-label">Email</label><input class="cf-input" id="ab-email" value="${emLink}"/></div>
    <div style="margin:10px 0 4px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Stat Card Sub-texts</div>
    <div class="cf-row"><label class="cf-label">Projects sub-text</label><input class="cf-input" id="ab-sp" value="${sp}" placeholder="ML · Web · Cybersecurity · Algorithms"/></div>
    <div class="cf-row"><label class="cf-label">Education sub-text</label><input class="cf-input" id="ab-se" value="${se}" placeholder="B.Tech CSE · SRM 2024–28"/></div>
    <div class="cf-row"><label class="cf-label">Certifications sub-text</label><input class="cf-input" id="ab-sc" value="${sc}" placeholder="Forage · Guidewire · SRM Honours"/></div>
    <div class="cf-row"><label class="cf-label">Internship sub-text</label><input class="cf-input" id="ab-si" value="${si}" placeholder="Available · 2026"/></div>
  `,async()=>{
    const newName=gv('ab-name');
    if(!newName){alert('Name required.');return;}
    const payload={
      name:newName,role:gv('ab-role'),bio:gv('ab-bio'),
      tags:gv('ab-tags').split(',').map(s=>s.trim()).filter(Boolean),
      github:gv('ab-github'),linkedin:gv('ab-linkedin'),email:gv('ab-email'),
      stat_projects_sub:gv('ab-sp'),stat_education_sub:gv('ab-se'),
      stat_certs_sub:gv('ab-sc'),stat_internship_sub:gv('ab-si')
    };
    const res=await fetch('/api/about',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if((await res.json()).ok){renderAbout({...payload,tags:payload.tags});triggerNameAnim();closeSharedDialog();}
  });
}

/* ════════════════════════════════════════
   PROJECTS — ADD / EDIT / DELETE
   ════════════════════════════════════════ */
function projFormHTML(d){
  const featuredList = projData.filter(p => p.featured && p.id !== d?.id);
  const featuredWarning = featuredList.length >= 3
    ? `<div class="feat-warning">⚠ You already have 3 featured projects: <strong>${featuredList.map(p=>p.title).join(', ')}</strong>. Marking this one as featured will replace the oldest one.</div>`
    : '';
  return`
  <div class="cf-row"><label class="cf-label">Category</label><input class="cf-input" id="pf-cat" value="${d?.cat||''}" placeholder="e.g. Machine Learning"/></div>
  <div class="cf-row"><label class="cf-label">Project Title</label><input class="cf-input" id="pf-title" value="${d?.title||''}" placeholder="e.g. PM2.5 Predictor"/></div>
  <div class="cf-row cf-row-inline">
    <div><label class="cf-label">Start Date</label><input class="cf-input" id="pf-start" value="${d?.start_date||''}" placeholder="Jan 2025" style="width:150px"/></div>
    <div><label class="cf-label">End Date</label><input class="cf-input" id="pf-end" value="${d?.end_date||''}" placeholder="Mar 2025" style="width:150px"/></div>
  </div>
  <div class="cf-row"><label class="cf-label">Description</label><textarea class="cf-input" id="pf-desc" rows="3">${d?.desc||''}</textarea></div>
  <div class="cf-row"><label class="cf-label">Tech Stack (comma separated)</label><input class="cf-input" id="pf-chips" value="${d?.chips?.join(', ')||''}" placeholder="Python, Flask, Docker"/></div>
  <div class="cf-row"><label class="cf-label">GitHub URL</label><input class="cf-input" id="pf-github" value="${d?.github||''}" placeholder="https://github.com/..."/></div>
  <div class="cf-row"><label class="cf-label">Live Demo URL (optional)</label><input class="cf-input" id="pf-live" value="${d?.live||''}" placeholder="https://..."/></div>
  <div class="cf-row"><label class="cf-label">Feature on homepage? <span style="color:var(--muted2)">(top 3 only)</span></label>
    <div class="cf-status-group">
      <label class="cf-status-opt"><input type="radio" name="pf-feat" value="1" ${d?.featured?'checked':''}/> ✓ Yes (show in top 3)</label>
      <label class="cf-status-opt"><input type="radio" name="pf-feat" value="0" ${!d?.featured?'checked':''}/> No</label>
    </div>
    ${featuredWarning}
  </div>
  <div class="cf-row"><label class="cf-label">Accent Colour</label><div style="display:flex;gap:8px;flex-wrap:wrap">${accentColors.map(c=>`<span onclick="this.parentNode.querySelectorAll('span').forEach(s=>s.style.outline='none');this.style.outline='2px solid #fff';document.getElementById('pf-color').value='${c}'" style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;outline:${d?.col===c?'2px solid #fff':'none'}"></span>`).join('')}<input type="hidden" id="pf-color" value="${d?.col||'#60a5fa'}"/></div></div>`;
}

function openAddProject(){
  openSharedDialog('Add Project',projFormHTML(null),async()=>{
    const cat=gv('pf-cat'),title=gv('pf-title');
    if(!cat||!title){alert('Category and Title required.');return;}
    const featured=parseInt(document.querySelector('input[name="pf-feat"]:checked')?.value||0);
    const payload={cat,title,desc:gv('pf-desc'),chips:gv('pf-chips').split(',').map(s=>s.trim()).filter(Boolean),col:gv('pf-color')||'#a78bfa',start:gv('pf-start'),end:gv('pf-end'),github:gv('pf-github')||'#',live:gv('pf-live')||null,featured};
    if(featured){ await enforceFeaturedLimit(null); }
    const res=await fetch('/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await res.json();
    if(data.ok){await reloadSection('projects');closeSharedDialog();}
  });
}

function openEditProject(id){
  const d=projData.find(p=>p.id===id);
  openSharedDialog('Edit Project',projFormHTML(d),async()=>{
    const cat=gv('pf-cat'),title=gv('pf-title');
    if(!cat||!title){alert('Category and Title required.');return;}
    const featured=parseInt(document.querySelector('input[name="pf-feat"]:checked')?.value||0);
    const payload={cat,title,desc:gv('pf-desc'),chips:gv('pf-chips').split(',').map(s=>s.trim()).filter(Boolean),col:gv('pf-color')||d.col,start:gv('pf-start'),end:gv('pf-end'),github:gv('pf-github')||d.github,live:gv('pf-live')||null,featured};
    if(featured && !d.featured){ await enforceFeaturedLimit(id); }
    const res=await fetch(`/api/projects/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if((await res.json()).ok){await reloadSection('projects');closeSharedDialog();}
  });
}

/* if 3 projects are already featured, un-feature the oldest one (lowest sort_order) so the new one fits */
async function enforceFeaturedLimit(excludeId){
  const featured = projData.filter(p => p.featured && p.id !== excludeId);
  if(featured.length < 3) return;
  const oldest = featured.sort((a,b)=>(a.sort_order??0)-(b.sort_order??0))[0];
  await fetch(`/api/projects/${oldest.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...oldest,featured:0})});
}

/* ════════════════════════════════════════
   EXPERIENCE — ADD / EDIT
   ════════════════════════════════════════ */
function expFormHTML(d){
  return`
  <div class="cf-row cf-row-inline">
    <div><label class="cf-label">Start Date</label><input class="cf-input" id="ef-start" value="${d?.start_date||''}" placeholder="Jan 2024" style="width:150px"/></div>
    <div><label class="cf-label">End Date</label><input class="cf-input" id="ef-end" value="${d?.end_date||''}" placeholder="Present" style="width:150px"/></div>
  </div>
  <div class="cf-row"><label class="cf-label">Sort Year</label><input class="cf-input" id="ef-year" value="${d?.year||new Date().getFullYear()}" type="number" style="width:100px"/></div>
  <div class="cf-row"><label class="cf-label">Status</label>
    <div class="cf-status-group">
      <label class="cf-status-opt"><input type="radio" name="ef-status" value="completed" ${d?.status==='completed'?'checked':''}/> ✓ Completed</label>
      <label class="cf-status-opt"><input type="radio" name="ef-status" value="ongoing" ${!d||d?.status==='ongoing'?'checked':''}/> ↻ Ongoing</label>
      <label class="cf-status-opt"><input type="radio" name="ef-status" value="inprogress" ${d?.status==='inprogress'?'checked':''}/> ⧖ In Progress</label>
    </div>
  </div>
  <div class="cf-row"><label class="cf-label">Type / Label</label><input class="cf-input" id="ef-type" value="${d?.type||''}" placeholder="Virtual Programme, Internship..."/></div>
  <div class="cf-row"><label class="cf-label">Role / Title</label><input class="cf-input" id="ef-role" value="${d?.role||''}" placeholder="Data Analytics Experience"/></div>
  <div class="cf-row"><label class="cf-label">Organisation</label><input class="cf-input" id="ef-org" value="${d?.org||''}" placeholder="Quantium via Forage"/></div>
  <div class="cf-row"><label class="cf-label">Description</label><textarea class="cf-input" id="ef-desc" rows="3">${d?.desc||''}</textarea></div>
  <div class="cf-row"><label class="cf-label">Tags (comma separated)</label><input class="cf-input" id="ef-tags" value="${d?.tags?.join(', ')||''}" placeholder="Python, Flask, Cloud"/></div>
  <div class="cf-row"><label class="cf-label">Certificate / Proof Link <span style="color:var(--muted2)">(optional)</span></label><input class="cf-input" id="ef-proof" value="${d?.proof||''}" placeholder="https://drive.google.com/..."/></div>
  <div class="cf-row"><label class="cf-label">Accent Colour</label><div style="display:flex;gap:8px;flex-wrap:wrap">${accentColors.map(c=>`<span onclick="this.parentNode.querySelectorAll('span').forEach(s=>s.style.outline='none');this.style.outline='2px solid #fff';document.getElementById('ef-color').value='${c}'" style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;outline:${d?.col===c?'2px solid #fff':'none'}"></span>`).join('')}<input type="hidden" id="ef-color" value="${d?.col||'#a78bfa'}"/></div></div>`;
}

function openAddExp(){
  openSharedDialog('Add Experience',expFormHTML(null),async()=>{
    const role=gv('ef-role'),org=gv('ef-org');
    if(!role||!org){alert('Role and Organisation required.');return;}
    const payload={year:parseInt(gv('ef-year')),start:gv('ef-start'),end:gv('ef-end'),status:document.querySelector('input[name="ef-status"]:checked')?.value||'ongoing',type:gv('ef-type'),role,org,desc:gv('ef-desc'),tags:gv('ef-tags').split(',').map(s=>s.trim()).filter(Boolean),col:gv('ef-color')||'#a78bfa',proof:gv('ef-proof')||null};
    const res=await fetch('/api/experience',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if((await res.json()).ok){await reloadSection('experience');closeSharedDialog();}
  });
}

function openEditExp(id){
  const d=expData.find(e=>e.id===id);
  openSharedDialog('Edit Experience',expFormHTML(d),async()=>{
    const role=gv('ef-role'),org=gv('ef-org');
    if(!role||!org){alert('Role and Organisation required.');return;}
    const payload={year:parseInt(gv('ef-year')),start:gv('ef-start'),end:gv('ef-end'),status:document.querySelector('input[name="ef-status"]:checked')?.value||'ongoing',type:gv('ef-type'),role,org,desc:gv('ef-desc'),tags:gv('ef-tags').split(',').map(s=>s.trim()).filter(Boolean),col:gv('ef-color')||d.col,proof:gv('ef-proof')||null};
    const res=await fetch(`/api/experience/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if((await res.json()).ok){await reloadSection('experience');closeSharedDialog();}
  });
}

/* ════════════════════════════════════════
   CERTIFICATIONS — ADD / UPDATE / DELETE
   ════════════════════════════════════════ */
function certFormHTML(d){
  return`
  <div class="cf-row"><label class="cf-label">Icon (emoji)</label><input class="cf-input" id="cf-icon" value="${d?.icon||'📜'}" maxlength="4" style="width:80px"/></div>
  <div class="cf-row"><label class="cf-label">Issuer / Organisation</label><input class="cf-input" id="cf-issuer" value="${d?.issuer||''}" placeholder="e.g. Coursera · Google"/></div>
  <div class="cf-row"><label class="cf-label">Certificate Name</label><input class="cf-input" id="cf-name" value="${d?.name||''}" placeholder="e.g. Machine Learning Specialization"/></div>
  <div class="cf-row cf-row-inline">
    <div><label class="cf-label">Start Date</label><input class="cf-input" id="cf-start" value="${d?.start_date||''}" placeholder="Jan 2025" style="width:150px"/></div>
    <div><label class="cf-label">End Date</label><input class="cf-input" id="cf-end" value="${d?.end_date||''}" placeholder="Mar 2025" style="width:150px"/></div>
  </div>
  <div class="cf-row"><label class="cf-label">Status</label>
    <div class="cf-status-group">
      <label class="cf-status-opt"><input type="radio" name="cf-status" value="completed" ${d?.status==='completed'?'checked':''}/> ✓ Completed</label>
      <label class="cf-status-opt"><input type="radio" name="cf-status" value="inprogress" ${!d||d?.status==='inprogress'?'checked':''}/> ⧖ In Progress</label>
      <label class="cf-status-opt"><input type="radio" name="cf-status" value="ongoing" ${d?.status==='ongoing'?'checked':''}/> ↻ Ongoing</label>
    </div>
  </div>
  <div class="cf-row"><label class="cf-label">Certificate Link (if completed)</label><input class="cf-input" id="cf-link" value="${d?.link||''}" placeholder="https://your-certificate-url.com"/></div>`;
}

let certEditId=null;
function openAddCert(){certEditId=null;openSharedDialog('Add Certification',certFormHTML(null),saveCert);}
function openUpdateCert(id){
  certEditId=id;
  const card=document.querySelector(`[data-cert-id="${id}"]`);
  const d=card?{issuer:card.querySelector('.cert-issuer')?.textContent,name:card.querySelector('.cert-name')?.textContent,start_date:'',end_date:'',status:'inprogress',link:'',icon:'📜'}:null;
  openSharedDialog('Update Certification',certFormHTML(d),saveCert);
}
async function saveCert(){
  const issuer=gv('cf-issuer'),name=gv('cf-name');
  if(!issuer||!name){alert('Issuer and Certificate Name required.');return;}
  const payload={icon:gv('cf-icon')||'📜',issuer,name,start:gv('cf-start'),end:gv('cf-end'),status:document.querySelector('input[name="cf-status"]:checked')?.value||'inprogress',link:gv('cf-link')||null};
  if(certEditId!==null){
    await fetch(`/api/certifications/${certEditId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  } else {
    await fetch('/api/certifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  }
  await reloadSection('certs');
  closeSharedDialog();
}
async function deleteCertCard(id){
  if(!confirm('Delete this certification?'))return;
  await fetch(`/api/certifications/${id}`,{method:'DELETE'});
  await reloadSection('certs');
}
function viewProof(url) { window.open(url, '_blank'); }
function viewCert(url) { window.open(url, '_blank'); }

/* ════════════════════════════════════════
   ACHIEVEMENTS — ADD / EDIT / DELETE
   ════════════════════════════════════════ */
const achIconColors=[
  {bg:'rgba(167,139,250,.12)',color:'#a78bfa'},{bg:'rgba(251,191,36,.12)',color:'#fbbf24'},
  {bg:'rgba(96,165,250,.12)',color:'#60a5fa'},{bg:'rgba(52,211,153,.12)',color:'#34d399'},
  {bg:'rgba(251,113,133,.12)',color:'#fb7185'},{bg:'rgba(249,115,22,.12)',color:'#f97316'},
];
let achData = [];

function achFormHTML(d){
  const colOpts=achIconColors.map((c,i)=>`<span onclick="this.parentNode.querySelectorAll('span').forEach(s=>s.style.outline='none');this.style.outline='2px solid #fff';document.getElementById('ach-color-idx').value='${i}'" style="width:22px;height:22px;border-radius:50%;background:${c.color};cursor:pointer;display:inline-block;outline:${d&&d.icon_bg===c.bg?'2px solid #fff':'none'}"></span>`).join('');
  return `
    <div class="cf-row"><label class="cf-label">Icon (emoji)</label><input class="cf-input" id="ach-icon" value="${d?.icon||'🏆'}" maxlength="4" style="width:80px"/></div>
    <div class="cf-row"><label class="cf-label">Category</label><input class="cf-input" id="ach-cat" value="${d?.category||''}" placeholder="Academic, Hackathon, Membership..."/></div>
    <div class="cf-row"><label class="cf-label">Title</label><input class="cf-input" id="ach-title" value="${d?.title||''}" placeholder="e.g. 1st Place — SRM Hackathon"/></div>
    <div class="cf-row"><label class="cf-label">Description</label><textarea class="cf-input" id="ach-desc" rows="3">${d?.desc||''}</textarea></div>
    <div class="cf-row"><label class="cf-label">Date / Year</label><input class="cf-input" id="ach-date" value="${d?.date||''}" placeholder="2025" style="width:150px"/></div>
    <div class="cf-row"><label class="cf-label">Proof / Certificate Link <span style="color:var(--muted2)">(optional)</span></label><input class="cf-input" id="ach-proof" value="${d?.proof||''}" placeholder="https://drive.google.com/..."/></div>
    <div class="cf-row"><label class="cf-label">Accent Colour</label><div style="display:flex;gap:8px;flex-wrap:wrap">${colOpts}<input type="hidden" id="ach-color-idx" value="0"/></div></div>`;
}

function openAddAchievement(){
  openSharedDialog('Add Achievement', achFormHTML(null), async()=>{
    const title=gv('ach-title');
    if(!title){alert('Title required.');return;}
    const ci=parseInt(document.getElementById('ach-color-idx')?.value||'0');
    const col=achIconColors[ci]||achIconColors[0];
    const payload={icon:gv('ach-icon')||'🏆',icon_bg:col.bg,category:gv('ach-cat'),title,desc:gv('ach-desc'),date:gv('ach-date'),proof:gv('ach-proof')||null};
    await fetch('/api/achievements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    await reloadSection('certs');
    closeSharedDialog();
  });
}

function openEditAchievement(id){
  const d = achData.find(a => a.id === id);
  openSharedDialog('Edit Achievement', achFormHTML(d), async()=>{
    const title=gv('ach-title');
    if(!title){alert('Title required.');return;}
    const ci=parseInt(document.getElementById('ach-color-idx')?.value||'0');
    const col = document.getElementById('ach-color-idx')?.value !== '0' || !d
      ? (achIconColors[ci]||achIconColors[0])
      : {bg:d.icon_bg};
    const payload={icon:gv('ach-icon')||'🏆',icon_bg:col.bg,category:gv('ach-cat'),title,desc:gv('ach-desc'),date:gv('ach-date'),proof:gv('ach-proof')||null};
    await fetch(`/api/achievements/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    await reloadSection('certs');
    closeSharedDialog();
  });
}

async function deleteAchievement(id){
  if(!confirm('Delete this achievement?'))return;
  await fetch(`/api/achievements/${id}`,{method:'DELETE'});
  await reloadSection('certs');
}

/* ════════════════════════════════════════
   SOFT SKILLS — ADD / DELETE
   ════════════════════════════════════════ */
function openAddSoftSkill(){
  openSharedDialog('Add Skill',`
    <div class="cf-row"><label class="cf-label">Icon (emoji)</label><input class="cf-input" id="ss-icon" value="🌟" maxlength="4" style="width:80px"/></div>
    <div class="cf-row"><label class="cf-label">Skill Name</label><input class="cf-input" id="ss-name" placeholder="e.g. Leadership"/></div>
    <div class="cf-row"><label class="cf-label">Short Description</label><input class="cf-input" id="ss-desc" placeholder="e.g. Guiding teams toward clear goals"/></div>
  `,async()=>{
    const name=gv('ss-name');
    if(!name){alert('Skill name required.');return;}
    await fetch('/api/soft-skills',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({icon:gv('ss-icon')||'🌟',name,desc:gv('ss-desc')})});
    await reloadSection('home');
    closeSharedDialog();
  });
}
async function deleteSoftSkill(id){
  await fetch(`/api/soft-skills/${id}`,{method:'DELETE'});
  await reloadSection('home');
}

/* ════════════════════════════════════════
   TECH SKILLS — ADD / DELETE
   ════════════════════════════════════════ */
function openAddTechSkill(){
  openSharedDialog('Add Tech Skill',`
    <div class="cf-row"><label class="cf-label">Skill Name</label><input class="cf-input" id="ts-name" placeholder="e.g. React"/></div>
    <div class="cf-row"><label class="cf-label">Group</label>
      <div class="cf-status-group">
        <label class="cf-status-opt"><input type="radio" name="ts-group" value="Languages" checked/> Languages</label>
        <label class="cf-status-opt"><input type="radio" name="ts-group" value="Frameworks & Libraries"/> Frameworks</label>
        <label class="cf-status-opt"><input type="radio" name="ts-group" value="Tools & Cloud"/> Tools & Cloud</label>
        <label class="cf-status-opt"><input type="radio" name="ts-group" value="new"/> + New Group</label>
      </div>
    </div>
    <div class="cf-row" id="ts-newgroup-row" style="display:none"><label class="cf-label">New Group Name</label><input class="cf-input" id="ts-newgroup" placeholder="e.g. Databases"/></div>
    <div class="cf-row"><label class="cf-label">Dot Colour</label><div style="display:flex;gap:8px;flex-wrap:wrap">${['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#34d399','#a78bfa','#fbbf24'].map(c=>`<span onclick="this.parentNode.querySelectorAll('span').forEach(s=>s.style.outline='none');this.style.outline='2px solid #fff';document.getElementById('ts-color').value='${c}'" style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;display:inline-block"></span>`).join('')}<input type="hidden" id="ts-color" value="#a78bfa"/></div></div>
  `,async()=>{
    const name=gv('ts-name');
    if(!name){alert('Skill name required.');return;}
    const groupRadio=document.querySelector('input[name="ts-group"]:checked')?.value;
    const grp=groupRadio==='new'?gv('ts-newgroup'):groupRadio;
    if(!grp){alert('Please select or name a group.');return;}
    await fetch('/api/tech-skills',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,color:gv('ts-color')||'#a78bfa',grp})});
    await reloadSection('home');
    closeSharedDialog();
  });
  setTimeout(()=>{
    document.querySelectorAll('input[name="ts-group"]').forEach(r=>{
      r.addEventListener('change',()=>{const row=document.getElementById('ts-newgroup-row');if(row)row.style.display=r.value==='new'?'flex':'none';});
    });
  },100);
}
async function deleteTechSkill(btn,id){
  await fetch(`/api/tech-skills/${id}`,{method:'DELETE'});
  await reloadSection('home');
}

/* ════════════════════════════════════════
   RELOAD SECTION FROM API
   ════════════════════════════════════════ */
async function reloadSection(section){
  const res=await fetch('/api/data');
  const data=await res.json();
  if(section==='home'||section==='all'){renderSoftSkills(data.soft_skills);renderTechSkills(data.tech_skills);renderAbout(data.about);updateHomeStats();}
  if(section==='projects'||section==='all'){renderProjects(data.projects);updateHomeStats();}
  if(section==='experience'||section==='all'){renderExperience(data.experience);}
  if(section==='certs'||section==='all'){renderCertifications(data.certifications);renderAchievements(data.achievements);updateHomeStats();}
  setTimeout(observeFades,50);
}

/* ── FADE OUT KEYFRAME ── */
const fadeStyle=document.createElement('style');
fadeStyle.textContent='@keyframes fadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.85)}}';
document.head.appendChild(fadeStyle);

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', () => {
  loadPortfolioData();
  updateFooter('home');
});

/* ── auto-update copyright year ── */
const yearEl = document.getElementById('copy-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

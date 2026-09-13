var submitted = false;
function showToast(msg) { document.getElementById('toast-msg').innerText = msg; let toast = document.getElementById("toast"); toast.classList.add("show"); setTimeout(() => { toast.classList.remove("show"); }, 3000); }
function openJoinModal() { document.getElementById('mobile-menu').classList.remove('active'); document.getElementById('join-modal').classList.add('show'); }
function closeJoinModal() { document.getElementById('join-modal').classList.remove('show'); }
function closeEgg() { document.getElementById('easter-egg-modal').classList.remove('show'); }

// EASTER EGG LOGIC
let logoClicks = 0, logoTimer;
const secretLogo = document.getElementById('secret-trigger-logo');
if (secretLogo) { 
    secretLogo.addEventListener('click', () => { 
        logoClicks++; 
        clearTimeout(logoTimer); 
        logoTimer = setTimeout(() => { logoClicks = 0; }, 1500); 
        if (logoClicks >= 5) { document.getElementById('easter-egg-modal').classList.add('show'); logoClicks = 0; } 
    }); 
}

// GEAR FAB LOGIC
const fabMain = document.getElementById('fabMain'), fabContainer = document.getElementById('fabContainer');
if(fabMain) fabMain.addEventListener('click', () => { fabContainer.classList.toggle('open'); });

// SCRIPT GOOGLE SHEETS: VOICES OF IMPACT
const sheetCSVUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTI5BjB18YdlDCkrQas1wXa9oN6O449XHbOHtBR92fOgq-MdS8HAX149tpDMcco4NXR0jHd6gYNOUSE/pub?output=csv';

let voicesData = [
    { name: "LOREM IPSUM", roleEn: "Your Role Goes Here", roleId: "Jabatan Anda Disini", org: "PUSERVE", quoteEn: '"Your quotes will appear here once submitted."', quoteId: '"Kutipan Anda akan muncul di sini setelah dikirim."', date: "DD/MM/YYYY", customLogo: null }
];

function csvToArray(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) { if (s && l === p) row[i] += l; s = !s; } 
        else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) { if ('\r' === p) row[i] = row[i].slice(0, -1); row = ret[++r] = [l = '']; i = 0; } 
        else row[i] += l; p = l;
    }
    return ret;
}

function getDriveDirectUrl(url) {
    if (!url) return null;
    const match = url.match(/(?:id=|d\/)([a-zA-Z0-9_-]{25,})/);
    if (match && match[1]) { return `https://drive.google.com/uc?export=view&id=${match[1]}`; }
    return null;
}

async function fetchVoicesData() {
    try {
        const response = await fetch(sheetCSVUrl);
        const csvText = await response.text();
        const rows = csvToArray(csvText);
        
        if (rows.length > 1) {
            const newData = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 6 && row[1] && row[1].trim() !== '') {
                    let logoUrl = null;
                    if (row.length >= 7 && row[6] && row[6].trim() !== '') {
                        logoUrl = getDriveDirectUrl(row[6].trim());
                    }
                    newData.push({
                        name: row[1].trim().toUpperCase(),
                        date: row[2] ? row[2].trim() : "",
                        org: row[3] ? row[3].trim() : "PUSERVE",
                        roleEn: row[4] ? row[4].trim() : "Member",
                        roleId: row[4] ? row[4].trim() : "Anggota",
                        quoteEn: '"' + (row[5] ? row[5].trim() : "") + '"',
                        quoteId: '"' + (row[5] ? row[5].trim() : "") + '"',
                        customLogo: logoUrl 
                    });
                }
            }
            if(newData.length > 0) voicesData = newData; 
        }
    } catch (error) { console.error('Data G-Sheets telat/gagal ditarik:', error); }
    renderVoice();
}

let vIdx = 0;
function renderVoice() {
    const vContainer = document.getElementById('voices-dynamic-content');
    const vLogo = document.getElementById('v-logo');
    
    if(vContainer) {
        vContainer.style.opacity = 0;
        if(vLogo) vLogo.style.opacity = 0;
        
        setTimeout(() => {
            const data = voicesData[vIdx];
            document.getElementById('v-name').innerText = data.name;
            const qEl = document.getElementById('v-quote');
            qEl.setAttribute('data-en', data.quoteEn);
            qEl.setAttribute('data-id', data.quoteId);
            const currentL = localStorage.getItem('puserve_lang') || 'EN';
            qEl.innerText = currentL === 'EN' ? data.quoteEn : data.quoteId;

            const rEl = document.getElementById('v-role');
            rEl.setAttribute('data-en', data.roleEn);
            rEl.setAttribute('data-id', data.roleId);
            rEl.innerText = currentL === 'EN' ? data.roleEn : data.roleId;
            
            document.getElementById('v-date').innerText = data.date;

            if(vLogo) {
                if (data.customLogo) { vLogo.src = data.customLogo; } 
                else {
                    let orgCheck = data.org.toUpperCase();
                    if(orgCheck.includes("CEDRS")) vLogo.src = "logos/LOGO_CEDRS.png";
                    else if(orgCheck === "PU" || orgCheck === "PRESIDENT UNIVERSITY") vLogo.src = "logos/LOGO_PU.png";
                    else vLogo.src = "logos/LOGO_PUSERVE.png";
                }
                vLogo.style.opacity = 1;
            }
            vContainer.style.opacity = 1;
            vIdx = (vIdx + 1) % voicesData.length;
        }, 600);
    }
}

if(document.getElementById('voices-dynamic-content')) {
    fetchVoicesData();
    setInterval(renderVoice, 6000);
}

let currentLang = localStorage.getItem('puserve_lang') || 'EN';
function applyLanguage() {
    const lt = document.getElementById('langText');
    if(lt) lt.innerText = currentLang;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.innerHTML = currentLang === 'EN' ? el.getAttribute('data-en') : el.getAttribute('data-id');
        if (el.placeholder) el.placeholder = currentLang === 'EN' ? el.getAttribute('data-en') : el.getAttribute('data-id');
    });
}

const langTog = document.getElementById('langToggle');
if(langTog) {
    langTog.addEventListener('click', () => { 
        currentLang = currentLang === 'EN' ? 'ID' : 'EN'; 
        localStorage.setItem('puserve_lang', currentLang); 
        applyLanguage(); 
        if(document.getElementById('voices-dynamic-content')) renderVoice();
        if(fabContainer) fabContainer.classList.remove('open'); 
        showToast(currentLang === 'EN' ? "Language: English" : "Bahasa: Indonesia"); 
    });
}

let isEco = localStorage.getItem('puserve_eco') === 'true';
function applyEcoMode() {
    const ecoIcon = document.getElementById('ecoIcon');
    const bgVid = document.getElementById('bg-video');
    if (isEco) {
        document.body.classList.add('eco-mode');
        if(bgVid) bgVid.pause();
        if(ecoIcon) ecoIcon.innerHTML = '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>'; 
    } else {
        document.body.classList.remove('eco-mode');
        if(bgVid) bgVid.play();
        if(ecoIcon) ecoIcon.innerHTML = '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'; 
    }
}

const ecoTog = document.getElementById('ecoToggle');
if(ecoTog) {
    ecoTog.addEventListener('click', () => { 
        isEco = !isEco; localStorage.setItem('puserve_eco', isEco); applyEcoMode(); 
        if(fabContainer) fabContainer.classList.remove('open'); 
        showToast(currentLang === 'EN' ? (isEco ? "Eco-Mode Activated" : "Eco-Mode Disabled") : (isEco ? "Mode Hemat Daya Aktif" : "Mode Hemat Daya Nonaktif")); 
    });
}
applyEcoMode(); 
applyLanguage();

// SCROLL BEHAVIOR & BACK TO TOP
const navbar = document.getElementById('navbar'), backToTopBtn = document.getElementById('back-to-top');
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    let st = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    if(navbar) { if (st > lastScrollTop && st > 150) navbar.classList.add('nav-hidden'); else navbar.classList.remove('nav-hidden'); }
    lastScrollTop = st <= 0 ? 0 : st; 
    
    if(backToTopBtn) { if (st > 200) backToTopBtn.classList.add('show'); else backToTopBtn.classList.remove('show'); }
});
if(backToTopBtn) backToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
const hamburger = document.getElementById('hamburger-icon');
if(hamburger) hamburger.addEventListener('click', () => { document.getElementById('mobile-menu').classList.toggle('active'); });
document.querySelectorAll('.trans-link').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const targetUrl = e.currentTarget.href; setTimeout(() => { window.location.href = targetUrl; }, 100); }); });

const counters = document.querySelectorAll('.counter');
if(counters.length > 0) {
    const observerCounter = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target').replace(/\D/g, ''), 10) || 0;
                const updateCount = () => {
                    const count = parseInt(counter.innerText.replace(/\D/g, ''), 10) || 0;
                    const inc = target / 30; 
                    if(count < target) { counter.innerText = Math.ceil(count + inc); setTimeout(updateCount, 40); } 
                    else { counter.innerText = target + '+'; }
                };
                updateCount(); obs.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observerCounter.observe(c));
}

const campObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.querySelectorAll('.counter-camp').forEach(c => {
                const target = +c.getAttribute('data-target'); let count = 0;
                const updateCount = () => { const inc = target / 40; if(count < target) { count += inc; c.innerText = Math.ceil(count) + '%'; setTimeout(updateCount, 40); } else { c.innerText = target + '%'; } };
                updateCount();
            });
            entry.target.querySelectorAll('.progress-fill').forEach(f => { f.style.width = f.getAttribute('data-width'); });
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });
if(document.querySelector('.campaign-grid')) campObserver.observe(document.querySelector('.campaign-grid'));

const repoName = 'puserve/puserve.github.io'; 
const formatDate = (dateStr) => { try { const d = new Date(dateStr); if (!isNaN(d)) return d.toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); } catch(e){} return dateStr; };

async function fetchContent(folder, containerId, targetFile) {
    const container = document.getElementById(containerId);
    if (!container) return; 
    const cacheKey = `puserve_cache_${folder}`;
    const emptyMsg = currentLang === 'EN' ? 'No records published yet.' : 'Belum ada catatan yang dipublikasikan.';
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) container.innerHTML = cachedData;

    try {
        const res = await fetch(`https://api.github.com/repos/${repoName}/contents/${folder}`);
        if (!res.ok) throw new Error("API Limit");
        const files = await res.json();
        let dataList = [];
        for (const file of files) {
            if (!file.name.endsWith('.md') || file.name.startsWith('TEMPLATE')) continue;
            const mdText = await (await fetch(file.download_url)).text();
            const parts = mdText.split('---');
            if (parts.length >= 3) { const fm = jsyaml.load(parts[1]); fm.fileName = file.name; dataList.push(fm); }
        }
        if (dataList.length === 0) { container.innerHTML = `<div class="empty-state">${emptyMsg}</div>`; return; }
        dataList.sort((a, b) => new Date(b.date) - new Date(a.date));
        const html = dataList.slice(0, 4).map(fm => `
            <a href="${targetFile}?file=${fm.fileName}" class="card trans-link">
                <img src="${fm.thumbnail ? (fm.thumbnail.includes('/') ? fm.thumbnail : `uploads/${fm.thumbnail}`) : 'logos/LOGO_PUSERVE.png'}" class="card-img" onerror="this.src='logos/LOGO_PUSERVE.png'">
                <div class="card-body">
                    <span class="card-tag">${fm.status || fm.category || 'Update'}</span>
                    <h3 class="card-title">${fm.title}</h3>
                    <div class="card-meta"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${formatDate(fm.date)}</div>
                </div>
            </a>
        `).join('');
        container.innerHTML = html; localStorage.setItem(cacheKey, html); 
        document.querySelectorAll(`#${containerId} .trans-link`).forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const targetUrl = e.currentTarget.href; setTimeout(() => { window.location.href = targetUrl; }, 100); }); });
    } catch (error) { if(!cachedData) container.innerHTML = `<div class="empty-state">${currentLang === 'EN' ? 'Data temporarily unavailable. (Please wait if rate limited).' : 'Data sementara tidak tersedia. (Tunggu sebentar jika limit).'}</div>`; }
}

fetchContent('_events', 'home-events-grid', 'read.html');
fetchContent('_news', 'home-news-carousel', 'read-news.html');

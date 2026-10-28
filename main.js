// ============================================================
// SHAH ALAM CITY FC — SHARED SITE LOGIC
// ============================================================

// ===== CONFIG — UPDATE THESE =====
const WA_NUMBER = "60123456789"; // <-- Nomor WhatsApp club (format: 60xxx, no + or spaces)

const SHEET_URLS = {
    players:  "PASTE_PLAYERS_SHEET_URL_HERE",
    fixtures: "PASTE_FIXTURES_SHEET_URL_HERE",
    results:  "PASTE_RESULTS_SHEET_URL_HERE",
    news:     "PASTE_NEWS_SHEET_URL_HERE",
};

// ============================================================
// GOOGLE SHEETS TAB FORMAT (headers in row 1)
// Players:  num | name | pos | apps | goals | assists
// Fixtures: date | time | home | away | venue | badge | comp
// Results:  date | comp | home | away | score | result   (result: W/D/L)
// News:     tag | title | excerpt | date | icon
// Setup: Sheet > File > Share > Publish to web > CSV, paste URL above.
// ============================================================

// ===== FALLBACK DATA =====
const fallbackPlayers = [
    { num: "1",  name: "Player Name", pos: "GK",  apps: "0", goals: "0", assists: "0" },
    { num: "13", name: "Player Name", pos: "GK",  apps: "0", goals: "0", assists: "0" },
    { num: "2",  name: "Player Name", pos: "DEF", apps: "0", goals: "0", assists: "0" },
    { num: "3",  name: "Player Name", pos: "DEF", apps: "0", goals: "0", assists: "0" },
    { num: "4",  name: "Player Name", pos: "DEF", apps: "0", goals: "0", assists: "0" },
    { num: "5",  name: "Player Name", pos: "DEF", apps: "0", goals: "0", assists: "0" },
    { num: "6",  name: "Player Name", pos: "MID", apps: "0", goals: "0", assists: "0" },
    { num: "8",  name: "Player Name", pos: "MID", apps: "0", goals: "0", assists: "0" },
    { num: "10", name: "Player Name", pos: "MID", apps: "0", goals: "0", assists: "0" },
    { num: "7",  name: "Player Name", pos: "FWD", apps: "0", goals: "0", assists: "0" },
    { num: "9",  name: "Player Name", pos: "FWD", apps: "0", goals: "0", assists: "0" },
    { num: "11", name: "Player Name", pos: "FWD", apps: "0", goals: "0", assists: "0" },
];

const fallbackFixtures = [
    { date: "Sat, 24 Oct 2026", time: "20:45", home: "Shah Alam City FC", away: "Opponent FC", venue: "Sportizza Arena", badge: "home", comp: "FAS League" },
    { date: "Wed, 28 Oct 2026", time: "21:00", home: "Rival United", away: "Shah Alam City FC", venue: "Away Stadium", badge: "away", comp: "SCL" },
    { date: "Sun, 1 Nov 2026", time: "20:45", home: "Shah Alam City FC", away: "City Rivals", venue: "Sportizza Arena", badge: "home", comp: "FAS League" },
];

const fallbackResults = [
    { date: "17 Oct 2026", comp: "FAS League", home: "Shah Alam City FC", away: "Eastside FC", score: "3 - 1", result: "W" },
    { date: "11 Oct 2026", comp: "FAS League", home: "Metro FC", away: "Shah Alam City FC", score: "2 - 2", result: "D" },
    { date: "4 Oct 2026", comp: "SCL", home: "Shah Alam City FC", away: "Highland United", score: "1 - 0", result: "W" },
];

const fallbackNews = [
    { tag: "Match Report", title: "Wolves Claim Three Points At Home", excerpt: "A commanding performance saw the team secure a convincing victory in front of the home crowd.", date: "18 Oct 2026", icon: "&#9917;" },
    { tag: "Club News", title: "New Signing Bolsters The Squad", excerpt: "The management has confirmed the arrival of a new midfielder ahead of the run-in.", date: "15 Oct 2026", icon: "&#128221;" },
    { tag: "Youth", title: "Academy Trio Promoted To First Team Training", excerpt: "Three academy graduates step up to train with the senior squad.", date: "10 Oct 2026", icon: "&#127942;" },
];

const products = [
    { name: "Home Jersey 2026/27", desc: "Official maroon home kit with embroidered crest.", price: "RM 89", badge: "New", icon: "&#128085;", paymentLink: "" },
    { name: "Away Jersey 2026/27", desc: "Chrome yellow away kit. Lightweight fabric.", price: "RM 89", badge: "New", icon: "&#128085;", paymentLink: "" },
    { name: "Training Kit", desc: "Black training shirt with club badge.", price: "RM 65", badge: "", icon: "&#128085;", paymentLink: "" },
    { name: "Supporter Scarf", desc: "Maroon & gold scarf. Show your Wolf pride!", price: "RM 35", badge: "Popular", icon: "&#129507;", paymentLink: "" },
    { name: "Club Cap", desc: "Structured cap with embroidered wolf crest.", price: "RM 45", badge: "", icon: "&#129517;", paymentLink: "" },
    { name: "Kids Jersey", desc: "Mini home kit for young Wolves. Ages 4-12.", price: "RM 59", badge: "", icon: "&#128085;", paymentLink: "" },
];

// ===== DATA STORES =====
const data = {
    players: [...fallbackPlayers],
    fixtures: [...fallbackFixtures],
    results: [...fallbackResults],
    news: [...fallbackNews],
};
const fallbacks = {
    players: fallbackPlayers,
    fixtures: fallbackFixtures,
    results: fallbackResults,
    news: fallbackNews,
};

let currentFilter = 'all';

// ===== HELPERS =====
const el = id => document.getElementById(id);
function posName(pos) {
    return { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' }[(pos || '').toUpperCase()] || pos;
}

// ===== SHEETS FETCH =====
function fetchSheet(url, fallback, callback) {
    if (!url || url.includes("PASTE_")) { callback(fallback); return; }
    Papa.parse(url, {
        download: true, header: true, skipEmptyLines: true,
        complete: res => {
            const rows = res.data.filter(r => r[Object.keys(r)[0]]);
            callback(rows.length ? rows : fallback);
        },
        error: () => callback(fallback)
    });
}

// ===== RENDER: PLAYERS =====
function renderPlayers(filter) {
    currentFilter = filter;
    const grid = el('playersGrid');
    if (!grid) return;
    const list = filter === 'all' ? data.players : data.players.filter(p => (p.pos || '').toUpperCase() === filter);
    grid.innerHTML = list.map(p => `
        <div class="player-card">
            <div class="player-img">
                <span class="number">${p.num}</span>
                <span class="silhouette">&#128100;</span>
            </div>
            <div class="player-body">
                <div class="name">${p.name}</div>
                <div class="pos">${posName(p.pos)}</div>
                <div class="player-stats">
                    <div class="stat"><div class="n">${p.apps}</div><div class="t">Apps</div></div>
                    <div class="stat"><div class="n">${p.goals}</div><div class="t">Goals</div></div>
                    <div class="stat"><div class="n">${p.assists}</div><div class="t">Assists</div></div>
                </div>
            </div>
        </div>`).join('');
}

// ===== RENDER: FIXTURES =====
function renderFixtures() {
    const box = el('fixturesList');
    if (!box) return;
    box.innerHTML = data.fixtures.map(f => {
        const home = (f.badge === 'home');
        const opponent = home ? f.away : f.home;
        return `
        <div class="match-card">
            <div class="match-date"><div class="d">${f.date}</div></div>
            <div class="match-info">
                <div class="teams">${home ? 'vs' : '@'} ${opponent}</div>
                <div class="meta">${f.comp || ''} &bull; ${f.venue || ''} &bull; ${f.time || ''}</div>
            </div>
            <span class="match-ha ${home ? 'home' : 'away'}">${home ? 'Home' : 'Away'}</span>
        </div>`;
    }).join('');
}

// ===== RENDER: RESULTS =====
function renderResults() {
    const box = el('resultsList');
    if (!box) return;
    box.innerHTML = data.results.map(r => `
        <div class="match-card">
            <div class="match-date"><div class="d">${r.date}</div></div>
            <div class="match-info">
                <div class="teams">${r.home} <span class="vs">vs</span> ${r.away}</div>
                <div class="meta">${r.comp || ''}</div>
            </div>
            <div class="match-score">${r.score}</div>
            <span class="match-badge badge-${r.result}">${r.result}</span>
        </div>`).join('');
}

// ===== RENDER: NEWS =====
function renderNews() {
    const box = el('newsList');
    if (!box) return;
    box.innerHTML = data.news.map(n => `
        <div class="news-card">
            <span class="news-tag">${n.tag}</span>
            <h4>${n.title}</h4>
            <p>${n.excerpt}</p>
            <div class="meta">${n.date}</div>
        </div>`).join('');
}

// ===== RENDER: STORE =====
function renderStore() {
    const grid = el('storeGrid');
    if (!grid) return;
    grid.innerHTML = products.map(p => {
        const hasPayment = p.paymentLink && p.paymentLink.trim() !== '';
        const link = hasPayment
            ? p.paymentLink
            : `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi Shah Alam City FC! I want to order: ${p.name} (${p.price}). Please share size availability.`)}`;
        const label = hasPayment ? "&#128179; Buy Now" : "&#128172; Order";
        return `
        <div class="product-card">
            <div class="product-img">
                <span class="p-icon">${p.icon}</span>
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            </div>
            <div class="product-body">
                <div class="p-name">${p.name}</div>
                <div class="p-desc">${p.desc}</div>
                <div class="p-bottom">
                    <div class="p-price">${p.price}</div>
                    <a href="${link}" class="btn-order" target="_blank" rel="noopener">${label}</a>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ===== RENDER ALL (only what exists on the page) =====
function renderPage() {
    if (el('playersGrid')) renderPlayers(currentFilter);
    if (el('fixturesList')) renderFixtures();
    if (el('resultsList')) renderResults();
    if (el('newsList')) renderNews();
    if (el('storeGrid')) renderStore();
}

// ===== INIT =====
function initNav() {
    const hamburger = el('hamburger');
    const navLinks = el('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
    }
}

function initSquadTabs() {
    const tabs = document.querySelectorAll('.squad-tab');
    if (!tabs.length) return;
    tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderPlayers(tab.dataset.filter);
    }));
}

function initData() {
    // Only load sheet data for sections present on this page
    const keys = ['players', 'fixtures', 'results', 'news'].filter(k => el(mapEl[k]));
    if (!keys.length) { renderPage(); return; }
    let done = 0;
    keys.forEach(k => fetchSheet(SHEET_URLS[k], fallbacks[k], rows => {
        data[k] = rows;
        if (++done === keys.length) renderPage();
    }));
}
const mapEl = { players: 'playersGrid', fixtures: 'fixturesList', results: 'resultsList', news: 'newsList' };

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initSquadTabs();
    initData();
});

// Le contenu (textes, tableaux, expositions, contact) vient des fichiers du dossier content/,
// modifiables depuis l'admin Pages CMS. Ce script remplit la page à partir de ces fichiers.

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Chemin d'image relatif au site (Pages CMS peut enregistrer "/images/...")
const chemin = p => String(p || '').replace(/^\/+/, '');
const img = p => esc(chemin(p));
const paragraphes = t => String(t || '').split(/\n\s*\n/).filter(Boolean).map(p => `<p>${esc(p.trim())}</p>`).join('');
const charger = nom => fetch(`content/${nom}.json`, { cache: 'no-cache' }).then(r => r.json());

const ICONES = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.09 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.39.05.78.11 1.14.2v3.32c-.22-.02-.44-.03-.65-.04-.25 0-.49-.01-.73-.01-.71 0-1.26.1-1.68.31-.28.14-.52.36-.68.62-.26.42-.37 1-.37 1.75v1.3h3.92l-.39 2.1-.29 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04 24 5.42 18.63.04 12 .04S0 5.42 0 12.04c0 5.63 3.87 10.35 9.1 11.65z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>'
};
const RESEAUX = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['youtube', 'YouTube']];

function afficherAccueil(a) {
  document.querySelector('.hero .eyebrow').textContent = a.sous_titre || '';
  document.querySelector('.hero h1').innerHTML = `${esc(a.titre)} <em>${esc(a.titre_couleur)}</em>`;
  const h = document.querySelector('.hero-img');
  h.src = chemin(a.tableau);
  h.alt = a.tableau_description || '';
  const ap = document.querySelector('.apropos-img');
  ap.src = chemin(a.apropos_image);
  document.querySelector('.apropos-texte').innerHTML = paragraphes(a.apropos_texte);
}

function afficherOeuvres(o) {
  document.getElementById('groupes').innerHTML = (o.groupes || []).map(g => {
    const t = g.tableaux || [];
    const serie = t.length > 1;
    const figures = t.map(x => `
          <figure><img src="${img(x.image)}" alt="${esc(x.description_image || x.titre)}" loading="lazy"><figcaption><strong>${esc(x.titre)}</strong><span>${esc(x.details)}</span></figcaption></figure>`).join('');
    return `
      <div class="serie">
        <div class="serie-titre">
          <p class="eyebrow">${serie ? `Série · ${t.length} toiles` : 'Œuvre'}</p>
          <h3>${esc(g.titre)}</h3>
          ${g.description ? `<p>${esc(g.description)}</p>` : ''}
        </div>
        <div class="galerie ${serie ? 'triptyque' : 'seule'}">${figures}
        </div>
        ${serie ? '<div class="points" aria-hidden="true">' + t.map(() => '<span></span>').join('') + '</div>' : ''}
      </div>`;
  }).join('');
  activerPoints();
}

function carteExpo(e) {
  const horaires = (e.horaires || []).map(h => `
            <div class="${h.vernissage ? 'vernissage' : ''}"><dt>${esc(h.jour)}</dt><dd>${esc(h.heures)}</dd></div>`).join('');
  const adresse = [e.lieu, e.adresse].filter(Boolean).join(' ');
  return `
      <article class="expo-vedette">
        ${e.affiche ? `<img src="${img(e.affiche)}" alt="Affiche de l'exposition ${esc(e.titre)}" class="affiche" loading="lazy">` : ''}
        <div class="expo-infos">
          <time>${esc(e.dates)}</time>
          <h3>${esc(e.titre)}</h3>
          ${e.presentation ? `<p class="expo-cadre">${esc(e.presentation)}</p>` : ''}
          ${horaires ? `<dl class="horaires">${horaires}\n          </dl>` : ''}
          ${adresse ? `<p class="lieu"><strong>${esc(e.lieu)}</strong>${e.adresse ? '<br>' + esc(e.adresse) : ''}</p>` : ''}
          ${e.entree_libre ? '<p class="gratuit">Entrée libre</p>' : ''}
          <div class="expo-btns">
            ${adresse ? `<a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(adresse)}" target="_blank" rel="noopener" class="btn">Itinéraire</a>` : ''}
            ${e.lien_site ? `<a href="${esc(e.lien_site)}" target="_blank" rel="noopener" class="btn btn-ligne">Site de l'événement</a>` : ''}
          </div>
        </div>
      </article>`;
}

function afficherExpositions(x) {
  // Une exposition dont la date de fin est passée va dans "Expositions passées"
  const auj = new Date().toISOString().slice(0, 10);
  const liste = x.expositions || [];
  const avenir = liste.filter(e => !e.date_fin || e.date_fin >= auj);
  const passees = liste.filter(e => e.date_fin && e.date_fin < auj);
  document.getElementById('expos-avenir').innerHTML = avenir.length
    ? avenir.map(carteExpo).join('')
    : '<p class="vide">Aucune exposition annoncée pour le moment. Revenez bientôt !</p>';
  const bloc = document.getElementById('expos-passees');
  bloc.hidden = !passees.length;
  bloc.querySelector('ul').innerHTML = passees.map(e => `
        <li><time>${esc(e.dates)}</time><strong>${esc(e.titre)}</strong><span>${esc([e.lieu, e.adresse].filter(Boolean).join(', '))}</span></li>`).join('');
}

function afficherContact(c) {
  document.querySelector('.contact h2').textContent = c.titre || '';
  document.querySelector('.contact-texte').textContent = c.texte || '';
  const mail = document.querySelector('.contact-mail');
  mail.href = 'mailto:' + (c.email || '');
  mail.hidden = !c.email;
  const liens = RESEAUX.filter(([k]) => c[k]);
  document.querySelector('.reseaux-bloc').hidden = !liens.length;
  document.querySelector('.reseaux').innerHTML = liens.map(([k, nom]) => `
        <li><a href="${esc(c[k])}" target="_blank" rel="noopener" aria-label="${nom}">${ICONES[k]}<span>${nom}</span></a></li>`).join('');
}

// Sur téléphone, une série défile au doigt : les points montrent la toile affichée
function activerPoints() {
  document.querySelectorAll('.serie').forEach(s => {
    const g = s.querySelector('.galerie.triptyque');
    const pts = s.querySelectorAll('.points span');
    if (!g || !pts.length) return;
    const maj = () => {
      const pas = g.children.length > 1 ? g.children[1].offsetLeft - g.children[0].offsetLeft : 1;
      const i = Math.round(g.scrollLeft / pas);
      pts.forEach((p, k) => p.classList.toggle('actif', k === i));
    };
    g.addEventListener('scroll', () => requestAnimationFrame(maj), { passive: true });
    maj();
  });
}

Promise.all(['accueil', 'oeuvres', 'expositions', 'contact'].map(n => charger(n).catch(() => null)))
  .then(([a, o, x, c]) => {
    if (a) afficherAccueil(a);
    if (o) afficherOeuvres(o);
    if (x) afficherExpositions(x);
    if (c) afficherContact(c);
  });

// ---------- Mode jour / mode sombre (sombre par défaut) ----------
const themeBtn = document.querySelector('.theme-btn');
const themeMeta = document.querySelector('meta[name="theme-color"]');
function appliquerTheme(jour) {
  if (jour) document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
  themeBtn.setAttribute('aria-label', jour ? 'Passer en mode sombre' : 'Passer en mode jour');
  themeMeta.setAttribute('content', jour ? '#f6f1ea' : '#231913');
}
appliquerTheme(document.documentElement.dataset.theme === 'light');
themeBtn.addEventListener('click', () => {
  const jour = document.documentElement.dataset.theme !== 'light';
  appliquerTheme(jour);
  try { localStorage.setItem('theme', jour ? 'light' : 'dark'); } catch (e) {}
});

// ---------- Menu mobile ----------
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuBtn.addEventListener('click', () => {
  const ouvert = nav.classList.toggle('ouvert');
  menuBtn.setAttribute('aria-expanded', ouvert);
});
document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('ouvert');
  menuBtn.setAttribute('aria-expanded', false);
}));

// ---------- Agrandissement des tableaux ----------
// Chaque groupe s'ouvre seul : les toiles d'une série ensemble, un tableau seul ou une affiche à part
const box = document.getElementById('lightbox');
const boxImg = box.querySelector('img');
const boxTxt = box.querySelector('figcaption');
const navBtns = box.querySelectorAll('.lb-nav');
let groupe = [];
let actuel = 0;

function montrer(i) {
  actuel = (i + groupe.length) % groupe.length;
  const t = groupe[actuel];
  boxImg.src = t.src;
  boxImg.alt = t.alt;
  const legende = t.closest('figure') && t.closest('figure').querySelector('strong');
  boxTxt.textContent = legende ? legende.textContent : t.alt;
}
function ouvrir(im) {
  const conteneur = im.closest('.galerie');
  groupe = conteneur ? [...conteneur.querySelectorAll('img')] : [im];
  navBtns.forEach(b => b.hidden = groupe.length < 2);
  montrer(groupe.indexOf(im));
  box.classList.add('ouvert');
  document.body.style.overflow = 'hidden';
}
function fermer() { box.classList.remove('ouvert'); document.body.style.overflow = ''; }

// Délégation : marche aussi pour les images ajoutées depuis l'admin
document.addEventListener('click', e => {
  const im = e.target.closest('.galerie img, .affiche');
  if (im) ouvrir(im);
});
box.querySelector('.lb-fermer').addEventListener('click', fermer);
box.querySelector('.lb-prec').addEventListener('click', e => { e.stopPropagation(); montrer(actuel - 1); });
box.querySelector('.lb-suiv').addEventListener('click', e => { e.stopPropagation(); montrer(actuel + 1); });
box.addEventListener('click', e => { if (e.target === box) fermer(); });
document.addEventListener('keydown', e => {
  if (!box.classList.contains('ouvert')) return;
  if (e.key === 'Escape') fermer();
  if (groupe.length < 2) return;
  if (e.key === 'ArrowLeft') montrer(actuel - 1);
  if (e.key === 'ArrowRight') montrer(actuel + 1);
});

let departX = null;
box.addEventListener('touchstart', e => { departX = e.touches[0].clientX; }, { passive: true });
box.addEventListener('touchend', e => {
  if (departX === null) return;
  const dx = e.changedTouches[0].clientX - departX;
  if (Math.abs(dx) > 50 && groupe.length > 1) montrer(actuel + (dx < 0 ? 1 : -1));
  departX = null;
});

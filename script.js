var B = [], SC = {sud:0, nord:0}, J = "SUD", FI = false, NJ = {sud:"Joueur SUD", nord:"Joueur NORD"};
const ROUTE = [13, 12, 11, 10, 9, 8, 7, 0, 1, 2, 3, 4, 5, 6];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-regles").onclick = () => {
    let l = document.getElementById("lr"), f = document.getElementById("f0");
    l.style.display = l.style.display === "none" ? "block" : "none";
    f.textContent = l.style.display === "none" ? "▶" : "▼";
  };
  document.querySelectorAll(".at").forEach(el => el.onclick = function() {
    this.nextElementSibling.classList.toggle("v");
    this.classList.toggle("ouvert");
  });
  document.getElementById("btn-demarrer").onclick = dem;
  document.getElementById("btn-rejouer-top").onclick = init;
  document.getElementById("btn-quitter-top").onclick = ret;
  document.getElementById("btn-rejouer-fin").onclick = () => { init(); cF(); };
  document.getElementById("btn-quitter-fin").onclick = () => { ret(); cF(); };
});

const suiv = p => {
  let idx = ROUTE.indexOf(p);
  return ROUTE[(idx + 1) % 14];
};

const prec = p => {
  let idx = ROUTE.indexOf(p);
  return ROUTE[(idx - 1 + 14) % 14];
};
const estAdv = (p, j) => j === "SUD" ? (p >= 0 && p <= 6) : (p >= 7 && p <= 13);
const cVide = j => B.slice(j === "NORD" ? 0 : 7, j === "NORD" ? 7 : 14).every(v => v === 0);
const cF = () => document.getElementById("fin").classList.remove("v");
const ret = () => { document.getElementById("jeu").style.display = "none"; document.getElementById("accueil").style.display = "flex"; };

function dem(){
  NJ.sud = document.getElementById("ns").value.trim() || "Joueur SUD";
  NJ.nord = document.getElementById("nn").value.trim() || "Joueur NORD";
  [["lsud", NJ.sud], ["lnord", NJ.nord], ["lrs", NJ.sud+" (SUD)"], ["lrn", NJ.nord+" (NORD)"]].forEach(x => document.getElementById(x[0]).textContent = x[1]);
  document.getElementById("accueil").style.display = "none";
  document.getElementById("jeu").style.display = "flex";
  init();
}

function init(){
  B = Array(14).fill(4); SC = {sud:0, nord:0}; J = "SUD"; FI = false;
  majI(); setMsg(`C'est votre tour, ${NJ.sud} ! Semez vers la droite.`); draw(); majSC();
}

function jouer(idx){
  if(FI) return;
  if((J === "SUD" && (idx < 7 || idx > 13)) || (J === "NORD" && (idx < 0 || idx > 6))) return setMsg("⚠️ Jouez dans votre camp !");
  if(B[idx] === 0) return setMsg("⚠️ Ce trou est vide.");
  if(((J === "SUD" && idx === 13) || (J === "NORD" && idx === 0)) && B[idx] <= 2) return setMsg("🚫 Interdit : Invasion impossible avec 1 ou 2 billes.");
  if(cVide(J === "SUD" ? "NORD" : "SUD") && !coupNourrit(idx)) return setMsg("🤝 Solidarité obligatoire ! Nourrissez l'adversaire.");
  if(caVideraitTout(idx)) return setMsg("🚫 Interdit : Vous allez affamer l'adversaire !");

  let n = B[idx]; B[idx] = 0; let p = idx;
  for(let i=0; i<n; i++) { p = suiv(p); if(p === idx) p = suiv(p); B[p]++; }
  
  let t = 0;
  while(estAdv(p, J) && B[p] >= 2 && B[p] <= 4) { SC[J.toLowerCase()] += B[p]; t += B[p]; B[p] = 0; p = prec(p); }
  majSC();

  if(chkF()) { draw(); return; }
  J = J === "SUD" ? "NORD" : "SUD";
  majI(); draw();
  setMsg(t > 0 ? `✅ Prise de ${t} billes ! À toi, ${J === "SUD" ? NJ.sud : NJ.nord}.` : `C'est au tour de ${J === "SUD" ? NJ.sud : NJ.nord}.`);
}

function coupNourrit(idx) {
  let bc = B.slice(), p = idx; bc[p] = 0;
  for(let i=0; i<B[idx]; i++) { p = suiv(p); if(p === idx) p = suiv(p); bc[p]++; }
  return estAdv(p, J);
}

function caVideraitTout(idx){
  let bc = B.slice(), p = idx; bc[p] = 0;
  for(let i=0; i<B[idx]; i++) { p = suiv(p); if(p === idx) p = suiv(p); bc[p]++; }
  while(estAdv(p, J) && bc[p] >= 2 && bc[p] <= 4) { bc[p] = 0; p = prec(p); }
  return bc.slice(J === "SUD" ? 0 : 7, J === "SUD" ? 7 : 14).every(v => v === 0);
}

function chkF(){
  if(SC.sud >= 40 || SC.nord >= 40) return finPartie(`${SC.sud >= 40 ? NJ.sud : NJ.nord} remporte la partie !`);
  if(B.reduce((a,b) => a+b, 0) < 10){
    for(let i=0; i<7; i++) { SC.nord += B[i]; SC.sud += B[i+7]; B[i] = B[i+7] = 0; }
    majSC();
    return finPartie(SC.sud > SC.nord ? NJ.sud + " gagne !" : SC.nord > SC.sud ? NJ.nord + " gagne !" : "Match nul !");
  }
  return false;
}

function finPartie(t) {
  FI = true; document.getElementById("inf-e").textContent = "Terminé";
  [["rns", NJ.sud], ["rnn", NJ.nord], ["rvs", SC.sud], ["rvn", SC.nord], ["mfin", t]].forEach(x => document.getElementById(x[0]).textContent = x[1]);
  document.getElementById("fin").classList.add("v"); return true;
}

function draw(){
  let rn = document.getElementById("rn"), rs = document.getElementById("rs");
  rn.innerHTML = ""; rs.innerHTML = "";
  for(let i=0; i<=6; i++) rn.appendChild(mk(i, J === "NORD" && !FI, "N" + (i + 1)));
  for(let i=7; i<=13; i++) rs.appendChild(mk(i, J === "SUD" && !FI, "S" + (i - 6)));
}

function mk(idx, jouable, label){
  let div = document.createElement("div"), nb = B[idx];
  div.className = "case" + (nb === 0 ? " vide" : "");
  if(nb > 0){
    let w = document.createElement("div"); w.className = "billes";
    if(nb <= 15) for(let k=0; k<nb; k++) { let b = document.createElement("div"); b.className = "bille"; w.appendChild(b); }
    else { let c = document.createElement("div"); c.className = "nb"; c.textContent = nb; w.appendChild(c); }
    div.appendChild(w);
    if(jouable) { div.classList.add("jouable"); div.onclick = () => jouer(idx); }
  }
  let num = document.createElement("div"); num.className = "num"; num.textContent = `${label} (${nb})`; div.appendChild(num);
  return div;
}

const majI = () => { document.getElementById("inf-j").textContent = `${J === "SUD" ? NJ.sud : NJ.nord} (${J})`; document.getElementById("inf-e").textContent = "En jeu"; };
const majSC = () => { document.getElementById("vsud").textContent = SC.sud; document.getElementById("vnord").textContent = SC.nord; };
const setMsg = t => document.getElementById("msg").textContent = t;
"use strict";
/*
 * SONGO — script.js
 * ROUTE : sens trigonométrique (anti-horaire) vu de dessus.
 * SUD joue de gauche à droite (7→13), puis le tour monte vers NORD
 * et NORD joue de droite à gauche (6→0), puis redescend.
 *        NORD  ← [0][1][2][3][4][5][6]
 *        SUD   → [7][8][9][10][11][12][13]
 *  anti-horaire : 7→8→…→13→6→5→…→0→7→…
 */
var B=[], SC={sud:0,nord:0}, J="SUD", FI=false, NJ={sud:"Joueur SUD",nord:"Joueur NORD"};
const ROUTE=[7,8,9,10,11,12,13,6,5,4,3,2,1,0];
const suiv=p=>ROUTE[(ROUTE.indexOf(p)+1)%14];
const prec=p=>ROUTE[(ROUTE.indexOf(p)+13)%14];
const estAdv=(p,j)=>j==="SUD"?(p<=6):(p>=7);
const cVide=j=>B.slice(j==="NORD"?0:7,j==="NORD"?7:14).every(v=>v===0);
const nomJ=()=>J==="SUD"?NJ.sud:NJ.nord;
const $=id=>document.getElementById(id);
const setText=(id,v)=>{const e=$(id);if(e)e.textContent=v};
const setMsg=t=>setText("msg",t);
const majI=()=>{setText("inf-j",`${nomJ()} (${J})`);setText("inf-e","En jeu")};
const majSC=()=>{setText("vsud",SC.sud);setText("vnord",SC.nord)};
const ret=()=>{$("jeu").style.display="none";$("accueil").style.display="flex"};
const cF=()=>$("fin").classList.remove("v");

document.addEventListener("DOMContentLoaded",()=>{
  $("btn-regles").onclick=()=>{
    const l=$("lr"),open=l.style.display!=="block";
    l.style.display=open?"block":"none";
    $("f0").textContent=open?"▼":"▶";
  };
  $("btn-demarrer").onclick=dem;
  $("btn-rejouer-top").onclick=init;
  $("btn-quitter-top").onclick=ret;
  $("btn-rejouer-fin").onclick=()=>{cF();init()};
  $("btn-quitter-fin").onclick=()=>{cF();ret()};
});

function dem(){
  NJ.sud  = $("ns").value.trim()||"Joueur SUD";
  NJ.nord = $("nn").value.trim()||"Joueur NORD";
  setText("lsud",NJ.sud); setText("lnord",NJ.nord);
  setText("lrs",`${NJ.sud} (SUD)`); setText("lrn",`${NJ.nord} (NORD)`);
  $("accueil").style.display="none";
  $("jeu").style.display="flex";
  init();
}

function init(){
  B=Array(14).fill(4);SC={sud:0,nord:0};J="SUD";FI=false;
  majI();setMsg(`C'est votre tour, ${NJ.sud} ! Semez vers la droite.`);draw();majSC();
}

function jouer(idx){
  if(FI)return;
  if(J==="SUD"&&(idx<7||idx>13))return setMsg("⚠️ Jouez dans votre camp !");
  if(J==="NORD"&&(idx<0||idx>6))return setMsg("⚠️ Jouez dans votre camp !");
  if(B[idx]===0)return setMsg("⚠️ Ce trou est vide.");
  if((J==="SUD"&&idx===13||J==="NORD"&&idx===0)&&B[idx]<=2)
    return setMsg("🚫 Invasion impossible avec 1 ou 2 billes.");
  if(cVide(J==="SUD"?"NORD":"SUD")&&!coupNourrit(idx))
    return setMsg("🤝 Solidarité ! Nourrissez l'adversaire.");
  if(caVideraitTout(idx))return setMsg("🚫 Interdit : vous affameriez l'adversaire !");

  let n=B[idx];B[idx]=0;let p=idx;
  for(let i=0;i<n;i++){p=suiv(p);if(p===idx)p=suiv(p);B[p]++;}

  let t=0;
  while(estAdv(p,J)&&B[p]>=2&&B[p]<=4){SC[J.toLowerCase()]+=B[p];t+=B[p];B[p]=0;p=prec(p);}
  majSC();
  if(chkF()){draw();return;}
  J=J==="SUD"?"NORD":"SUD";
  majI();draw();
  setMsg(t>0?`✅ Prise de ${t} bille${t>1?"s":""} ! À toi, ${nomJ()}.`:`Au tour de ${nomJ()}.`);
}

function simSemis(idx){
  const bc=B.slice();let p=idx;bc[p]=0;
  for(let i=0;i<B[idx];i++){p=suiv(p);if(p===idx)p=suiv(p);bc[p]++;}
  return{bc,p};
}
function coupNourrit(idx){const{bc,p}=simSemis(idx);return estAdv(p,J);}
function caVideraitTout(idx){
  let{bc,p}=simSemis(idx);
  while(estAdv(p,J)&&bc[p]>=2&&bc[p]<=4){bc[p]=0;p=prec(p);}
  return bc.slice(J==="SUD"?0:7,J==="SUD"?7:14).every(v=>v===0);
}

function chkF(){
  if(SC.sud>=40||SC.nord>=40)return fin(`${SC.sud>=40?NJ.sud:NJ.nord} remporte la partie !`);
  if(B.reduce((a,b)=>a+b,0)<10){
    for(let i=0;i<7;i++){SC.nord+=B[i];SC.sud+=B[i+7];B[i]=B[i+7]=0;}
    majSC();
    return fin(SC.sud>SC.nord?NJ.sud+" gagne !":SC.nord>SC.sud?NJ.nord+" gagne !":"Match nul !");
  }
  return false;
}
function fin(t){
  FI=true;setText("inf-e","Terminé");
  [["rns",NJ.sud],["rnn",NJ.nord],["rvs",SC.sud],["rvn",SC.nord],["mfin",t]]
    .forEach(([id,v])=>setText(id,v));
  $("fin").classList.add("v");return true;
}

function draw(){
  const rn=$("rn"),rs=$("rs");rn.innerHTML="";rs.innerHTML="";
  for(let i=0;i<=6;i++)rn.appendChild(mk(i,J==="NORD"&&!FI,"N"+(i+1)));
  for(let i=7;i<=13;i++)rs.appendChild(mk(i,J==="SUD"&&!FI,"S"+(i-6)));
}
function mk(idx,jouable,label){
  const nb=B[idx];
  const div=Object.assign(document.createElement("div"),{
    className:"case"+(nb===0?" vide":"")+(jouable?" jouable":"")
  });
  if(nb>0){
    const w=document.createElement("div");w.className="billes";
    if(nb<=15){for(let k=0;k<nb;k++){const b=document.createElement("div");b.className="bille";w.appendChild(b);}}
    else{const c=document.createElement("div");c.className="nb";c.textContent=nb;w.appendChild(c);}
    div.appendChild(w);
    if(jouable)div.onclick=()=>jouer(idx);
  }
  const num=document.createElement("div");num.className="num";
  num.textContent=`${label}(${nb})`;div.appendChild(num);
  return div;
}
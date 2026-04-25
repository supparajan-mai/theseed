import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, CheckSquare, Image, Store, User, Plus, Leaf, X, Upload, Download, Pause, Trophy, RotateCcw, Trash2, Sparkles } from 'lucide-react';
import './styles.css';

const LS = 'the-seed-chibi-v1';
const avatarList = [
  { id:'female-01', label:'นักปลูกฝัน', src:'/assets/avatars/female-01.png' },
  { id:'female-02', label:'สายละมุน', src:'/assets/avatars/female-02.png' },
  { id:'female-03', label:'สดใส', src:'/assets/avatars/female-03.png' },
  { id:'male-01', label:'ใจเย็น', src:'/assets/avatars/male-01.png' },
  { id:'male-02', label:'นักวางแผน', src:'/assets/avatars/male-02.png' },
  { id:'male-03', label:'นักลุย', src:'/assets/avatars/male-03.png' },
];
const templates = ['สุขภาพ','การเงิน','การเรียนรู้','ธุรกิจ / อาชีพ','ความสัมพันธ์','Custom'];
const freqMap = { daily:1, weekly:5, monthly:20, quarterly:50, custom:3 };
const freqLabel = { daily:'Daily', weekly:'Weekly', monthly:'Monthly', quarterly:'Quarterly', custom:'Custom' };
const encouragement = ['เก่งมากเลย 🌱','วันนี้เธอดูแลความฝันแล้ว','ค่อยๆ โตไปด้วยกันนะ','หนึ่งก้าวเล็กๆ ก็มีค่า','ความฝันยังมีชีวิตอยู่'];

function loadState(){ try { return JSON.parse(localStorage.getItem(LS)) || { avatar:null, dreams:[], tab:'home'} } catch { return {avatar:null,dreams:[],tab:'home'} } }
function saveState(s){ localStorage.setItem(LS, JSON.stringify(s)); }
function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
function today(){ return new Date().toISOString().slice(0,10); }
function daysBetween(start,end){ return Math.max(1, Math.ceil((new Date(end)-new Date(start))/(1000*60*60*24))+1); }
function plantStage(growth){ if(growth>=81) return 4; if(growth>=51) return 3; if(growth>=21) return 2; return 1; }

function App(){
  const [state,setState] = useState(loadState);
  const [wizard,setWizard] = useState(false);
  const [active,setActive] = useState(null);
  const [watering,setWatering] = useState(null);
  const [toast,setToast] = useState('');
  const commit = (next) => { setState(next); saveState(next); };
  const selectedAvatar = avatarList.find(a=>a.id===state.avatar) || avatarList[0];
  const dreams = state.dreams || [];
  const activeDreams = dreams.filter(d=>d.status==='active');
  const completedDreams = dreams.filter(d=>d.status==='completed');
  const pausedDreams = dreams.filter(d=>d.status==='paused');

  if(!state.avatar) return <Onboarding onPick={(id)=>commit({...state, avatar:id})}/>;

  const updateDream = (id, patch) => commit({...state, dreams:dreams.map(d=>d.id===id?{...d,...patch}:d)});
  const createDream = (dream) => { commit({...state, dreams:[...dreams,dream]}); setWizard(false); setToast('เพาะเมล็ดพันธุ์ความฝันแล้ว 🌱'); };
  const completeDream = (d) => updateDream(d.id, {status:'completed', completedAt:today(), growth:100});
  const pauseDream = (d) => { updateDream(d.id, {status:'paused', pausedAt:today()}); setActive(null); };
  const reviveDream = (d) => { updateDream(d.id, {status:'active', revivedAt:today()}); setToast('รื้อฟื้นความฝันแล้ว 🌱'); };
  const removeDream = (d) => { commit({...state, dreams:dreams.filter(x=>x.id!==d.id)}); };
  const waterTask = (dreamId, taskId) => {
    const d = dreams.find(x=>x.id===dreamId); if(!d) return;
    const t = d.tasks.find(x=>x.id===taskId); if(!t || t.doneDates?.includes(today())) return;
    const inc = freqMap[t.frequency] || Number(t.customGrowth) || 1;
    const nextTasks = d.tasks.map(x=>x.id===taskId?{...x, doneDates:[...(x.doneDates||[]), today()]}:x);
    const nextGrowth = Math.min(100, (d.growth||0)+inc);
    updateDream(d.id, {tasks:nextTasks, growth:nextGrowth, lastWatered:today()});
    setWatering({dream:{...d,growth:nextGrowth}, inc});
    if(nextGrowth>=100) setTimeout(()=>completeDream({...d,growth:nextGrowth}), 1200);
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='the-seed-data.json'; a.click();
  };
  const importData = (e) => {
    const f=e.target.files?.[0]; if(!f) return; const r=new FileReader();
    r.onload=()=>{ try{ const data=JSON.parse(r.result); commit(data); setToast('นำเข้าข้อมูลแล้ว'); }catch{ setToast('ไฟล์ไม่ถูกต้อง'); }}; r.readAsText(f);
  };

  return <div className="app-shell">
    <main className="phone">
      <GardenBackdrop />
      <TopBar avatar={selectedAvatar} onExport={exportData} onImport={importData}/>
      <AnimatePresence mode="wait">
        {state.tab==='home' && <HomeScreen key="home" dreams={activeDreams} avatar={selectedAvatar} onOpen={setActive} onPlant={()=>setWizard(true)} />}
        {state.tab==='tasks' && <TasksOverview key="tasks" dreams={activeDreams} onOpen={setActive} />}
        {state.tab==='gallery' && <Gallery key="gallery" completed={completedDreams} paused={pausedDreams} avatar={selectedAvatar} onRevive={reviveDream} onDelete={removeDream} />}
        {state.tab==='store' && <ComingSoon key="store" title="ร้านค้าเมล็ดพันธุ์" text="อนาคตจะมี skin, theme และ seed packet น่ารักๆ"/>}
        {state.tab==='profile' && <Profile key="profile" state={state} avatars={avatarList} onAvatar={(id)=>commit({...state, avatar:id})}/>}        
      </AnimatePresence>
      <BottomNav tab={state.tab} setTab={(tab)=>commit({...state,tab})}/>
      <AnimatePresence>{wizard && <PlantWizard onClose={()=>setWizard(false)} onCreate={createDream}/>}</AnimatePresence>
      <AnimatePresence>{active && <DreamModal dream={dreams.find(d=>d.id===active.id)||active} onClose={()=>setActive(null)} onWater={waterTask} onPause={pauseDream} onComplete={completeDream}/>}</AnimatePresence>
      <AnimatePresence>{watering && <WateringScene watering={watering} avatar={selectedAvatar} onClose={()=>setWatering(null)}/>}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} exit={{y:30,opacity:0}} onAnimationComplete={()=>setTimeout(()=>setToast(''),1400)}>{toast}</motion.div>}</AnimatePresence>
    </main>
  </div>
}

function GardenBackdrop(){ return <><div className="bg-img"/><div className="bg-warm"/></> }
function TopBar({avatar,onExport,onImport}){return <div className="topbar">
  <div className="profile-pill"><img src={avatar.src}/><div><b>Level 1</b><span>💧 1200</span></div></div>
  <div className="brand"><Leaf size={20}/>THE SEED</div>
  <div className="top-actions"><button onClick={onExport} title="Export"><Download size={18}/></button><label title="Import"><Upload size={18}/><input type="file" accept="application/json" onChange={onImport}/></label></div>
</div>}
function BottomNav({tab,setTab}){ const items=[['home',Home,'สวนของฉัน'],['tasks',CheckSquare,'ภารกิจ'],['gallery',Image,'แกลเลอรี่'],['store',Store,'ร้านค้า'],['profile',User,'โปรไฟล์']]; return <nav className="bottom-nav">{items.map(([id,Icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={24}/><span>{label}</span></button>)}</nav> }

function Onboarding({onPick}){ const [pick,setPick]=useState('female-01'); return <div className="app-shell"><main className="phone onboarding"><GardenBackdrop/><div className="onboard-card"><h1>🌱 THE SEED</h1><p>เลือกตัวแทนของคุณก่อนเริ่มปลูกความฝัน</p><div className="avatar-grid">{avatarList.map(a=><button key={a.id} onClick={()=>setPick(a.id)} className={pick===a.id?'picked':''}><img src={a.src}/><span>{a.label}</span></button>)}</div><button className="primary big" onClick={()=>onPick(pick)}><Leaf/> เข้าสู่สวนของฉัน</button></div></main></div> }

function HomeScreen({dreams,avatar,onOpen,onPlant}){ return <motion.section className="screen home-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
  <motion.img className="hero-avatar" src={avatar.src} animate={{y:[0,-5,0]}} transition={{duration:3, repeat:Infinity}}/>
  {dreams.length===0 ? <div className="empty-state"><h2>ยังไม่มีเมล็ดพันธุ์</h2><p>เริ่มจากความฝันเล็กๆ หนึ่งเรื่องก่อนก็พอ</p></div> : <div className="pot-row">{dreams.map(d=><PotCard key={d.id} dream={d} onClick={()=>onOpen(d)}/>)}</div>}
  <button className="plant-btn" onClick={onPlant}><Leaf/> เพาะเมล็ดพันธุ์ความฝัน</button>
</motion.section>}
function PotCard({dream,onClick,small=false}){ const st=plantStage(dream.growth||0); return <motion.button className={'pot-card '+(small?'small':'')} whileTap={{scale:.96}} onClick={onClick}><img src={`/assets/plants/stage-${st}.png`}/><b>{dream.name}</b><span>{dream.growth||0}%</span></motion.button> }
function TasksOverview({dreams,onOpen}){return <motion.section className="screen panel-list" initial={{x:30,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-30,opacity:0}}><h2>ภารกิจที่กำลังเติบโต</h2>{dreams.length===0?<p className="soft">ยังไม่มีภารกิจ active</p>:dreams.map(d=><button className="task-dream-row" onClick={()=>onOpen(d)} key={d.id}><img src={`/assets/plants/stage-${plantStage(d.growth)}.png`}/><div><b>{d.name}</b><span>{d.tasks.length} ภารกิจ • {d.growth}%</span></div><div className="progress"><i style={{width:`${d.growth}%`}}/></div></button>)}</motion.section>}
function Gallery({completed,paused,avatar,onRevive,onDelete}){ const [sel,setSel]=useState(null); return <motion.section className="screen gallery-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
  <h2>🌿 หอแห่งความสำเร็จ</h2><p className="soft">เลื่อนซ้าย–ขวาเพื่อชมสวนความสำเร็จ</p>
  <div className="hall"><div className="pots-scroll">{completed.length===0 && <div className="empty-gallery">เมื่อทำสำเร็จ กระถางจะมาอยู่ที่นี่</div>}{completed.map(d=><AchievementPot key={d.id} dream={d} onClick={()=>setSel(d)}/>)}</div><div className="hall-avatar"><img src={avatar.src}/><span>ภูมิใจมากเลย ✨</span></div></div>
  <div className="paused-zone"><h3>พักไว้ก่อน</h3>{paused.length===0?<p className="soft">ยังไม่มีกระถางพักไว้</p>:<div className="paused-scroll">{paused.map(d=><div className="paused-pot" key={d.id}><img src="/assets/plants/pot-empty.png"/><b>{d.name}</b><span>{d.growth}%</span><button onClick={()=>onRevive(d)}><RotateCcw size={14}/>รื้อฟื้น</button><button className="danger" onClick={()=>onDelete(d)}><Trash2 size={14}/>ลบ</button></div>)}</div>}</div>
  <AnimatePresence>{sel&&<AchievementModal dream={sel} onClose={()=>setSel(null)}/>}</AnimatePresence>
</motion.section>}
function AchievementPot({dream,onClick}){return <motion.button className="achievement-pot" onClick={onClick} whileHover={{y:-4}}><img src="/assets/plants/stage-4.png"/><b>{dream.name}</b><span>สำเร็จ {dream.completedAt||today()}</span></motion.button>}
function AchievementModal({dream,onClose}){return <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="modal achievement" initial={{scale:.9,y:20}} animate={{scale:1,y:0}} exit={{scale:.9,y:20}}><button className="close" onClick={onClose}><X/></button><Sparkles className="spark"/><img src="/assets/plants/stage-4.png"/><h2>{dream.name}</h2><p>เก่งมากเลย เธอทำได้แล้วนะ ความพยายามไม่สูญเปล่าเลย</p><dl><dt>วันที่สำเร็จ</dt><dd>{dream.completedAt}</dd><dt>ใช้เวลา</dt><dd>{daysBetween(dream.createdAt,dream.completedAt)} วัน</dd><dt>ความคืบหน้า</dt><dd>100%</dd></dl></motion.div></motion.div>}

function PlantWizard({onClose,onCreate}){ const [name,setName]=useState(''); const [template,setTemplate]=useState('สุขภาพ'); const [tasks,setTasks]=useState([{id:uid(),title:'',frequency:'daily'}]); const potential= Math.min(100, tasks.reduce((s,t)=>s+(freqMap[t.frequency]||1),0)*4); const add=()=>setTasks([...tasks,{id:uid(),title:'',frequency:'daily'}]); const change=(id,patch)=>setTasks(tasks.map(t=>t.id===id?{...t,...patch}:t)); const submit=()=>{ if(!name.trim()) return; const clean=tasks.filter(t=>t.title.trim()).map(t=>({...t,doneDates:[]})); onCreate({id:uid(),name:name.trim(),template,status:'active',createdAt:today(),growth:0,tasks:clean.length?clean:[{id:uid(),title:'เริ่มลงมือ 10 นาที',frequency:'daily',doneDates:[]}]})}; return <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="modal wizard" initial={{y:80}} animate={{y:0}} exit={{y:80}}><button className="close" onClick={onClose}><X/></button><h2>เพาะเมล็ดพันธุ์ความฝัน</h2><label>ชื่อความฝัน<input value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น เก็บเงิน 10,000 บาท"/></label><label>Seed Packet<select value={template} onChange={e=>setTemplate(e.target.value)}>{templates.map(t=><option key={t}>{t}</option>)}</select></label><div className="task-editor"><b>กิจกรรมย่อย</b>{tasks.map(t=><div className="task-edit" key={t.id}><input value={t.title} onChange={e=>change(t.id,{title:e.target.value})} placeholder="เช่น เดิน 20 นาที"/><select value={t.frequency} onChange={e=>change(t.id,{frequency:e.target.value})}>{Object.entries(freqLabel).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></div>)}<button className="ghost" onClick={add}><Plus/> เพิ่มกิจกรรม</button></div><div className="gauge"><span>{potential}%</span><p>ศักยภาพของแผนงาน</p></div><button className="primary big" onClick={submit}><Leaf/> ปลูกเลย</button></motion.div></motion.div> }
function DreamModal({dream,onClose,onWater,onPause,onComplete}){return <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="modal dream" initial={{y:80}} animate={{y:0}} exit={{y:80}}><button className="close" onClick={onClose}><X/></button><div className="dream-head"><img src={`/assets/plants/stage-${plantStage(dream.growth)}.png`}/><div><h2>{dream.name}</h2><div className="bar"><i style={{width:`${dream.growth||0}%`}}/></div><span>{dream.growth||0}% เติบโตแล้ว</span></div></div><h3>ภารกิจวันนี้</h3>{dream.tasks.map(t=>{const done=t.doneDates?.includes(today()); return <button className={'check-row '+(done?'done':'')} key={t.id} onClick={()=>!done&&onWater(dream.id,t.id)}><span>{done?'✅':'⬜'}</span><b>{t.title}</b><em>{freqLabel[t.frequency]}</em></button>})}<div className="modal-actions"><button className="ghost" onClick={()=>onPause(dream)}><Pause/> พักไว้ก่อน</button><button className="primary" onClick={()=>onComplete(dream)}><Trophy/> สำเร็จความฝัน</button></div></motion.div></motion.div>}
function WateringScene({watering,onClose}){ const msg=useMemo(()=>encouragement[Math.floor(Math.random()*encouragement.length)],[]); return <motion.div className="watering-full" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}><img className="watering-img" src="/assets/scenes/watering-static.png"/><motion.div className="plus-one" initial={{y:20,opacity:0,scale:.6}} animate={{y:-20,opacity:1,scale:1.2}} transition={{duration:.5}}>+{watering.inc}%</motion.div><motion.div className="sparkles" animate={{scale:[.8,1.3,.8], rotate:[0,10,0]}} transition={{duration:1.2, repeat:Infinity}}>✨ ✨</motion.div><div className="water-caption">{msg}<br/><small>แตะเพื่อกลับสู่สวน</small></div></motion.div> }
function ComingSoon({title,text}){ return <motion.section className="screen panel-list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><h2>{title}</h2><div className="empty-state"><img src="/assets/icons/favicon-pot.png"/><p>{text}</p></div></motion.section> }
function Profile({state,avatars,onAvatar}){return <motion.section className="screen panel-list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><h2>โปรไฟล์</h2><p className="soft">เปลี่ยนตัวแทนของคุณได้ตลอด</p><div className="avatar-grid mini">{avatars.map(a=><button key={a.id} onClick={()=>onAvatar(a.id)} className={state.avatar===a.id?'picked':''}><img src={a.src}/><span>{a.label}</span></button>)}</div></motion.section>}

createRoot(document.getElementById('root')).render(<App/>);

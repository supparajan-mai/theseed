import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, CheckSquare, Image, Store, User, Plus, X, Download, Upload, RotateCcw, Pause, Trophy, Leaf, ArrowLeft, Settings } from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'THE_SEED_FINAL_V1';
const growthMap = { daily: 1, weekly: 5, monthly: 20, quarterly: 50, custom: 3 };
const freqLabel = { daily: 'รายวัน', weekly: 'รายสัปดาห์', monthly: 'รายเดือน', quarterly: 'รายไตรมาส', custom: 'กำหนดเอง' };

const avatars = [
  { id:'f1', gender:'หญิง', hair:'#6b432d', outfit:'#60734b', label:'นักปลูกฝัน' },
  { id:'f2', gender:'หญิง', hair:'#282420', outfit:'#eecf9f', label:'นักวางแผน' },
  { id:'f3', gender:'หญิง', hair:'#9b6843', outfit:'#c68d5a', label:'นักสร้างสรรค์' },
  { id:'m1', gender:'ชาย', hair:'#20242b', outfit:'#3f4650', label:'นักลุย' },
  { id:'m2', gender:'ชาย', hair:'#5b3b2a', outfit:'#6b7350', label:'นักเรียนรู้' },
  { id:'m3', gender:'ชาย', hair:'#8a5a38', outfit:'#5a6b45', label:'นักเติบโต' },
];

const templates = [
  { id:'health', name:'สุขภาพ', icon:'💪', tasks:[['ดื่มน้ำ 2 ลิตร','daily'],['เดิน 20 นาที','daily'],['ชั่งน้ำหนัก','weekly']] },
  { id:'money', name:'การเงิน', icon:'🪙', tasks:[['ออมเงิน','daily'],['สรุปรายรับรายจ่าย','weekly'],['ทบทวนเป้าหมายเงิน','monthly']] },
  { id:'study', name:'การเรียนรู้', icon:'📚', tasks:[['อ่าน/เรียน 30 นาที','daily'],['สรุปโน้ต','weekly'],['ทำโปรเจกต์ย่อย','monthly']] },
  { id:'work', name:'ธุรกิจ / อาชีพ', icon:'💼', tasks:[['ทำงานสำคัญ 1 อย่าง','daily'],['อัปเดตแผน','weekly'],['ทบทวนผลลัพธ์','monthly']] }
];

const seedState = () => ({ avatarId:null, water:1200, level:1, dreams:[], selectedId:null });
const uid = () => Math.random().toString(36).slice(2,10);
const today = () => new Date().toISOString().slice(0,10);
const daysBetween = (a,b) => Math.max(1, Math.ceil((new Date(b)-new Date(a))/(1000*60*60*24)) || 1);

function useSeedStore(){
  const [state,setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedState(); }
    catch { return seedState(); }
  });
  const save = (updater) => setState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
  return [state, save];
}

function App(){
  const [state, save] = useSeedStore();
  const [tab,setTab] = useState('home');
  const [wizard,setWizard] = useState(false);
  const [watering,setWatering] = useState(null);
  const [detail,setDetail] = useState(null);
  const avatar = avatars.find(a=>a.id===state.avatarId) || avatars[0];
  const selected = state.dreams.find(d=>d.id===state.selectedId) || state.dreams.find(d=>d.status==='active');

  const chooseAvatar = (id) => save(s=>({...s, avatarId:id}));
  const addDream = (dream) => save(s=>({...s, dreams:[...s.dreams,dream], selectedId:dream.id}));
  const updateDream = (id, patch) => save(s=>({...s, dreams:s.dreams.map(d=>d.id===id?{...d,...patch}:d)}));
  const waterTask = (dreamId, taskId) => {
    let pop = null;
    save(s=>({ ...s, dreams:s.dreams.map(d=>{
      if(d.id!==dreamId) return d;
      const tasks = d.tasks.map(t=>t.id===taskId?{...t, done:true, doneAt:today()}:t);
      const inc = growthMap[tasks.find(t=>t.id===taskId)?.freq || 'daily'];
      const growth = Math.min(100, d.growth + inc);
      const status = growth>=100 ? 'completed' : d.status;
      pop = {...d, tasks, growth, status, inc, completedAt: growth>=100 ? today() : d.completedAt};
      return {...pop};
    }) }));
    setWatering(pop);
  };
  const completeDream = (id) => updateDream(id,{status:'completed', growth:100, completedAt:today()});
  const pauseDream = (id) => updateDream(id,{status:'paused', pausedAt:today()});
  const reviveDream = (id) => updateDream(id,{status:'active', revivedAt:today()});

  if(!state.avatarId) return <AvatarSelect onChoose={chooseAvatar}/>;

  return <div className="app-shell">
    <div className="phone">
      {tab==='home' && <HomeScreen state={state} avatar={avatar} onPlant={()=>setWizard(true)} onOpen={(id)=>{save(s=>({...s,selectedId:id}));setTab('tasks')}} onDetail={setDetail}/>} 
      {tab==='tasks' && <TaskScreen dream={selected} avatar={avatar} onBack={()=>setTab('home')} onWater={waterTask} onComplete={completeDream} onPause={pauseDream}/>} 
      {tab==='gallery' && <GalleryScreen dreams={state.dreams} avatar={avatar} onDetail={setDetail} onRevive={reviveDream}/>} 
      {tab==='store' && <ComingSoon title="ร้านค้าเมล็ดพันธุ์" sub="Seed Store จะมาในเฟสถัดไป"/>}
      {tab==='profile' && <ProfileScreen state={state} save={save}/>} 
      <BottomNav tab={tab} setTab={setTab}/>
      {wizard && <PlantWizard onClose={()=>setWizard(false)} onCreate={(d)=>{addDream(d); setWizard(false);}}/>}
      {watering && <WateringPopup dream={watering} avatar={avatar} onClose={()=>setWatering(null)}/>} 
      {detail && <DreamDetail dream={detail} onClose={()=>setDetail(null)} onRevive={reviveDream}/>} 
    </div>
  </div>;
}

function AvatarSelect({onChoose}){ return <div className="app-shell"><div className="phone intro">
  <GardenArt soft />
  <div className="intro-card"><h1>🌱 THE SEED</h1><p>เลือกตัวแทนของคุณ แล้วเริ่มปลูกความฝันทีละวัน</p></div>
  <div className="avatar-grid">{avatars.map(a=><button key={a.id} className="avatar-card" onClick={()=>onChoose(a.id)}><Avatar art={a} pose="stand"/><b>{a.label}</b><small>{a.gender}</small></button>)}</div>
</div></div>}

function TopBar({state, avatar}){ return <div className="topbar"><div className="profile-pill"><Avatar art={avatar} pose="head"/><div><b>Level {state.level||1}</b><span>💧 {state.water||1200}</span></div></div><div className="brand-pill"><Leaf size={18}/> THE SEED</div><button className="round"><Settings size={22}/></button></div> }

function HomeScreen({state, avatar, onPlant, onOpen, onDetail}){
 const active = state.dreams.filter(d=>d.status==='active');
 const paused = state.dreams.filter(d=>d.status==='paused');
 return <main className="screen garden-screen"><GardenArt/><TopBar state={state} avatar={avatar}/><div className="garden-center"><Avatar art={avatar} pose="stand"/><Birds/></div>
  <div className="pot-row">{active.map(d=><PotCard key={d.id} dream={d} onClick={()=>onOpen(d.id)} onInfo={()=>onDetail(d)}/>)}{paused.map(d=><PotCard key={d.id} dream={d} paused onClick={()=>onDetail(d)}/>)}<button className="empty-pot" onClick={onPlant}><Plus/> </button></div>
  <button className="plant-cta" onClick={onPlant}><Leaf/> เพาะเมล็ดพันธุ์ความฝัน</button>
 </main>
}

function PotCard({dream,onClick,onInfo,paused}){ return <button className={'pot-card '+(paused?'paused':'')} onClick={onClick} onContextMenu={(e)=>{e.preventDefault();onInfo?.()}}><Plant growth={dream.growth} paused={paused}/><span>{dream.name}</span><b>{dream.growth}%</b></button> }

function PlantWizard({onClose,onCreate}){
 const [step,setStep]=useState(1), [name,setName]=useState(''), [template,setTemplate]=useState(null), [tasks,setTasks]=useState([]), [task,setTask]=useState(''), [freq,setFreq]=useState('daily'), [customDays,setCustomDays]=useState(3);
 const potential = Math.min(100, tasks.reduce((s,t)=>s+(growthMap[t.freq]||3),0));
 const useTemplate=(t)=>{setTemplate(t.id);setTasks(t.tasks.map(([title,freq])=>({id:uid(),title,freq,customDays:null,done:false})));};
 const addTask=()=>{ if(!task.trim()) return; setTasks([...tasks,{id:uid(),title:task.trim(),freq,customDays:freq==='custom'?customDays:null,done:false}]); setTask(''); };
 const create=()=>{ if(!name.trim()||!tasks.length) return; onCreate({ id:uid(), name:name.trim(), template, tasks, growth:0, status:'active', createdAt:today(), completedAt:null, potX:0 }); };
 return <div className="modal"><div className="sheet"><button className="close" onClick={onClose}><X/></button><h2>เพาะเมล็ดพันธุ์ความฝัน</h2>
  <div className="steps"><span className={step===1?'on':''}>1</span><span className={step===2?'on':''}>2</span><span className={step===3?'on':''}>3</span></div>
  {step===1&&<><label>ชื่อความฝันของคุณ</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น เก็บเงิน 10,000 บาท"/><p className="hint">เลือกเทมเพลต หรือเริ่มเองได้เลย</p><div className="template-grid">{templates.map(t=><button className={template===t.id?'selected':''} onClick={()=>useTemplate(t)} key={t.id}><span>{t.icon}</span>{t.name}</button>)}</div><button className="primary" disabled={!name.trim()} onClick={()=>setStep(2)}>ถัดไป</button></>}
  {step===2&&<><label>กิจกรรมย่อย</label><div className="task-add"><input value={task} onChange={e=>setTask(e.target.value)} placeholder="เพิ่มกิจกรรม"/><select value={freq} onChange={e=>setFreq(e.target.value)}>{Object.entries(freqLabel).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></div>{freq==='custom'&&<input type="number" min="1" value={customDays} onChange={e=>setCustomDays(+e.target.value)} placeholder="ทุกกี่วัน"/>}<button className="ghost" onClick={addTask}>+ เพิ่มกิจกรรม</button><div className="task-list mini">{tasks.map(t=><div key={t.id}><span>{t.title}</span><small>{freqLabel[t.freq]}{t.freq==='custom'?` / ${t.customDays} วัน`:''}</small></div>)}</div><div className="gauge"><i style={{'--p':potential}}></i><b>{potential}%</b><span>ศักยภาพของแผน</span></div><button className="primary" disabled={!tasks.length} onClick={()=>setStep(3)}>ถัดไป</button></>}
  {step===3&&<><div className="summary"><Plant growth={0}/><h3>{name}</h3><p>{tasks.length} กิจกรรม • ศักยภาพ {potential}%</p></div><button className="primary" onClick={create}>ปลูกเลย 🌱</button></>}
 </div></div>
}

function TaskScreen({dream, avatar, onBack, onWater, onComplete, onPause}){
 if(!dream) return <ComingSoon title="ยังไม่มีความฝัน" sub="กลับไปเพาะเมล็ดพันธุ์ก่อนนะ"/>;
 const remaining = dream.tasks.filter(t=>!t.done);
 return <main className="screen task-screen"><GardenArt soft/><header className="task-head"><button className="icon-btn" onClick={onBack}><ArrowLeft/></button><div><h2>{dream.name}</h2><p>{dream.growth}% เติบโตแล้ว</p></div></header><div className="focus-pot"><Plant growth={dream.growth}/><div className="progress"><span style={{width:`${dream.growth}%`}}/></div></div><section className="task-panel"><h3>ภารกิจย่อย</h3>{dream.tasks.map(t=><label className="check-row" key={t.id}><input type="checkbox" checked={t.done} disabled={t.done||dream.status!=='active'} onChange={()=>onWater(dream.id,t.id)}/><span>{t.title}</span><small>{freqLabel[t.freq]}</small></label>)}{dream.status==='active'&&<div className="actions"><button className="ghost" onClick={()=>onPause(dream.id)}><Pause size={16}/> พักไว้ก่อน</button><button className="primary" onClick={()=>onComplete(dream.id)}><Trophy size={16}/> สำเร็จความฝัน</button></div>}{!remaining.length&&dream.status==='completed'&&<p className="success-note">เยี่ยมมาก ความฝันนี้เข้าสู่ Hall of Fame แล้ว</p>}</section></main>
}

function WateringPopup({dream, avatar, onClose}){ return <div className="modal"><div className="watering-card"><GardenArt soft/><div className="watering-scene"><Avatar art={avatar} pose="water"/><Plant growth={dream.growth}/><WaterDrops/><div className="sparkles">✨ ✨ ✨</div><div className="plus">+{dream.inc||1}%</div></div><div className="progress wide"><span style={{width:`${dream.growth}%`}}/></div><button className="primary" onClick={onClose}>ดูต้นไม้ต่อ 🌿</button></div></div> }

function GalleryScreen({dreams, avatar, onDetail, onRevive}){
 const completed = dreams.filter(d=>d.status==='completed');
 const paused = dreams.filter(d=>d.status==='paused');
 return <main className="screen gallery-screen"><GardenArt soft/><header className="gallery-head"><h2>🌿 หอแห่งความสำเร็จ</h2><p>HALL OF FAME</p></header><div className="hall-scroll"><div className="hall-track">{completed.map(d=><AchievementPot key={d.id} dream={d} onClick={()=>onDetail(d)}/>)}<div className="hall-avatar"><Avatar art={avatar} pose="sit"/><b>เก่งมากเลย!</b><span>คุณทำสำเร็จแล้ว {completed.length} ความฝัน</span></div>{completed.length===0&&<div className="empty-hall">ยังไม่มีต้นไม้แห่งความสำเร็จ<br/>ปลูกความฝันแรกแล้วค่อยๆ ดูแลนะ</div>}</div></div>{paused.length>0&&<section className="paused-section"><h3>พักไว้ก่อน — รื้อฟื้นได้เสมอ</h3><div className="paused-row">{paused.map(d=><button key={d.id} onClick={()=>onDetail(d)}><Plant growth={d.growth} paused/><span>{d.name}</span><small>แตะเพื่อรื้อฟื้น</small></button>)}</div></section>}</main>
}

function AchievementPot({dream,onClick}){ return <button className="achievement" onClick={onClick}><Plant growth={100}/><b>{dream.name}</b><small>สำเร็จเมื่อ {dream.completedAt}</small></button> }

function DreamDetail({dream,onClose,onRevive}){ const doneDays = dream.completedAt ? daysBetween(dream.createdAt,dream.completedAt) : daysBetween(dream.createdAt,today()); return <div className="modal"><div className="detail-card"><button className="close" onClick={onClose}><X/></button><Plant growth={dream.growth} paused={dream.status==='paused'}/><h2>{dream.name}</h2><p>{dream.status==='completed'?'เก่งมากเลย ความพยายามของคุณไม่สูญเปล่าเลย':dream.status==='paused'?'พักไว้ก่อน ไม่ได้แปลว่าแพ้ เริ่มใหม่ได้เสมอ':'กำลังเติบโตทีละนิด'}</p><dl><div><dt>สถานะ</dt><dd>{dream.status==='completed'?'สำเร็จแล้ว':dream.status==='paused'?'พักไว้ก่อน':'กำลังเติบโต'}</dd></div><div><dt>วันที่เริ่ม</dt><dd>{dream.createdAt}</dd></div><div><dt>ใช้เวลา</dt><dd>{doneDays} วัน</dd></div><div><dt>ความคืบหน้า</dt><dd>{dream.growth}%</dd></div></dl>{dream.status==='paused'&&<button className="primary" onClick={()=>{onRevive(dream.id);onClose();}}><RotateCcw size={16}/> รื้อฟื้นความฝัน</button>}</div></div> }

function ProfileScreen({state, save}){ const fileRef = useRef(); const exportData=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='the-seed-data.json'; a.click();}; const importData=(e)=>{const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{try{const data=JSON.parse(r.result); localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); location.reload();}catch{alert('ไฟล์ไม่ถูกต้อง')}}; r.readAsText(f);}; return <main className="screen profile-screen"><GardenArt soft/><div className="profile-card"><h2>โปรไฟล์</h2><p>ข้อมูลทั้งหมดอยู่ในเครื่องของคุณเท่านั้น</p><button className="primary" onClick={exportData}><Download size={16}/> Export JSON</button><button className="ghost" onClick={()=>fileRef.current.click()}><Upload size={16}/> Import JSON</button><input ref={fileRef} type="file" accept=".json" hidden onChange={importData}/><button className="danger" onClick={()=>{if(confirm('ลบข้อมูลทั้งหมด?')){localStorage.removeItem(STORAGE_KEY);location.reload();}}}>รีเซ็ตข้อมูล</button></div></main> }

function ComingSoon({title,sub}){ return <main className="screen"><GardenArt soft/><div className="center-card"><h2>{title}</h2><p>{sub}</p></div></main> }
function BottomNav({tab,setTab}){ const items=[['home',Home,'สวนของฉัน'],['tasks',CheckSquare,'ภารกิจ'],['gallery',Image,'แกลเลอรี่'],['store',Store,'ร้านค้า'],['profile',User,'โปรไฟล์']]; return <nav className="bottom-nav">{items.map(([id,Icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon/><span>{label}</span></button>)}</nav> }

function GardenArt({soft=false}){ return <div className={'garden-art '+(soft?'soft':'')}><div className="sun"/><div className="tree"><span/><i/></div><div className="bench"/><div className="path"/><div className="flowers f1">✿ ✿</div><div className="flowers f2">✿ ✿ ✿</div><div className="bird b1">🐦</div><div className="bird b2">🐤</div><div className="lights">✦ ✦ ✦</div></div> }
function Birds(){ return <><span className="floating-bird">🐦</span><span className="floating-leaf">🍃</span></> }

function Avatar({art, pose}){ const sit=pose==='sit', water=pose==='water', head=pose==='head'; return <svg className={'avatar avatar-'+pose} viewBox="0 0 120 150" aria-hidden="true"><ellipse cx="60" cy="140" rx="34" ry="7" fill="rgba(72,55,42,.18)"/>{!head&&<g className="body" transform={sit?'translate(0,18)':''}><path d="M40 82 Q60 68 80 82 L86 122 Q60 136 34 122 Z" fill={art.outfit}/><path d="M43 82 L35 112" stroke="#f5dfc4" strokeWidth="12" strokeLinecap="round"/><path d="M77 82 L88 112" stroke="#f5dfc4" strokeWidth="12" strokeLinecap="round"/>{water&&<g transform="translate(69 92) rotate(-18)"><ellipse cx="10" cy="10" rx="18" ry="13" fill="#c9d0cd" stroke="#69736d" strokeWidth="3"/><path d="M27 9 C43 5 46 9 35 17" fill="none" stroke="#69736d" strokeWidth="4"/><path d="M-8 6 C-22 2 -25 12 -12 15" fill="none" stroke="#69736d" strokeWidth="4"/></g>}<path d="M47 121 Q60 132 73 121" fill="none" stroke="#4b3528" strokeWidth="10" strokeLinecap="round"/></g>}<g className="head" transform={head?'translate(0,18) scale(1.05)':''}><circle cx="60" cy="54" r="33" fill="#ffd9bd"/><path d="M28 54 Q34 15 62 19 Q91 20 93 58 Q78 38 59 38 Q43 38 28 54" fill={art.hair}/><path d="M35 48 Q38 25 62 28 Q82 29 87 49 Q70 38 55 39 Q43 40 35 48" fill={art.hair}/>{art.id==='f1'&&<circle cx="73" cy="20" r="15" fill={art.hair}/>}<circle cx="48" cy="59" r="5" fill="#33251e"/><circle cx="72" cy="59" r="5" fill="#33251e"/><path d="M51 75 Q60 82 70 75" fill="none" stroke="#8b4e3b" strokeWidth="3" strokeLinecap="round"/><circle cx="38" cy="69" r="5" fill="#f3a58e" opacity=".55"/><circle cx="82" cy="69" r="5" fill="#f3a58e" opacity=".55"/><text x="78" y="34" fontSize="15">✿</text></g>{sit&&<path d="M35 120 Q60 145 85 120" fill="none" stroke={art.outfit} strokeWidth="16" strokeLinecap="round"/>}</svg> }

function Plant({growth, paused=false}){ const stage = growth>=81?4:growth>=51?3:growth>=21?2:1; return <svg className={'plant stage-'+stage+' '+(paused?'plant-paused':'')} viewBox="0 0 150 150"><ellipse cx="75" cy="137" rx="42" ry="8" fill="rgba(75,47,31,.18)"/><path d="M35 76 H115 L105 135 H45 Z" fill="#c87943" stroke="#8f4f2b" strokeWidth="4"/><ellipse cx="75" cy="77" rx="42" ry="13" fill="#b86638" stroke="#8f4f2b" strokeWidth="4"/><ellipse cx="75" cy="75" rx="30" ry="8" fill="#4a3425"/>{stage===1&&<><circle cx="67" cy="70" r="7" fill="#c58d58"/><circle cx="82" cy="69" r="6" fill="#d3a16c"/></>}{stage>=2&&<g stroke="#557446" strokeWidth="5" strokeLinecap="round"><path d="M75 72 V35"/><path d="M75 49 C55 35 50 29 43 23"/><path d="M75 48 C94 34 101 30 109 22"/></g>}{stage>=2&&<><ellipse cx="49" cy="29" rx="18" ry="9" fill="#80a85a" transform="rotate(31 49 29)"/><ellipse cx="101" cy="29" rx="18" ry="9" fill="#8db663" transform="rotate(-31 101 29)"/></>}{stage>=3&&<><path d="M75 56 C57 51 46 49 36 44" stroke="#557446" strokeWidth="4"/><path d="M75 58 C94 52 103 49 116 42" stroke="#557446" strokeWidth="4"/><ellipse cx="38" cy="43" rx="14" ry="8" fill="#83ad61" transform="rotate(20 38 43)"/><ellipse cx="114" cy="42" rx="14" ry="8" fill="#83ad61" transform="rotate(-25 114 42)"/></>}{stage>=4&&<><text x="38" y="30" fontSize="18">✿</text><text x="93" y="25" fontSize="18">✿</text><circle cx="102" cy="48" r="8" fill="#d8653d"/><text x="23" y="55" fontSize="15">✨</text><text x="112" y="60" fontSize="15">✨</text></>}</svg> }
function WaterDrops(){ return <div className="drops"><span/> <span/> <span/> <span/> <span/></div> }

createRoot(document.getElementById('root')).render(<App/>);

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Download, Upload, Plus, Leaf, Sprout, CheckCircle2, X, RotateCcw, Droplets, Sparkles } from 'lucide-react';
import './styles.css';

const GROWTH = { Daily: 1, Weekly: 5, Monthly: 20, Quarterly: 50, Custom: 3 };
const DEFAULT_POSITIONS = [
  { x: 24, y: 430 }, { x: 172, y: 405 }, { x: 318, y: 430 }, { x: 92, y: 550 }, { x: 250, y: 555 }
];

const avatars = [
  { id: 'girl-garden', gender: 'ผู้หญิง', name: 'ไหมสวนฝัน', hair: 'bun', clothes: '#566b45', accent: '#f6c8a8' },
  { id: 'girl-book', gender: 'ผู้หญิง', name: 'น้องนักอ่าน', hair: 'long', clothes: '#8f6f4e', accent: '#eecfb6' },
  { id: 'girl-sun', gender: 'ผู้หญิง', name: 'สาวแดดอุ่น', hair: 'wave', clothes: '#c89057', accent: '#f3d17e' },
  { id: 'boy-calm', gender: 'ผู้ชาย', name: 'คุณใจนิ่ง', hair: 'short', clothes: '#344150', accent: '#b7c6d9' },
  { id: 'boy-plan', gender: 'ผู้ชาย', name: 'นักวางแผน', hair: 'soft', clothes: '#6d7256', accent: '#e8d5b5' },
  { id: 'boy-forest', gender: 'ผู้ชาย', name: 'เพื่อนในป่า', hair: 'curl', clothes: '#536b47', accent: '#d1b08a' }
];

const templates = [
  { id: 'health', label: 'สุขภาพ', emoji: '💪', tasks: ['เดิน 15 นาที', 'ดื่มน้ำ 2 ลิตร', 'นอนก่อน 5 ทุ่ม'] },
  { id: 'money', label: 'การเงิน', emoji: '🪙', tasks: ['บันทึกรายจ่าย', 'ออมเงิน 100 บาท', 'ทบทวนเป้าหมายรายสัปดาห์'] },
  { id: 'learning', label: 'การเรียนรู้', emoji: '📚', tasks: ['อ่านหนังสือ 20 หน้า', 'เรียนออนไลน์ 30 นาที', 'จดสรุป 1 หน้า'] },
  { id: 'business', label: 'ธุรกิจ / อาชีพ', emoji: '💼', tasks: ['ทำคอนเทนต์ 1 ชิ้น', 'ติดต่อลูกค้า', 'สรุปยอดประจำสัปดาห์'] }
];

function uid() { return Math.random().toString(36).slice(2, 10); }

function Avatar({ avatar, size = 160, watering = false }) {
  const hairShape = {
    bun: <><circle cx="105" cy="35" r="24" fill="#6b452d"/><circle cx="112" cy="30" r="8" fill="#92a66a"/></>,
    long: <path d="M45 75 C35 130 48 158 80 164 C120 160 132 128 119 74 Z" fill="#3f332b"/> ,
    wave: <path d="M38 82 C26 136 56 166 82 154 C118 174 139 130 119 75 Z" fill="#7a4a2f"/> ,
    short: <path d="M42 70 C50 36 112 32 124 70 C103 54 70 54 42 70Z" fill="#24262a"/> ,
    soft: <path d="M40 70 C55 32 112 38 124 74 C103 50 70 56 40 70Z" fill="#4d3122"/> ,
    curl: <path d="M42 68 C44 35 111 35 124 72 C108 60 93 58 78 65 C66 56 52 58 42 68Z" fill="#735135"/>
  }[avatar.hair];
  return (
    <svg viewBox="0 0 160 190" width={size} height={size * 1.18} className="avatar-svg">
      <ellipse cx="80" cy="178" rx="42" ry="9" fill="rgba(70,50,30,.16)" />
      {hairShape}
      <circle cx="80" cy="76" r="39" fill="#ffdcbf" stroke="#8b6248" strokeWidth="2"/>
      <path d="M43 70 C50 28 113 25 124 70 C92 53 68 56 43 70Z" fill={avatar.hair === 'short' ? '#25272b' : avatar.hair === 'long' ? '#3f332b' : avatar.hair === 'wave' ? '#7a4a2f' : avatar.hair === 'curl' ? '#735135' : '#6b452d'} />
      <circle cx="64" cy="78" r="6" fill="#3f2f28"/><circle cx="96" cy="78" r="6" fill="#3f2f28"/>
      <circle cx="53" cy="88" r="6" fill="#f6a995" opacity=".55"/><circle cx="107" cy="88" r="6" fill="#f6a995" opacity=".55"/>
      <path d="M70 96 Q80 104 91 96" fill="none" stroke="#6b4a3a" strokeWidth="3" strokeLinecap="round"/>
      <path d="M52 117 Q80 101 108 117 L116 168 Q80 181 44 168Z" fill={avatar.clothes}/>
      <path d="M60 118 L48 153" stroke="#f6ead8" strokeWidth="12" strokeLinecap="round"/>
      <path d="M100 118 L112 153" stroke="#f6ead8" strokeWidth="12" strokeLinecap="round"/>
      <path d="M64 170 L61 185 M96 170 L99 185" stroke="#4f3528" strokeWidth="8" strokeLinecap="round"/>
      {watering && <g className="can-group"><ellipse cx="118" cy="138" rx="22" ry="15" fill="#b8bec0" stroke="#6f7778" strokeWidth="3"/><path d="M136 133 L154 126" stroke="#6f7778" strokeWidth="8" strokeLinecap="round"/><circle cx="157" cy="125" r="7" fill="#9ea6a8"/><path d="M112 122 Q135 111 139 135" fill="none" stroke="#6f7778" strokeWidth="5"/><path d="M149 134 C157 146 156 160 147 170" stroke="#6bbbd2" strokeWidth="3" strokeDasharray="4 6" strokeLinecap="round"/></g>}
      <circle cx="80" cy="20" r="8" fill={avatar.accent} opacity=".7"/>
    </svg>
  );
}

function Pot({ tree, selected, onPointerDown, onClick }) {
  const controls = useDragControls();
  const stage = tree.growth < 21 ? 'seed' : tree.growth < 51 ? 'sprout' : tree.growth < 81 ? 'branch' : 'bloom';
  const progress = Math.min(100, tree.growth);
  return (
    <motion.div
      className={`pot-card ${selected ? 'selected' : ''} ${tree.wilted ? 'wilted' : ''}`}
      drag
      dragMomentum={false}
      dragControls={controls}
      dragListener={false}
      initial={{ x: tree.position.x, y: tree.position.y, scale: .8, opacity: 0 }}
      animate={{ x: tree.position.x, y: tree.position.y, scale: 1, opacity: 1 }}
      whileDrag={{ scale: 1.06, zIndex: 20 }}
      onDragEnd={(_, info) => onPointerDown(tree.id, info.point)}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') controls.start(e); }}
      onMouseDown={(e) => { if (e.detail > 0) controls.start(e); }}
      onClick={(e) => { e.stopPropagation(); onClick(tree); }}
      title="แตะเพื่อทำภารกิจ / กดค้างลากเพื่อย้าย"
    >
      <div className={`tree ${stage}`}>
        <span className="sparkle-dot">✦</span>
        <div className="stem"></div>
        <div className="leaf l1"></div><div className="leaf l2"></div><div className="leaf l3"></div><div className="leaf l4"></div>
        <div className="fruit f1"></div><div className="fruit f2"></div>
        <div className="seed-dot"></div>
      </div>
      <div className="pot-shape"><div className="soil"></div></div>
      <div className="tag">{tree.goal}</div>
      <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>
      <small>{progress}%</small>
    </motion.div>
  );
}

function Wizard({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [template, setTemplate] = useState(templates[0]);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [freq, setFreq] = useState('Daily');
  const [customDays, setCustomDays] = useState(3);

  useEffect(() => {
    if (step === 2 && tasks.length === 0) setTasks(template.tasks.map(t => ({ id: uid(), title: t, frequency: 'Daily', customDays: null, done: false, lastDone: null })));
  }, [step]);

  const potential = Math.min(100, tasks.reduce((sum, t) => sum + (t.frequency === 'Custom' ? Number(t.customDays || 3) : GROWTH[t.frequency]), 0));
  const addTask = () => {
    if (!taskName.trim()) return;
    setTasks([...tasks, { id: uid(), title: taskName.trim(), frequency: freq, customDays: freq === 'Custom' ? customDays : null, done: false, lastDone: null }]);
    setTaskName('');
  };
  const create = () => {
    const idx = Number(localStorage.getItem('seed-count') || 0);
    localStorage.setItem('seed-count', String(idx + 1));
    onCreate({
      id: uid(), goal: goal.trim() || 'ความฝันใหม่', templateId: template.id, tasks,
      potentialGrowth: potential, growth: 0, skinId: 'classic-pot', wilted: false,
      position: DEFAULT_POSITIONS[idx % DEFAULT_POSITIONS.length], createdAt: new Date().toISOString()
    });
  };
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="wizard" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
      <button className="icon-close" onClick={onClose}><X size={20}/></button>
      <div className="steps"><span className={step>=1?'on':''}>1</span><span className={step>=2?'on':''}>2</span><span className={step>=3?'on':''}>3</span></div>
      {step === 1 && <section>
        <h2>เพาะเมล็ดพันธุ์ความฝัน</h2>
        <label>ชื่อความฝันของคุณ</label>
        <input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="เช่น เก็บเงิน 100,000 บาท" />
        <label>เลือกแพ็กเมล็ดพันธุ์</label>
        <div className="template-grid">{templates.map(t => <button key={t.id} onClick={()=>setTemplate(t)} className={template.id===t.id?'active':''}><b>{t.emoji}</b>{t.label}</button>)}</div>
        <button className="primary wide" onClick={()=>setStep(2)}>ถัดไป</button>
      </section>}
      {step === 2 && <section>
        <h2>วางแผนกิจกรรมย่อย</h2>
        <div className="task-adder"><input value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="เพิ่มกิจกรรมย่อย"/><select value={freq} onChange={e=>setFreq(e.target.value)}>{Object.keys(GROWTH).map(f=><option key={f}>{f}</option>)}</select>{freq==='Custom'&&<input type="number" value={customDays} min="1" max="30" onChange={e=>setCustomDays(e.target.value)} /> }<button onClick={addTask}><Plus size={16}/></button></div>
        <div className="task-list small">{tasks.map(t=><div key={t.id}><span>{t.title}</span><em>{t.frequency}{t.frequency==='Custom'?` / ทุก ${t.customDays} วัน`:''}</em><button onClick={()=>setTasks(tasks.filter(x=>x.id!==t.id))}>×</button></div>)}</div>
        <div className="gauge"><div style={{'--p': `${potential * 3.6}deg`}}><b>{potential}%</b></div><p>ศักยภาพการเติบโตของแผนนี้</p></div>
        <button className="primary wide" onClick={()=>setStep(3)}>ถัดไป</button>
      </section>}
      {step === 3 && <section>
        <h2>พร้อมปลูกแล้ว!</h2>
        <div className="summary-card"><Sprout/> <p><b>{goal || 'ความฝันใหม่'}</b><br/>กิจกรรมทั้งหมด {tasks.length} รายการ<br/>ศักยภาพการเติบโต {potential}%</p></div>
        <button className="primary wide" onClick={create}>ปลูกเลย! 🌱</button>
      </section>}
    </motion.div>
  </motion.div>;
}

function TaskModal({ tree, onClose, onWater }) {
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="task-modal" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
      <button className="icon-close" onClick={onClose}><X size={20}/></button>
      <div className="plant-preview"><Pot tree={{...tree, position:{x:0,y:0}}} selected={false} onPointerDown={()=>{}} onClick={()=>{}} /></div>
      <h2>{tree.goal}</h2>
      <div className="main-progress"><span style={{width:`${tree.growth}%`}}/></div>
      <p className="muted">เติบโตแล้ว {tree.growth}% / ศักยภาพ {tree.potentialGrowth}%</p>
      <div className="task-list">{tree.tasks.map(task => <button key={task.id} className={task.done?'done':''} onClick={()=>onWater(tree.id, task.id)}><CheckCircle2 size={18}/><span>{task.title}</span><em>{task.frequency}{task.frequency==='Custom'?` / ${task.customDays} วัน`:''}</em></button>)}</div>
    </motion.div>
  </motion.div>;
}

function WateringOverlay({ avatar, onDone, growthGain }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return <motion.div className="watering-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="watering-scene" initial={{ scale: .88 }} animate={{ scale: 1 }}>
      <motion.div animate={{ rotate: [0, -4, 0], y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: 1 }}><Avatar avatar={avatar} size={210} watering /></motion.div>
      <div className="animated-pot"><div className="tree sprout branch bloom"><span className="sparkle-dot">✦</span><div className="stem"></div><div className="leaf l1"></div><div className="leaf l2"></div><div className="leaf l3"></div><div className="leaf l4"></div><div className="fruit f1"></div><div className="fruit f2"></div></div><div className="pot-shape"><div className="soil"></div></div></div>
      <div className="rain-drops">{Array.from({length:18}).map((_,i)=><i key={i} style={{left:`${47 + (i%6)*4}%`, animationDelay:`${i*.08}s`}} />)}</div>
      <motion.div className="gain" initial={{ y: 20, opacity: 0 }} animate={{ y: -10, opacity: 1 }} transition={{ delay: 1.2 }}>+{growthGain}% ✨</motion.div>
      <p>รดน้ำให้ต้นไม้ของคุณ!</p>
    </motion.div>
  </motion.div>;
}

function App() {
  const [avatarId, setAvatarId] = useState(localStorage.getItem('seed-avatar') || 'girl-garden');
  const [showAvatar, setShowAvatar] = useState(!localStorage.getItem('seed-avatar'));
  const [trees, setTrees] = useState(() => JSON.parse(localStorage.getItem('seed-trees') || '[]'));
  const [wizard, setWizard] = useState(false);
  const [activeTree, setActiveTree] = useState(null);
  const [watering, setWatering] = useState(null);
  const fileRef = useRef(null);
  const avatar = avatars.find(a=>a.id===avatarId) || avatars[0];

  useEffect(()=>localStorage.setItem('seed-avatar', avatarId), [avatarId]);
  useEffect(()=>localStorage.setItem('seed-trees', JSON.stringify(trees)), [trees]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ avatarId, trees }, null, 2)], { type:'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'the-seed-backup.json'; a.click();
  };
  const importJson = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const data = JSON.parse(await file.text());
    setTrees(data.trees || []); if (data.avatarId) setAvatarId(data.avatarId);
  };
  const createTree = (tree) => { setTrees([...trees, tree]); setWizard(false); };
  const updatePosition = (id, point) => {
    const garden = document.querySelector('.garden-stage').getBoundingClientRect();
    setTrees(ts => ts.map(t => t.id===id ? {...t, position:{ x: Math.max(6, Math.min(point.x - garden.left - 60, garden.width - 130)), y: Math.max(180, Math.min(point.y - garden.top - 60, garden.height - 140)) }} : t));
  };
  const waterTask = (treeId, taskId) => {
    let gain = 1;
    setTrees(ts => ts.map(t => {
      if (t.id !== treeId) return t;
      const task = t.tasks.find(x=>x.id===taskId); gain = task.frequency === 'Custom' ? Number(task.customDays || 3) : GROWTH[task.frequency];
      return { ...t, growth: Math.min(100, t.growth + gain), wilted: false, tasks: t.tasks.map(x => x.id===taskId ? {...x, done:true, lastDone: new Date().toISOString()} : x) };
    }));
    setWatering({ gain });
  };
  const resetDemo = () => { localStorage.clear(); setTrees([]); setAvatarId('girl-garden'); setShowAvatar(true); };

  return <div className="app">
    <main className="phone-shell">
      <section className="garden-stage" onClick={()=>setActiveTree(null)}>
        <div className="sunbeams"/><div className="big-tree"><div/><span/><i/></div><div className="bench"></div><div className="bird b1">🐦</div><div className="bird b2">🐤</div><div className="pond"></div>
        <header className="top-card"><div><h1>THE SEED</h1><p>Plant your dreams, grow your future</p></div><button onClick={()=>setShowAvatar(true)}><Avatar avatar={avatar} size={42}/></button></header>
        <div className="player"><Avatar avatar={avatar} size={130}/></div>
        {trees.length === 0 && <motion.div className="empty-hint" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>สวนยังว่างอยู่ มาเพาะเมล็ดพันธุ์ความฝันกัน 🌱</motion.div>}
        {trees.map(t => <Pot key={t.id} tree={t} selected={activeTree?.id===t.id} onPointerDown={updatePosition} onClick={setActiveTree}/>)}
        <button className="plant-button" onClick={(e)=>{e.stopPropagation();setWizard(true)}}><Plus size={20}/> เพาะเมล็ดพันธุ์ความฝัน</button>
      </section>
      <nav className="bottom-nav"><button><Leaf/>สวนของฉัน</button><button onClick={()=>activeTree && setActiveTree(activeTree)}><CheckCircle2/>ภารกิจ</button><button onClick={exportJson}><Download/>Export</button><button onClick={()=>fileRef.current.click()}><Upload/>Import</button><button onClick={resetDemo}><RotateCcw/>Reset</button><input ref={fileRef} type="file" accept="application/json" onChange={importJson}/></nav>
    </main>
    <AnimatePresence>{showAvatar && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="avatar-picker" initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} exit={{y:50,opacity:0}}><h2>🌿 เลือกตัวแทนของคุณ 🌿</h2><div className="avatar-grid">{avatars.map(a=><button key={a.id} className={avatarId===a.id?'active':''} onClick={()=>setAvatarId(a.id)}><Avatar avatar={a} size={112}/><b>{a.name}</b><span>{a.gender}</span></button>)}</div><button className="primary wide" onClick={()=>setShowAvatar(false)}>เริ่มปลูกความฝัน</button></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{wizard && <Wizard onClose={()=>setWizard(false)} onCreate={createTree}/>}</AnimatePresence>
    <AnimatePresence>{activeTree && <TaskModal tree={activeTree} onClose={()=>setActiveTree(null)} onWater={waterTask}/>}</AnimatePresence>
    <AnimatePresence>{watering && <WateringOverlay avatar={avatar} growthGain={watering.gain} onDone={()=>{setWatering(null); setActiveTree(null);}}/>}</AnimatePresence>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);


import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, Download, GalleryHorizontal, Home, Import, Leaf, Plus, Sprout, Store, UserRound, X, Droplets } from "lucide-react";
import "./styles.css";

const A="/assets/";
const avatars=[
  {id:"female-1",label:"นักปลูกฝัน",src:A+"avatars/female-1.png"},
  {id:"female-2",label:"สายหวาน",src:A+"avatars/female-2.png"},
  {id:"female-3",label:"อบอุ่น",src:A+"avatars/female-3.png"},
  {id:"male-1",label:"สายเท่",src:A+"avatars/male-1.png"},
  {id:"male-2",label:"นักวางแผน",src:A+"avatars/male-2.png"},
  {id:"male-3",label:"สายชิล",src:A+"avatars/male-3.png"},
];

const templates=[
  {id:"health", icon:"💪", name:"สุขภาพ", tasks:[
    ["ดื่มน้ำ 2 ลิตร","Daily"],["เดิน 20 นาที","Daily"],["ชั่งน้ำหนัก","Weekly"],["สรุปสุขภาพประจำเดือน","Monthly"]
  ]},
  {id:"money", icon:"🪙", name:"การเงิน", tasks:[
    ["บันทึกรายรับรายจ่าย","Daily"],["ออมเงิน 100 บาท","Weekly"],["ทบทวนงบรายเดือน","Monthly"]
  ]},
  {id:"learn", icon:"📚", name:"การเรียนรู้", tasks:[
    ["อ่าน/เรียน 30 นาที","Daily"],["สรุปสิ่งที่เรียน","Weekly"],["ทำโปรเจกต์ย่อย","Monthly"]
  ]},
  {id:"biz", icon:"💼", name:"ธุรกิจ / อาชีพ", tasks:[
    ["ทำงานหลัก 1 ชิ้น","Daily"],["โพสต์คอนเทนต์","Weekly"],["ดูตัวเลขยอดขาย","Monthly"]
  ]},
];

const growthPoint={Daily:1, Weekly:5, Monthly:20, Quarterly:50, Custom:3};
const frequencyLabels={Daily:"รายวัน",Weekly:"รายสัปดาห์",Monthly:"รายเดือน",Quarterly:"รายไตรมาส",Custom:"กำหนดเอง"};

function uid(){ return Math.random().toString(36).slice(2,9); }
function today(){ return new Date().toISOString().slice(0,10); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }

const seedData = {
  avatar:"female-1",
  activeTab:"home",
  water:1200,
  level:12,
  dreams:[
    {
      id:"demo-health",
      name:"สุขภาพแข็งแรง",
      template:"health",
      growth:45,
      potential:100,
      x:42,y:68,
      plantedAt:today(),
      tasks:[
        {id:"t1",title:"เดิน 20 นาที",freq:"Daily",done:false},
        {id:"t2",title:"ดื่มน้ำ 2 ลิตร",freq:"Daily",done:true,lastDone:today()},
        {id:"t3",title:"ออกกำลังกาย 3 วัน",freq:"Weekly",done:false},
      ]
    },
    {
      id:"demo-money",
      name:"เก็บเงิน 100,000 บาท",
      template:"money",
      growth:25,
      potential:80,
      x:50,y:71,
      plantedAt:today(),
      tasks:[
        {id:"t4",title:"บันทึกรายรับรายจ่าย",freq:"Daily",done:false},
        {id:"t5",title:"ออมเงิน 500 บาท",freq:"Weekly",done:false},
        {id:"t6",title:"สรุปการเงินรายเดือน",freq:"Monthly",done:false},
      ]
    },
    {
      id:"demo-learn",
      name:"เรียนภาษาอังกฤษ",
      template:"learn",
      growth:15,
      potential:70,
      x:58,y:69,
      plantedAt:today(),
      tasks:[
        {id:"t7",title:"ฝึกศัพท์ 10 คำ",freq:"Daily",done:false},
        {id:"t8",title:"ฟัง podcast",freq:"Weekly",done:false},
      ]
    }
  ],
  completed:[
    {id:"c1",name:"อ่านหนังสือ 12 เล่ม",completedAt:"2026-04-01",daysUsed:88,skin:"bloom",x:22},
    {id:"c2",name:"ทำเว็บไซต์พอร์ต",completedAt:"2026-04-12",daysUsed:34,skin:"bloom",x:44},
    {id:"c3",name:"เก็บเงินก้อนแรก",completedAt:"2026-04-20",daysUsed:120,skin:"bloom",x:66}
  ]
};

function loadState(){
  try { return JSON.parse(localStorage.getItem("the-seed-state")) || seedData; } catch { return seedData; }
}
function saveState(s){ localStorage.setItem("the-seed-state", JSON.stringify(s)); }

function plantStage(growth){
  if(growth<21) return 0;
  if(growth<51) return 1;
  if(growth<81) return 2;
  return 3;
}

function Header({state,setState,onAvatar}){
  return <div className="topbar">
    <button className="profile-pill" onClick={onAvatar}>
      <img src={avatars.find(a=>a.id===state.avatar)?.src} />
      <span><b>Level {state.level}</b><small><Droplets size={13}/> {state.water}</small></span>
    </button>
    <div className="brand"><Leaf size={16}/> THE SEED</div>
    <button className="round ghost" onClick={()=>setState(s=>({...s,activeTab:"settings"}))}>⚙️</button>
  </div>
}

function Garden({state,setState,onPlant,onOpenDream}){
  const dragRef=useRef(null);
  const [dragId,setDragId]=useState(null);
  const updatePos=(id,e)=>{
    const r=dragRef.current.getBoundingClientRect();
    const x=clamp(((e.clientX-r.left)/r.width)*100,15,85);
    const y=clamp(((e.clientY-r.top)/r.height)*100,35,77);
    setState(s=>({...s,dreams:s.dreams.map(d=>d.id===id?{...d,x,y}:d)}));
  };
  return <main className="screen garden-screen" ref={dragRef}>
    <Background />
    <Header state={state} setState={setState} onAvatar={()=>setState(s=>({...s,activeTab:"avatar"}))}/>
    <motion.img className="hero-avatar" src={avatars.find(a=>a.id===state.avatar)?.src}
      animate={{y:[0,-5,0]}} transition={{duration:3,repeat:Infinity,ease:"easeInOut"}} />
    <img className="decor bench" src={A+"bench.png"}/>
    <img className="decor bird" src={A+"bird.png"}/>
    <div className="pots-layer">
      {state.dreams.map(d=><motion.button
        key={d.id}
        className={"dream-pot "+(d.growth<12?"wilt":"")}
        style={{left:`${d.x}%`, top:`${d.y}%`}}
        onPointerDown={(e)=>{setDragId(d.id); e.currentTarget.setPointerCapture?.(e.pointerId)}}
        onPointerMove={(e)=>{ if(dragId===d.id) updatePos(d.id,e);}}
        onPointerUp={(e)=>{ setDragId(null); }}
        onClick={(e)=>{ if(!dragId) onOpenDream(d.id); }}
        whileTap={{scale:1.05}}
      >
        <img src={A+`plants/stage-${plantStage(d.growth)}.png`} />
        <span>{d.name}</span>
        <small>{d.growth}%</small>
      </motion.button>)}
      <button className="add-pot" onClick={onPlant}><Plus /></button>
    </div>
    <button className="plant-cta" onClick={onPlant}><Sprout size={23}/> เพาะเมล็ดพันธุ์ความฝัน</button>
  </main>
}

function Background(){
  return <>
    <div className="bg-layer bg-garden"></div>
    <div className="sun-glow"></div>
    <div className="floating floating-one">✨</div>
    <div className="floating floating-two">🍃</div>
  </>
}

function AvatarPicker({state,setState}){
  return <main className="screen plain-screen">
    <SubHeader title="เลือกตัวแทนของคุณ" onBack={()=>setState(s=>({...s,activeTab:"home"}))}/>
    <div className="avatar-grid">
      {avatars.map(a=><button key={a.id} className={"avatar-card "+(state.avatar===a.id?"selected":"")} onClick={()=>setState(s=>({...s,avatar:a.id,activeTab:"home"}))}>
        <img src={a.src}/><b>{a.label}</b>{state.avatar===a.id && <Check/>}
      </button>)}
    </div>
  </main>
}

function PlantWizard({state,setState}){
  const [step,setStep]=useState(1);
  const [name,setName]=useState("");
  const [template,setTemplate]=useState("health");
  const [tasks,setTasks]=useState([]);
  const [newTask,setNewTask]=useState("");
  const [freq,setFreq]=useState("Daily");
  const [customDays,setCustomDays]=useState(3);
  useEffect(()=>{
    const t=templates.find(t=>t.id===template);
    setTasks(t.tasks.map(([title,freq])=>({id:uid(),title,freq,done:false,customDays:null})));
  },[template]);
  const potential=clamp(tasks.reduce((sum,t)=>sum+(growthPoint[t.freq]||customDays),0),0,100);
  const addTask=()=>{ if(!newTask.trim()) return; setTasks([...tasks,{id:uid(),title:newTask.trim(),freq,done:false,customDays:freq==="Custom"?customDays:null}]); setNewTask("");};
  const plant=()=>{
    if(!name.trim()) return;
    const dream={id:uid(),name:name.trim(),template,growth:0,potential,x:45+Math.random()*15,y:64+Math.random()*8,plantedAt:today(),tasks};
    setState(s=>({...s,dreams:[...s.dreams,dream],activeTab:"home"}));
  };
  return <main className="screen plain-screen">
    <SubHeader title="เพาะเมล็ดพันธุ์ความฝัน" onBack={()=>setState(s=>({...s,activeTab:"home"}))}/>
    <div className="wizard">
      <div className="steps"><span className={step>=1?"on":""}>1</span><span className={step>=2?"on":""}>2</span><span className={step>=3?"on":""}>3</span></div>
      {step===1 && <section className="card">
        <label>ชื่อความฝันของคุณ</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น เก็บเงิน 100,000 บาท"/>
        <label>เลือกเทมเพลต</label>
        <div className="template-grid">{templates.map(t=><button className={template===t.id?"selected":""} onClick={()=>setTemplate(t.id)} key={t.id}><span>{t.icon}</span>{t.name}</button>)}</div>
        <button className="primary" onClick={()=>setStep(2)}>ถัดไป</button>
      </section>}
      {step===2 && <section className="card">
        <label>กิจกรรมย่อย</label>
        {tasks.map((t,i)=><div className="task-row mini" key={t.id}>
          <input value={t.title} onChange={e=>setTasks(tasks.map(x=>x.id===t.id?{...x,title:e.target.value}:x))}/>
          <select value={t.freq} onChange={e=>setTasks(tasks.map(x=>x.id===t.id?{...x,freq:e.target.value}:x))}>{Object.keys(frequencyLabels).map(f=><option key={f}>{f}</option>)}</select>
          <button onClick={()=>setTasks(tasks.filter(x=>x.id!==t.id))}>×</button>
        </div>)}
        <div className="add-task">
          <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="เพิ่มกิจกรรม..."/>
          <select value={freq} onChange={e=>setFreq(e.target.value)}>{Object.keys(frequencyLabels).map(f=><option key={f}>{f}</option>)}</select>
          {freq==="Custom" && <input type="number" min="1" value={customDays} onChange={e=>setCustomDays(+e.target.value||1)} />}
          <button onClick={addTask}><Plus size={16}/></button>
        </div>
        <div className="gauge"><div style={{"--p":potential}}><b>{potential}%</b></div><span>ศักยภาพการเติบโตของแผนนี้</span></div>
        <button className="primary" onClick={()=>setStep(3)}>ถัดไป</button>
      </section>}
      {step===3 && <section className="card summary-card">
        <img src={A+"pot-planted.png"}/>
        <h2>พร้อมปลูกความฝันแล้ว</h2>
        <p>กิจกรรมทั้งหมด {tasks.length} รายการ • ศักยภาพ {potential}%</p>
        <button className="primary" onClick={plant}>ปลูกเลย! 🌱</button>
      </section>}
    </div>
  </main>
}

function TaskView({state,setState,dreamId}){
  const dream=state.dreams.find(d=>d.id===dreamId) || state.dreams[0];
  const [watering,setWatering]=useState(false);
  if(!dream) return null;
  const toggleTask=(taskId)=>{
    let grew=0;
    setState(s=>({...s,dreams:s.dreams.map(d=>{
      if(d.id!==dream.id) return d;
      const tasks=d.tasks.map(t=>{
        if(t.id!==taskId) return t;
        const done=!t.done;
        if(done) grew=growthPoint[t.freq]||t.customDays||3;
        return {...t,done,lastDone:done?today():t.lastDone};
      });
      return {...d,tasks,growth:clamp(d.growth+grew,0,100)};
    })}));
    if(grew>0) setWatering(true);
  };
  const completeDream=()=>{
    setState(s=>({
      ...s,
      dreams:s.dreams.filter(d=>d.id!==dream.id),
      completed:[...s.completed,{id:dream.id,name:dream.name,completedAt:today(),daysUsed:Math.max(1,Math.floor((Date.now()-new Date(dream.plantedAt).getTime())/86400000)),skin:"bloom",x:20+s.completed.length*22}]
    }));
  };
  return <main className="screen task-screen">
    <div className="task-bg"></div>
    <SubHeader title={dream.name} onBack={()=>setState(s=>({...s,activeTab:"home"}))}/>
    <section className="task-card">
      <img className="task-pot" src={A+`plants/stage-${plantStage(dream.growth)}.png`}/>
      <div className="progress-title"><b>{dream.growth}%</b><span>ศักยภาพ {dream.potential}%</span></div>
      <div className="progress"><i style={{width:`${dream.growth}%`}}></i></div>
      <h3>ภารกิจย่อย</h3>
      {dream.tasks.map(t=><label className="check-row" key={t.id}>
        <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)}/>
        <span>{t.title}</span>
        <em>{frequencyLabels[t.freq]}</em>
      </label>)}
      {dream.growth>=100 && <button className="success" onClick={completeDream}>สำเร็จความฝัน เก็บเข้าหอเกียรติยศ ✨</button>}
      <button className="primary" onClick={()=>setWatering(true)}>ดูแลต้นไม้ 🪣</button>
    </section>
    <AnimatePresence>{watering && <WateringScene avatar={state.avatar} onDone={()=>setWatering(false)}/>}</AnimatePresence>
  </main>
}

function WateringScene({avatar,onDone}){
  const frames=[1,2,3,4,5,6].map(i=>A+`watering/frame-${i}.png`);
  const [i,setI]=useState(0);
  useEffect(()=>{
    if(i<frames.length-1){ const t=setTimeout(()=>setI(i+1),420); return ()=>clearTimeout(t);}
    const t=setTimeout(onDone,1400); return ()=>clearTimeout(t);
  },[i]);
  return <motion.div className="watering-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <div className="watering-card">
      <motion.img src={frames[i]} key={i} initial={{scale:.96,opacity:.4}} animate={{scale:1,opacity:1}} transition={{duration:.25}} />
      <motion.div className="plus-growth" initial={{y:15,opacity:0,scale:.8}} animate={{y:0,opacity:1,scale:1}}>+1% ✨</motion.div>
      <div className="water-progress"><i></i></div>
    </div>
  </motion.div>
}

function Gallery({state,setState}){
  return <main className="screen gallery-screen">
    <div className="gallery-bg"></div>
    <SubHeader title="สวนแห่งความสำเร็จ" onBack={()=>setState(s=>({...s,activeTab:"home"}))}/>
    <motion.img className="gallery-walker" src={avatars.find(a=>a.id===state.avatar)?.src}
      animate={{x:[0,7,0],y:[0,-2,0]}} transition={{duration:1.2,repeat:Infinity}}/>
    <div className="gallery-track">
      {state.completed.map((c,idx)=><motion.div className="achievement-tree" key={c.id} whileTap={{scale:1.05}}>
        <img src={A+"plants/stage-3.png"}/>
        <b>{c.name}</b>
        <span>สำเร็จ {c.completedAt}</span>
        <small>ใช้เวลา {c.daysUsed} วัน</small>
      </motion.div>)}
      {state.completed.length===0 && <div className="empty-gallery">ยังไม่มีต้นไม้แห่งความสำเร็จ<br/>ค่อยๆ ปลูกไป เดี๋ยวสวนนี้จะสวยเอง 🌱</div>}
    </div>
  </main>
}

function Settings({state,setState}){
  const file=useRef(null);
  const exportData=()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="the-seed-backup.json"; a.click();
  };
  const importData=(e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=()=>{ try{ setState(JSON.parse(reader.result)); }catch{ alert("ไฟล์ JSON ไม่ถูกต้อง"); }};
    reader.readAsText(f);
  };
  return <main className="screen plain-screen">
    <SubHeader title="ตั้งค่า" onBack={()=>setState(s=>({...s,activeTab:"home"}))}/>
    <section className="card">
      <h2>ข้อมูลของฉัน</h2>
      <p>ข้อมูลทั้งหมดเก็บในเครื่องนี้ด้วย LocalStorage ไม่มี Server/Database</p>
      <button className="primary" onClick={exportData}><Download size={18}/> Export JSON</button>
      <button className="soft" onClick={()=>file.current.click()}><Import size={18}/> Import JSON</button>
      <input ref={file} type="file" accept=".json,application/json" hidden onChange={importData}/>
      <button className="danger" onClick={()=>{localStorage.removeItem("the-seed-state"); location.reload();}}>รีเซ็ตเดโม</button>
    </section>
  </main>
}

function SubHeader({title,onBack}){
  return <div className="subheader"><button className="round" onClick={onBack}><ChevronLeft/></button><b>{title}</b><span></span></div>
}

function BottomNav({state,setState}){
  const items=[
    ["home",Home,"สวนของฉัน"],["tasks",Check,"ภารกิจ"],["gallery",GalleryHorizontal,"แกลเลอรี่"],["store",Store,"ร้านค้า"],["avatar",UserRound,"โปรไฟล์"]
  ];
  return <nav className="bottom-nav">
    {items.map(([id,Icon,label])=><button key={id} className={state.activeTab===id?"on":""} onClick={()=>setState(s=>({...s,activeTab:id==="tasks"?"home":id}))}>
      <Icon size={22}/><span>{label}</span>
    </button>)}
  </nav>
}

function App(){
  const [state,setState]=useState(loadState);
  const [openDream,setOpenDream]=useState(null);
  useEffect(()=>saveState(state),[state]);
  let view;
  if(state.activeTab==="avatar") view=<AvatarPicker state={state} setState={setState}/>;
  else if(state.activeTab==="plant") view=<PlantWizard state={state} setState={setState}/>;
  else if(state.activeTab==="gallery") view=<Gallery state={state} setState={setState}/>;
  else if(state.activeTab==="settings") view=<Settings state={state} setState={setState}/>;
  else if(openDream) view=<TaskView state={state} setState={setState} dreamId={openDream}/>;
  else if(state.activeTab==="store") view=<StoreSoon setState={setState}/>;
  else view=<Garden state={state} setState={setState} onPlant={()=>setState(s=>({...s,activeTab:"plant"}))} onOpenDream={setOpenDream}/>;
  return <div className="phone-shell">
    {React.cloneElement(view, {key:state.activeTab})}
    {!["plant","avatar","settings"].includes(state.activeTab) && !openDream && <BottomNav state={state} setState={setState}/>}
    {openDream && <button className="floating-back" onClick={()=>setOpenDream(null)}><X size={20}/></button>}
  </div>
}
function StoreSoon({setState}){
  return <main className="screen plain-screen"><SubHeader title="ร้านค้าเมล็ดพันธุ์" onBack={()=>setState(s=>({...s,activeTab:"home"}))}/><section className="card summary-card"><img src={A+"pot-planted.png"}/><h2>Seed Store</h2><p>พื้นที่สำหรับ Skin, Seed Packet และของตกแต่งสวนในอนาคต</p></section></main>
}

createRoot(document.getElementById("root")).render(<App/>);

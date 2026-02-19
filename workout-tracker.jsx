import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ── FONTS ─────────────────────────────────────────────────────────────────────
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";
document.head.appendChild(fl);

// ── QUOTES ────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Don't stop when it hurts. Stop when you're done.", author: null },
  { text: "Every rep is a vote for the person you want to become.", author: "James Clear" },
  { text: "Discipline is doing what needs to be done, even when you don't want to.", author: null },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: null },
  { text: "One more rep. One more set. One more day.", author: null },
  { text: "Results don't come from comfort zones.", author: null },
  { text: "You don't find willpower. You build it.", author: null },
  { text: "Strength is built in the moments you want to quit.", author: null },
  { text: "The body achieves what the mind believes.", author: null },
  { text: "Earn it.", author: null },
];

// ── PROGRAM DATA ──────────────────────────────────────────────────────────────
const START_DATE = new Date("2026-02-16");

function getDaysSince(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const s = new Date(START_DATE); s.setHours(0,0,0,0);
  return Math.floor((d - s) / 86400000);
}
function getProgramMonth(days) {
  if (days < 0) return null;
  const m = Math.floor(days / 28) + 1;
  return m > 12 ? null : m;
}
function getPhase(month) {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}
const PHASE_LABELS = ["","Foundation","Build & Shape","Aesthetic Athlete","Greek Anime Mode"];
const PHASE_ACCENT = ["","#D4A574","#5B9BD5","#9B6EC8","#D45B5B"];
const PHASE_DIM    = ["","#D4A57430","#5B9BD530","#9B6EC830","#D45B5B30"];
const PHASE_BG     = ["","#D4A57410","#5B9BD510","#9B6EC810","#D45B5B10"];

const E = (name, sets, reps, note = "") => ({ name, sets, reps, note });

const P3 = {
  0:{title:"Strength Push",day:"MON",exercises:[E("Archer Push-ups",4,"6–8"),E("Pseudo Planche",4,"8"),E("Pike Push-ups",4,"10"),E("Plank",4,"75s")]},
  1:{title:"Legs",day:"TUE",exercises:[E("Squats",5,"25"),E("Bulgarian Split Squat",4,"12"),E("Jump Squats",4,"12"),E("Plank",3,"75s")]},
  2:{title:"Core + Conditioning",day:"WED",exercises:[E("Leg Raises",4,"20"),E("Hollow Hold",4,"45s"),E("Mountain Climbers","","45/15 ×10"),E("Front Plank","","90s"),E("Side Plank","","60s each")]},
  3:{title:"Push Volume",day:"THU",exercises:[E("Push-ups",5,"20"),E("Diamond Push-ups",4,"15"),E("Wide Push-ups",4,"20"),E("Plank Shoulder Taps",4,"50")]},
  4:{title:"Full Body Burn",day:"FRI",note:"5 rounds",exercises:[E("Push-ups","","×25"),E("Squats","","×30"),E("High Knees","","×45s"),E("Plank","","×75s")]},
  5:{title:"Rest",day:"SAT",exercises:[]},6:{title:"Rest",day:"SUN",exercises:[]},
};
const P4 = {
  0:{title:"Chest & Arms",day:"MON",exercises:[E("Push-ups",5,"20"),E("Diamond Push-ups",4,"20"),E("Pseudo Planche",4,"12"),E("Plank",4,"90s")]},
  1:{title:"Legs",day:"TUE",exercises:[E("Squats",5,"30"),E("Jump Squats",4,"20"),E("Wall Sit",2,"90s"),E("Plank",3,"90s")]},
  2:{title:"Abs",day:"WED",exercises:[E("Leg Raises",4,"25"),E("Hollow Hold",4,"60s"),E("Plank Ladder","","60s→75s→90s","×2 rounds")]},
  3:{title:"Arm Burn",day:"THU",exercises:[E("Close Push-ups",4,"25"),E("Wide Push-ups",4,"25"),E("Shoulder Taps",4,"50"),E("Plank",4,"90s")]},
  4:{title:"Conditioning",day:"FRI",note:"5–6 rounds",exercises:[E("Push-ups","","×30"),E("Squats","","×35"),E("Mountain Climbers","","×60s"),E("Plank","","×90s")]},
  5:{title:"Rest",day:"SAT",exercises:[]},6:{title:"Rest",day:"SUN",exercises:[]},
};
const P256 = {
  0:{title:"Push",day:"MON",exercises:[E("Push-ups",5,"15–20"),E("Pike Push-ups",4,"8"),E("Diamond Push-ups",3,"8"),E("Front Plank",4,"75s"),E("Plank Shoulder Taps",4,"40")]},
  1:{title:"Legs",day:"TUE",exercises:[E("Squats",5,"15"),E("Bulgarian Split Squat",3,"8 each"),E("Jump Squats",3,"10"),E("Calf Raises",4,"25"),E("Plank",3,"75s")]},
  2:{title:"Core + HIIT",day:"WED",exercises:[E("Leg Raises",4,"12"),E("Russian Twists",3,"20"),E("High Knees","","20/40 ×12–15"),E("Front Plank","","75s"),E("Side Plank","","60s each","×2"),E("Plank Shoulder Taps",4,"40")]},
  3:{title:"Push Volume",day:"THU",exercises:[E("Push-ups",4,"15"),E("Close Push-ups",3,"12"),E("Wide Push-ups",3,"15"),E("Plank",3,"75s")]},
  4:{title:"Conditioning",day:"FRI",note:"4 rounds",exercises:[E("Push-ups","","×15"),E("Squats","","×25"),E("Mountain Climbers","","×40s"),E("Plank","","×75s")]},
  5:{title:"Rest",day:"SAT",exercises:[]},6:{title:"Rest",day:"SUN",exercises:[]},
};

const WORKOUTS = {
  m1:{
    0:{title:"Upper Body",day:"MON",exercises:[E("Push-ups",4,"10–12"),E("Knee Push-ups",3,"12–15"),E("Pike Push-ups",3,"8"),E("Plank",4,"30–40s")]},
    1:{title:"Lower Body",day:"TUE",exercises:[E("Squats",4,"15"),E("Reverse Lunges",3,"10 each"),E("Glute Bridge",3,"20"),E("Calf Raises",3,"25"),E("Plank",3,"30s")]},
    2:{title:"Core + Cardio",day:"WED",exercises:[E("Dead Bug",3,"10 each"),E("Knee Raises",4,"12"),E("Mountain Climbers",3,"20s"),E("Plank",4,"40s")]},
    3:{title:"Upper Body",day:"THU",exercises:[E("Push-ups",4,"10–12"),E("Knee Push-ups",3,"12–15"),E("Pike Push-ups",3,"8"),E("Plank",4,"30–40s")]},
    4:{title:"Full Body Circuit",day:"FRI",note:"3 rounds",exercises:[E("Push-ups","","×12"),E("Squats","","×20"),E("Plank","","×40s"),E("Wall Sit","","×45s")]},
    5:{title:"Rest",day:"SAT",exercises:[]},6:{title:"Rest",day:"SUN",exercises:[]},
  },
  m2:{
    0:{title:"Upper Body",day:"MON",exercises:[E("Push-ups",4,"12–15"),E("Knee Push-ups",3,"12–15"),E("Pike Push-ups",3,"8"),E("Plank",4,"45s"),E("Side Plank",3,"30s each")]},
    1:{title:"Lower Body",day:"TUE",exercises:[E("Squats",4,"18"),E("Reverse Lunges",3,"10 each"),E("Glute Bridge",3,"20"),E("Calf Raises",3,"25"),E("Plank",3,"45s")]},
    2:{title:"Core + Cardio",day:"WED",exercises:[E("Dead Bug",3,"10 each"),E("Knee Raises",4,"12"),E("Mountain Climbers",3,"30s"),E("Plank",4,"45s"),E("Side Plank",3,"30s each")]},
    3:{title:"Upper Body",day:"THU",exercises:[E("Push-ups",4,"12–15"),E("Knee Push-ups",3,"12–15"),E("Pike Push-ups",3,"8"),E("Plank",4,"45s"),E("Side Plank",3,"30s each")]},
    4:{title:"Full Body Circuit",day:"FRI",note:"3 rounds",exercises:[E("Push-ups","","×12–15"),E("Squats","","×18"),E("Plank","","×45s"),E("Wall Sit","","×45s")]},
    5:{title:"Rest",day:"SAT",exercises:[]},6:{title:"Rest",day:"SUN",exercises:[]},
  },
  m3:{
    0:{title:"Upper Body",day:"MON",exercises:[E("Push-ups",4,"15"),E("Pike Push-ups",4,"10"),E("Jump Squats",3,"10"),E("Front Plank",4,"50s"),E("Side Plank",3,"40s each")]},
    1:{title:"Lower Body",day:"TUE",exercises:[E("Squats",4,"20"),E("Reverse Lunges",3,"10 each"),E("Jump Squats",3,"10"),E("Glute Bridge",3,"20"),E("Calf Raises",3,"25"),E("Front Plank",3,"50s")]},
    2:{title:"Core + Cardio",day:"WED",exercises:[E("Dead Bug",3,"10 each"),E("Knee Raises",4,"12"),E("Mountain Climbers",3,"30s"),E("Front Plank",4,"50s"),E("Side Plank",3,"40s each")]},
    3:{title:"Upper Body",day:"THU",exercises:[E("Push-ups",4,"15"),E("Pike Push-ups",4,"10"),E("Jump Squats",3,"10"),E("Front Plank",4,"50s"),E("Side Plank",3,"40s each")]},
    4:{title:"Full Body Circuit",day:"FRI",note:"3 rounds",exercises:[E("Push-ups","","×15"),E("Squats","","×20"),E("Jump Squats","","×10"),E("Front Plank","","×50s"),E("Wall Sit","","×45s")]},
    5:{title:"Rest",day:"SAT",exercises:[]},6:{title:"Rest",day:"SUN",exercises:[]},
  },
  m4:{
    0:{title:"Push",day:"MON",exercises:[E("Push-ups",5,"12"),E("Pike Push-ups",4,"8"),E("Diamond Push-ups",3,"8"),E("Plank",4,"60s"),E("Plank Shoulder Taps",3,"30")]},
    1:{title:"Legs",day:"TUE",exercises:[E("Squats",5,"15"),E("Bulgarian Split Squat",3,"8 each"),E("Jump Squats",3,"10"),E("Calf Raises",4,"25"),E("Plank",3,"60s")]},
    2:{title:"Core + HIIT",day:"WED",exercises:[E("Leg Raises",4,"12"),E("Russian Twists",3,"20"),E("High Knees","","20/40 ×10"),E("Front Plank","","60s"),E("Side Plank","","45s each","×2")]},
    3:{title:"Push Volume",day:"THU",exercises:[E("Push-ups",4,"15"),E("Close Push-ups",3,"12"),E("Wide Push-ups",3,"15"),E("Plank",3,"60s")]},
    4:{title:"Conditioning",day:"FRI",note:"4 rounds",exercises:[E("Push-ups","","×15"),E("Squats","","×25"),E("Mountain Climbers","","×40s"),E("Plank","","×60s")]},
    5:{title:"Rest",day:"SAT",exercises:[]},6:{title:"Rest",day:"SUN",exercises:[]},
  },
  m5:P256,m6:P256,m7:P3,m8:P3,m9:P3,m10:P4,m11:P4,m12:P4,
};

function getWorkoutForDate(date) {
  const days = getDaysSince(date);
  if (days < 0) return null;
  const month = getProgramMonth(days);
  if (!month) return null;
  return WORKOUTS[`m${month}`]?.[days % 7] ?? null;
}

// ── UTC+8 ─────────────────────────────────────────────────────────────────────
function toISO(date) {
  const d = new Date(typeof date === "string" ? date + "T00:00:00+08:00" : date);
  return new Date(d.getTime() + 8*3600000).toISOString().split("T")[0];
}
function todayBST() {
  return new Date(Date.now() + 8*3600000).toISOString().split("T")[0];
}

// ── STORAGE ───────────────────────────────────────────────────────────────────
const SK = d => `log:${d}`;
const WK = "weight-log";
async function loadLog(d)  { try { const r=await window.storage.get(SK(d)); return r?JSON.parse(r.value):null; } catch{return null;} }
async function saveLog(d,v){ try { await window.storage.set(SK(d),JSON.stringify(v)); } catch{} }
async function loadAllLogs(){
  try {
    const keys=(await window.storage.list("log:"))?.keys??[];
    const out={};
    for(const k of keys){ const r=await window.storage.get(k); if(r)out[k.replace("log:","")]=JSON.parse(r.value); }
    return out;
  } catch{return{};}
}
async function loadWeightLog(){ try{const r=await window.storage.get(WK);return r?JSON.parse(r.value):[];} catch{return[];} }
async function saveWeightLog(v){ try{await window.storage.set(WK,JSON.stringify(v));}catch{} }

function fmtDate(d){ return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function fmtFull(d){ return new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); }

// ── LOGO SVG ──────────────────────────────────────────────────────────────────
function Logo({ size=40, color="#D4A574" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="1" opacity="0.3"/>
      <polygon points="24,6 36,18 24,30 12,18" stroke={color} strokeWidth="1.2" fill={color+"18"} opacity="0.9"/>
      <polygon points="24,18 33,26 24,42 15,26" stroke={color} strokeWidth="0.9" fill={color+"10"} opacity="0.6"/>
      <circle cx="24" cy="24" r="2.2" fill={color}/>
      <line x1="24" y1="2" x2="24" y2="6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="24" y1="42" x2="24" y2="46" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

// ── PROGRAM HERO BANNER ───────────────────────────────────────────────────────
function ProgramHero({ accent }) {
  return (
    <div style={{
      margin:"20px 0 24px",
      borderRadius:16,
      overflow:"hidden",
      background:`linear-gradient(145deg, #111 0%, #0d0d0d 100%)`,
      border:`1px solid ${accent}25`,
      position:"relative",
    }}>
      {/* Background geometric decoration */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.07}} viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice">
        <polygon points="180,20 300,80 180,140 60,80" stroke={accent} strokeWidth="1.5" fill="none"/>
        <polygon points="180,50 260,90 180,130 100,90" stroke={accent} strokeWidth="1" fill="none"/>
        <polygon points="180,5 340,90 180,175 20,90" stroke={accent} strokeWidth="0.5" fill="none"/>
        <circle cx="180" cy="90" r="60" stroke={accent} strokeWidth="0.8" fill="none"/>
        <circle cx="180" cy="90" r="100" stroke={accent} strokeWidth="0.4" fill="none"/>
        <line x1="180" y1="0" x2="180" y2="180" stroke={accent} strokeWidth="0.5"/>
        <line x1="0" y1="90" x2="360" y2="90" stroke={accent} strokeWidth="0.5"/>
      </svg>

      {/* Content */}
      <div style={{
        position:"relative", zIndex:1,
        padding:"32px 24px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:14,
      }}>
        <Logo size={56} color={accent}/>
        <div style={{textAlign:"center"}}>
          <div style={{
            fontFamily:"Inter,sans-serif", fontWeight:800,
            fontSize:22, letterSpacing:"-0.02em",
            color:"#fff",
            textShadow:`0 0 30px ${accent}60`,
          }}>Greek Anime Mode</div>
          <div style={{
            fontFamily:"Inter,sans-serif", fontWeight:400,
            fontSize:13, color:"#555", marginTop:4,
            letterSpacing:"0.06em", textTransform:"uppercase",
          }}>12-Month Transformation Program</div>
        </div>

        {/* Phase pills */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginTop:4}}>
          {[1,2,3,4].map(ph=>(
            <div key={ph} style={{
              fontFamily:"Inter,sans-serif", fontWeight:600, fontSize:11,
              padding:"4px 10px", borderRadius:20,
              background:`${PHASE_ACCENT[ph]}18`,
              border:`1px solid ${PHASE_ACCENT[ph]}40`,
              color:PHASE_ACCENT[ph],
              letterSpacing:"0.04em",
            }}>
              Ph.{ph} · {PHASE_LABELS[ph]}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display:"flex",gap:0,width:"100%",
          borderTop:`1px solid ${accent}20`,
          marginTop:8, paddingTop:16,
        }}>
          {[["12","Months"],["5","Days/wk"],["0","Equipment"],["4","Phases"]].map(([v,l],i,arr)=>(
            <div key={l} style={{
              flex:1,textAlign:"center",
              borderRight: i<arr.length-1?`1px solid ${accent}15`:"none",
            }}>
              <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:18,color:accent}}>{v}</div>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:10,color:"#444",marginTop:2,letterSpacing:"0.05em",textTransform:"uppercase"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [st, setSt] = useState("in");
  useEffect(()=>{
    const a=setTimeout(()=>setSt("hold"),400);
    const b=setTimeout(()=>setSt("out"),2200);
    const c=setTimeout(()=>onDone(),2800);
    return()=>[a,b,c].forEach(clearTimeout);
  },[]);
  return (
    <div style={{
      position:"fixed",inset:0,background:"#080808",zIndex:999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,
      opacity:st==="out"?0:1,
      transition:st==="out"?"opacity 0.6s ease":"none",
    }}>
      <div style={{
        opacity:st!=="in"?1:0,
        transform:st!=="in"?"scale(1)":"scale(0.75)",
        transition:"opacity 0.55s ease, transform 0.65s cubic-bezier(0.34,1.5,0.64,1)",
      }}>
        <Logo size={72} color="#D4A574"/>
      </div>
      <div style={{
        textAlign:"center",
        opacity:st!=="in"?1:0,
        transform:st!=="in"?"translateY(0)":"translateY(12px)",
        transition:"opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
      }}>
        <div style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:20,letterSpacing:"-0.02em",color:"#fff"}}>
          Greek Anime Mode
        </div>
        <div style={{fontFamily:"Inter,sans-serif",fontWeight:400,fontSize:12,color:"#3a3a3a",marginTop:6,letterSpacing:"0.12em",textTransform:"uppercase"}}>
          12-Month Program
        </div>
      </div>
      <div style={{
        position:"absolute",bottom:48,
        display:"flex",gap:6,
        opacity:st!=="in"?0.4:0,
        transition:"opacity 0.5s ease 0.3s",
      }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:4,height:4,borderRadius:"50%",background:"#D4A574",opacity:i===1?1:0.4}}/>
        ))}
      </div>
    </div>
  );
}

// ── COMPLETION QUOTE ──────────────────────────────────────────────────────────
function CompletionQuote({ accent, show }) {
  const [q] = useState(()=>QUOTES[Math.floor(Math.random()*QUOTES.length)]);
  return (
    <div style={{
      margin:"24px 0 8px",
      padding:"20px 18px",
      borderRadius:14,
      border:`1px solid ${accent}25`,
      background:`${accent}0c`,
      textAlign:"center",
      opacity:show?1:0,
      transform:show?"translateY(0)":"translateY(12px)",
      transition:"opacity 0.6s ease, transform 0.6s ease",
    }}>
      <div style={{fontSize:22,marginBottom:10}}>🔥</div>
      <div style={{
        fontFamily:"Inter,sans-serif",fontWeight:400,
        fontSize:14,color:"#aaa",
        lineHeight:1.7,fontStyle:"italic",
      }}>"{q.text}"</div>
      {q.author && (
        <div style={{
          fontFamily:"Inter,sans-serif",fontWeight:600,
          fontSize:11,color:accent,
          letterSpacing:"0.08em",marginTop:10,textTransform:"uppercase",
        }}>— {q.author}</div>
      )}
    </div>
  );
}

// ── WEIGHT CHART ──────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, accent }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"#111",border:`1px solid ${accent}40`,
      borderRadius:8,padding:"8px 12px",
      fontFamily:"Inter,sans-serif",fontSize:12,
    }}>
      <div style={{color:"#666",fontSize:11}}>{payload[0]?.payload?.label}</div>
      <div style={{color:accent,fontWeight:700,fontSize:15,marginTop:2}}>{payload[0]?.value} kg</div>
    </div>
  );
};

function WeightSection({ accent, allLogs }) {
  const [weightLog, setWeightLog] = useState([]);
  const [inputKg, setInputKg] = useState("");
  const [today] = useState(todayBST);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ loadWeightLog().then(setWeightLog); },[]);

  const addWeight = async () => {
    const kg = parseFloat(inputKg);
    if (isNaN(kg) || kg < 20 || kg > 300) return;
    setSaving(true);
    const existing = weightLog.findIndex(e => e.date === today);
    let newLog;
    if (existing >= 0) {
      newLog = weightLog.map((e,i) => i===existing ? {...e, kg} : e);
    } else {
      newLog = [...weightLog, { date:today, kg }].sort((a,b)=>a.date.localeCompare(b.date));
    }
    setWeightLog(newLog);
    await saveWeightLog(newLog);
    setInputKg("");
    setSaving(false);
  };

  const deleteWeight = async (date) => {
    const newLog = weightLog.filter(e => e.date !== date);
    setWeightLog(newLog);
    await saveWeightLog(newLog);
  };

  const chartData = weightLog.slice(-30).map(e=>({
    date: e.date,
    label: fmtDate(e.date),
    weight: e.kg,
  }));

  const weights = weightLog.map(e=>e.kg);
  const minW = weights.length ? Math.min(...weights) : 60;
  const maxW = weights.length ? Math.max(...weights) : 80;
  const startW = weightLog[0]?.kg;
  const latestW = weightLog[weightLog.length-1]?.kg;
  const diff = (startW && latestW) ? (latestW - startW).toFixed(1) : null;
  const todayEntry = weightLog.find(e=>e.date===today);

  return (
    <div>
      {/* Stats */}
      {weightLog.length > 0 && (
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[
            [latestW?.toFixed(1)+" kg","Current"],
            [startW?.toFixed(1)+" kg","Start"],
            [diff!==null?(diff>0?"+"+diff:diff)+" kg":"—","Change"],
          ].map(([v,l])=>(
            <div key={l} style={{
              flex:1,background:"rgba(255,255,255,0.03)",
              border:`1px solid rgba(255,255,255,0.07)`,
              borderRadius:10,padding:"12px 8px",textAlign:"center",
            }}>
              <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:15,color:diff&&l==="Change"&&parseFloat(diff)<0?accent:"#fff"}}>{v}</div>
              <div style={{fontFamily:"Inter,sans-serif",fontSize:10,color:"#444",marginTop:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div style={{
          background:"rgba(255,255,255,0.02)",
          border:`1px solid rgba(255,255,255,0.06)`,
          borderRadius:12,padding:"16px 8px 8px",
          marginBottom:16,
        }}>
          <div style={{fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,color:"#666",marginBottom:12,paddingLeft:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>
            Weight Progress
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{top:4,right:12,bottom:4,left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false}/>
              <XAxis dataKey="label" tick={{fontFamily:"Inter,sans-serif",fontSize:10,fill:"#444"}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis domain={[minW-2,maxW+2]} tick={{fontFamily:"Inter,sans-serif",fontSize:10,fill:"#444"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip accent={accent}/>}/>
              <Line
                type="monotone" dataKey="weight"
                stroke={accent} strokeWidth={2}
                dot={{fill:accent,r:3,strokeWidth:0}}
                activeDot={{r:5,fill:accent,strokeWidth:0}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Input */}
      <div style={{
        background:"rgba(255,255,255,0.03)",
        border:`1px solid rgba(255,255,255,0.08)`,
        borderRadius:12,padding:16,marginBottom:16,
      }}>
        <div style={{fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:13,color:"#888",marginBottom:12}}>
          {todayEntry ? `Today: ${todayEntry.kg} kg — Update?` : "Log Today's Weight"}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input
            type="number" step="0.1" min="20" max="300"
            value={inputKg}
            onChange={e=>setInputKg(e.target.value)}
            placeholder="e.g. 73.5"
            onKeyDown={e=>e.key==="Enter"&&addWeight()}
            style={{
              flex:1,background:"rgba(255,255,255,0.04)",
              border:`1px solid rgba(255,255,255,0.1)`,
              borderRadius:8,padding:"10px 14px",
              fontFamily:"Inter,sans-serif",fontSize:15,fontWeight:600,
              color:"#fff",outline:"none",
            }}
          />
          <button onClick={addWeight} disabled={saving||!inputKg} style={{
            padding:"10px 18px",borderRadius:8,border:"none",
            background:accent,color:"#080808",
            fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13,
            cursor:"pointer",transition:"opacity 0.15s",
            opacity:inputKg?1:0.4,
            flexShrink:0,
          }}>
            {saving?"...":"Save"}
          </button>
        </div>
      </div>

      {/* Recent entries */}
      {weightLog.length > 0 && (
        <>
          <div style={{fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:11,color:"#333",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>
            Entries
          </div>
          {[...weightLog].reverse().slice(0,10).map(e=>(
            <div key={e.date} style={{
              display:"flex",alignItems:"center",
              padding:"10px 14px",marginBottom:6,
              background:"rgba(255,255,255,0.02)",
              border:`1px solid rgba(255,255,255,0.05)`,
              borderRadius:8,
            }}>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#444"}}>{fmtFull(e.date)}</div>
                <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:16,color:"#ccc",marginTop:2}}>{e.kg} <span style={{fontSize:11,fontWeight:400,color:"#444"}}>kg</span></div>
              </div>
              <button onClick={()=>deleteWeight(e.date)} style={{
                background:"none",border:"none",color:"#2a2a2a",
                cursor:"pointer",fontSize:16,padding:"4px 8px",
                transition:"color 0.15s",
              }} onMouseOver={e=>e.target.style.color="#666"} onMouseOut={e=>e.target.style.color="#2a2a2a"}>
                ×
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes checkPop { 0%{transform:scale(0.6)} 60%{transform:scale(1.25)} 100%{transform:scale(1)} }

  *{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{height:100%;background:#080808;}
  ::-webkit-scrollbar{width:2px;}
  ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px;}

  .app{
    font-family:'Inter',sans-serif;
    background:#080808;color:#d0cbc2;
    min-height:100vh;max-width:430px;
    margin:0 auto;display:flex;flex-direction:column;
  }

  .hdr{padding:20px 20px 0;display:flex;justify-content:space-between;align-items:center;}
  .hdr-l{display:flex;align-items:center;gap:10px;}
  .badge{
    font-family:'Inter',sans-serif;font-weight:600;font-size:10px;
    letter-spacing:0.06em;padding:4px 10px;border-radius:20px;
    border:1px solid;text-transform:uppercase;
  }
  .date-r{
    font-family:'Inter',sans-serif;font-size:11px;font-weight:400;
    color:#444;text-align:right;line-height:1.7;
  }

  .content{flex:1;padding:0 20px 110px;overflow-y:auto;}

  .wk-hdr{margin:24px 0 16px;animation:fadeUp 0.4s ease both;}
  .wk-day{font-family:'Inter',sans-serif;font-weight:500;font-size:11px;color:#444;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;}
  .wk-title{font-family:'Inter',sans-serif;font-weight:800;font-size:34px;letter-spacing:"-0.02em";line-height:1.05;color:#f0ece4;}
  .wk-note{font-family:'Inter',sans-serif;font-weight:500;font-size:12px;color:#555;margin-top:6px;letter-spacing:0.04em;}

  .prog-bar-wrap{margin:18px 0 6px;height:2px;background:#161616;border-radius:2px;position:relative;}
  .prog-bar{height:2px;border-radius:2px;transition:width 0.5s ease;}
  .prog-bar::after{content:'';position:absolute;right:-3px;top:-3px;width:8px;height:8px;border-radius:50%;background:inherit;}
  .prog-txt{font-family:'Inter',sans-serif;font-weight:500;font-size:11px;color:#333;text-align:right;margin-top:6px;}

  .ex-list{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
  .ex-card{
    background:rgba(255,255,255,0.028);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:12px;padding:14px 16px;
    display:flex;align-items:center;gap:14px;
    cursor:pointer;transition:background 0.15s,border-color 0.15s;
    animation:fadeUp 0.35s ease both;position:relative;overflow:hidden;
  }
  .ex-card::before{content:'';position:absolute;left:0;top:15%;bottom:15%;width:3px;border-radius:3px;opacity:0;transition:opacity 0.2s;}
  .ex-card:hover{background:rgba(255,255,255,0.045);}
  .ex-card.done{background:rgba(255,255,255,0.014);border-color:rgba(255,255,255,0.03);}
  .ex-card.done::before{opacity:1;}

  .ex-chk{
    width:22px;height:22px;border-radius:7px;
    border:1.5px solid #282828;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-size:11px;font-weight:700;transition:all 0.15s;
  }
  .ex-card.done .ex-chk{border-color:transparent;animation:checkPop 0.3s ease;}
  .ex-name{font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#ccc8be;transition:color 0.15s;}
  .ex-card.done .ex-name{color:#333;text-decoration:line-through;text-decoration-color:#2a2a2a;}
  .ex-meta{font-family:'Inter',sans-serif;font-size:12px;font-weight:400;color:#454545;margin-top:3px;display:flex;gap:6px;}
  .ex-note{font-family:'Inter',sans-serif;font-size:11px;color:#333;margin-top:3px;}

  .rules-box{
    margin:18px 0;padding:14px 16px;
    background:rgba(255,255,255,0.018);
    border-radius:10px;border-left:2px solid #1e1e1e;
  }
  .rules-box p{font-family:'Inter',sans-serif;font-size:12px;color:"#444";line-height:2.1;color:#3a3a3a;}

  .cmp-btn{
    width:100%;padding:16px;border-radius:12px;border:none;
    font-family:'Inter',sans-serif;font-weight:700;
    font-size:14px;letter-spacing:0.04em;text-transform:uppercase;
    cursor:pointer;transition:all 0.2s;margin-top:20px;
  }
  .cmp-btn:hover{transform:translateY(-1px);filter:brightness(1.08);}
  .cmp-btn.done{background:rgba(255,255,255,0.03);color:#2e2e2e;border:1px solid #181818;}

  .notes-tx{
    margin-top:10px;width:100%;
    background:rgba(255,255,255,0.02);
    border:1px solid #181818;border-radius:10px;
    padding:12px 14px;color:#777;
    font-family:'Inter',sans-serif;font-size:13px;
    resize:none;outline:none;transition:border-color 0.2s;
  }
  .notes-tx:focus{border-color:#2e2e2e;color:#aaa;}
  .notes-tx::placeholder{color:#242424;}

  .empty{text-align:center;padding:72px 20px;color:#2a2a2a;}
  .empty-i{font-size:32px;margin-bottom:16px;opacity:0.3;}
  .empty-t{font-family:'Inter',sans-serif;font-size:13px;font-weight:400;line-height:2;color:#3a3a3a;}

  .bottom-nav{
    position:fixed;bottom:0;left:50%;transform:translateX(-50%);
    width:100%;max-width:430px;
    background:rgba(8,8,8,0.96);backdrop-filter:blur(24px);
    border-top:1px solid rgba(255,255,255,0.06);
    display:flex;padding:10px 0 24px;
  }
  .nav-i{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;padding:6px 0;transition:all 0.2s;opacity:0.28;}
  .nav-i.active{opacity:1;}
  .nav-icon{font-size:18px;line-height:1;}
  .nav-l{font-family:'Inter',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;}

  .sec-hdr{font-family:'Inter',sans-serif;font-weight:700;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;}

  .stat-row{display:flex;gap:8px;margin-bottom:20px;}
  .stat-box{
    flex:1;background:rgba(255,255,255,0.025);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:12px;padding:16px 10px;text-align:center;
  }
  .stat-n{font-family:'Inter',sans-serif;font-weight:800;font-size:28px;line-height:1;}
  .stat-s{font-family:'Inter',sans-serif;font-size:10px;font-weight:500;color:#3e3e3e;margin-top:4px;text-transform:uppercase;letter-spacing:0.07em;}

  .log-row{
    background:rgba(255,255,255,0.022);border:1px solid rgba(255,255,255,0.05);
    border-radius:10px;padding:12px 14px;margin-bottom:7px;
    display:flex;align-items:center;gap:12px;animation:fadeUp 0.3s ease;
  }
  .log-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
  .log-dt{font-family:'Inter',sans-serif;font-size:11px;color:"#555";color:#3e3e3e;}
  .log-tl{font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:#777;margin-top:3px;}
  .log-ck{margin-left:auto;font-size:14px;color:#3a3a3a;}

  .prog-view-hdr{font-family:'Inter',sans-serif;font-weight:800;font-size:24px;color:#eee;margin-bottom:6px;}
  .prog-view-sub{font-family:'Inter',sans-serif;font-size:12px;color:"#555";color:#444;margin-bottom:20px;line-height:1.6;}

  .ph-grp{margin-bottom:28px;}
  .ph-t{font-family:'Inter',sans-serif;font-weight:700;font-size:20px;margin-bottom:10px;display:flex;align-items:center;gap:10px;}
  .ph-sub{font-family:'Inter',sans-serif;font-size:11px;color:#333;font-weight:400;letter-spacing:0.04em;}
  .mo-card{background:rgba(255,255,255,0.022);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin-bottom:7px;}
  .mo-hdr{display:flex;justify-content:space-between;align-items:center;cursor:pointer;}
  .mo-lbl{font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#555;}
  .mo-arr{font-size:11px;color:#333;transition:transform 0.2s;}
  .mo-arr.open{transform:rotate(180deg);}
  .day-row{display:flex;align-items:flex-start;padding:10px 0;border-top:1px solid rgba(255,255,255,0.04);gap:12px;}
  .day-lbl{font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.06em;width:32px;flex-shrink:0;color:#404040;margin-top:2px;text-transform:uppercase;}
  .day-exs{flex:1;}
  .day-wt{font-family:'Inter',sans-serif;font-weight:600;font-size:13px;color:#777;}
  .day-el{font-family:'Inter',sans-serif;font-size:12px;color:#383838;line-height:1.9;margin-top:3px;}
  .rest-d{font-family:'Inter',sans-serif;font-size:11px;color:#252525;padding:8px 0;border-top:1px solid rgba(255,255,255,0.03);letter-spacing:0.06em;text-transform:uppercase;}
  .tag{display:inline-block;font-family:'Inter',sans-serif;font-size:10px;font-weight:500;padding:2px 7px;border-radius:5px;background:rgba(255,255,255,0.04);color:#3e3e3e;margin-left:7px;}

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button{opacity:1;}
`;

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash]   = useState(true);
  const [tab, setTab]         = useState("today");
  const [today]               = useState(todayBST);
  const [log, setLog]         = useState(null);
  const [allLogs, setAllLogs] = useState({});
  const [expanded, setExp]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuote, setShowQ] = useState(false);

  const workout = getWorkoutForDate(today);
  const days    = getDaysSince(today);
  const month   = getProgramMonth(days);
  const phase   = month ? getPhase(month) : 1;
  const accent  = PHASE_ACCENT[phase];

  useEffect(()=>{
    (async()=>{
      const l = await loadLog(today);
      setLog(l||{completed:false,checked:{},notes:""});
      setAllLogs(await loadAllLogs());
      setLoading(false);
    })();
  },[today]);

  const checkedCount = workout?.exercises.filter(e=>log?.checked?.[e.name]).length ?? 0;
  const totalCount   = workout?.exercises.length ?? 0;
  const allDone      = totalCount>0 && checkedCount===totalCount;
  const progress     = totalCount>0 ? checkedCount/totalCount : 0;

  useEffect(()=>{
    if(allDone){const t=setTimeout(()=>setShowQ(true),350);return()=>clearTimeout(t);}
    else setShowQ(false);
  },[allDone]);

  const toggleEx = async name => {
    const n={...log,checked:{...log.checked,[name]:!log.checked[name]}};
    setLog(n); await saveLog(today,n);
  };
  const markDone = async () => {
    const n={...log,completed:!log.completed};
    setLog(n); await saveLog(today,n);
    setAllLogs(p=>({...p,[today]:n}));
  };
  const setNotes = async v => {
    const n={...log,notes:v}; setLog(n); await saveLog(today,n);
  };

  const completedDays = Object.values(allLogs).filter(l=>l.completed).length;
  const logEntries    = Object.entries(allLogs).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,30);

  let streak=0;
  const cd=new Date(today);
  while(true){
    const iso=toISO(cd);
    const dl=allLogs[iso];
    const wd=getDaysSince(iso)%7;
    if(wd===6){cd.setDate(cd.getDate()-1);continue;}
    if(dl?.completed){streak++;cd.setDate(cd.getDate()-1);}else break;
  }

  return (
    <>
      <style>{css}</style>
      {splash && <Splash onDone={()=>setSplash(false)}/>}
      <div className="app">

        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-l">
            <Logo size={30} color={accent}/>
            {month
              ? <span className="badge" style={{color:accent,borderColor:accent+"35",background:accent+"10"}}>
                  Ph.{phase} · {PHASE_LABELS[phase]}
                </span>
              : <span className="badge" style={{color:"#333",borderColor:"#1e1e1e"}}>Not Started</span>
            }
          </div>
          <div className="date-r">
            {new Date(today).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
            {month && <><br/>Month {month} · Week {Math.floor((days%28)/7)+1}</>}
          </div>
        </div>

        <div className="content">

          {/* ─── TODAY ─── */}
          {tab==="today" && (
            <>
              {loading
                ? <div className="empty"><div className="empty-i">·</div><div className="empty-t">Loading...</div></div>
                : workout && workout.exercises.length > 0 ? (
                  <>
                    <div className="wk-hdr">
                      <div className="wk-day">{workout.day} · Today's Session</div>
                      <div className="wk-title">{workout.title}</div>
                      {workout.note && <div className="wk-note">{workout.note}</div>}
                    </div>

                    <div className="prog-bar-wrap">
                      <div className="prog-bar" style={{width:`${progress*100}%`,background:accent}}/>
                    </div>
                    <div className="prog-txt">{checkedCount} / {totalCount} complete</div>

                    <div className="ex-list">
                      {workout.exercises.map((ex,i)=>{
                        const done=!!log?.checked?.[ex.name];
                        return (
                          <div key={ex.name+i} className={`ex-card${done?" done":""}`}
                            style={{animationDelay:`${i*0.04}s`}}
                            onClick={()=>toggleEx(ex.name)}>
                            <style>{`.ex-card.done::before{background:${accent}}`}</style>
                            <div className="ex-chk" style={done?{background:accent,color:"#080808"}:{}}>
                              {done && "✓"}
                            </div>
                            <div style={{flex:1}}>
                              <div className="ex-name">{ex.name}</div>
                              <div className="ex-meta">
                                {ex.sets && <span>{ex.sets} sets</span>}
                                {ex.sets && ex.reps && <span>·</span>}
                                {ex.reps && <span>{ex.reps}</span>}
                              </div>
                              {ex.note && <div className="ex-note">{ex.note}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {allDone && <CompletionQuote accent={accent} show={showQuote}/>}

                    <div className="rules-box">
                      <p>
                        Tempo: 2s down — 1s pause — 1s up<br/>
                        Rest: 45s compounds · 30s core · 60–90s circuits<br/>
                        Stop 1–2 reps before failure
                      </p>
                    </div>

                    <button className={`cmp-btn${log?.completed?" done":""}`}
                      style={!log?.completed?{background:accent,color:"#080808"}:{}}
                      onClick={markDone}>
                      {log?.completed ? "✓  Workout Logged" : "Mark Complete"}
                    </button>
                    <textarea className="notes-tx" rows={3}
                      placeholder="Notes, PRs, how you felt..."
                      value={log?.notes??""} onChange={e=>setNotes(e.target.value)}/>
                  </>
                ):(
                  <div className="empty">
                    <div className="empty-i">◌</div>
                    <div className="empty-t">
                      {days<0?"Program starts\nFeb 16, 2026":days>=336?"12 months done.\nYou earned it.":"Rest day.\nRecover. Sleep. Repeat."}
                    </div>
                  </div>
                )
              }
            </>
          )}

          {/* ─── LOG ─── */}
          {tab==="history" && (
            <div style={{paddingTop:22,animation:"fadeUp 0.4s ease"}}>
              {/* Streak stats */}
              <div className="stat-row">
                {[[streak,"Streak"],[completedDays,"Workouts"],[month??0,"Month"]].map(([v,l])=>(
                  <div className="stat-box" key={l}>
                    <div className="stat-n" style={{color:accent}}>{v}</div>
                    <div className="stat-s">{l}</div>
                  </div>
                ))}
              </div>

              {/* Weight section */}
              <div className="sec-hdr">Weight Log</div>
              <WeightSection accent={accent} allLogs={allLogs}/>

              {/* Workout log */}
              <div className="sec-hdr" style={{marginTop:24}}>Workout History</div>
              {logEntries.length===0
                ? <div className="empty"><div className="empty-i">◌</div><div className="empty-t">No sessions logged yet.</div></div>
                : logEntries.map(([date,l])=>{
                    const w=getWorkoutForDate(date);
                    const ph=getProgramMonth(getDaysSince(date));
                    const pa=ph?PHASE_ACCENT[getPhase(ph)]:"#333";
                    return(
                      <div className="log-row" key={date}>
                        <div className="log-dot" style={{background:l.completed?pa:"#1e1e1e"}}/>
                        <div style={{flex:1}}>
                          <div className="log-dt">{fmtFull(date)}</div>
                          <div className="log-tl">{w?.title??"Rest"}</div>
                          {l.notes&&<div style={{fontFamily:"Inter,sans-serif",fontSize:11,color:"#2e2e2e",marginTop:3}}>{l.notes.substring(0,60)}</div>}
                        </div>
                        <div className="log-ck">{l.completed?"✓":"·"}</div>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ─── PROGRAM ─── */}
          {tab==="program" && (
            <div style={{animation:"fadeUp 0.4s ease"}}>
              <ProgramHero accent={accent}/>

              {[1,2,3,4].map(ph=>{
                const info=[["M1–3","Foundation"],["M4–6","Build & Shape"],["M7–9","Aesthetic Athlete"],["M10–12","Greek Anime Mode"]][ph-1];
                return(
                  <div className="ph-grp" key={ph}>
                    <div className="ph-t" style={{color:PHASE_ACCENT[ph]}}>
                      Phase {ph} <span className="ph-sub">{info[0]} · {info[1]}</span>
                    </div>
                    {[1,2,3].map(mi=>{
                      const mNum=(ph-1)*3+mi;
                      const mData=WORKOUTS[`m${mNum}`];
                      const isOpen=expanded===`${ph}-${mi}`;
                      return(
                        <div className="mo-card" key={mNum}>
                          <div className="mo-hdr" onClick={()=>setExp(isOpen?null:`${ph}-${mi}`)}>
                            <span className="mo-lbl">Month {mNum}</span>
                            <span className={`mo-arr${isOpen?" open":""}`}>▾</span>
                          </div>
                          {isOpen&&mData&&(
                            <div style={{marginTop:12}}>
                              {Object.entries(mData).map(([dow,w])=>
                                !w.exercises.length
                                  ?<div className="rest-d" key={dow}>{w.day} · Rest</div>
                                  :(
                                    <div className="day-row" key={dow}>
                                      <div className="day-lbl">{w.day}</div>
                                      <div className="day-exs">
                                        <div className="day-wt">
                                          {w.title}
                                          {w.note&&<span className="tag">{w.note}</span>}
                                        </div>
                                        <div className="day-el">
                                          {w.exercises.map(ex=>(
                                            <div key={ex.name}>
                                              {ex.name}{ex.sets?` ${ex.sets}×${ex.reps}`:ex.reps?` ${ex.reps}`:""}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* NAV */}
        <nav className="bottom-nav">
          {[
            {id:"today",icon:"◉",label:"Today"},
            {id:"history",icon:"◫",label:"Log"},
            {id:"program",icon:"≡",label:"Program"},
          ].map(({id,icon,label})=>(
            <div key={id} className={`nav-i${tab===id?" active":""}`}
              style={tab===id?{color:accent}:{}}
              onClick={()=>setTab(id)}>
              <div className="nav-icon">{icon}</div>
              <div className="nav-l">{label}</div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}

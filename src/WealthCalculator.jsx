import { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

/* ─── CURRENCIES ─────────────────────────────────────── */
const CURRENCIES = [
  { code:"USD", symbol:"$",  name:"US Dollar",         locale:"en-US", m:1      },
  { code:"EUR", symbol:"€",  name:"Euro",              locale:"de-DE", m:0.92   },
  { code:"GBP", symbol:"£",  name:"British Pound",     locale:"en-GB", m:0.79   },
  { code:"IDR", symbol:"Rp", name:"Indonesian Rupiah", locale:"id-ID", m:15850  },
  { code:"JPY", symbol:"¥",  name:"Japanese Yen",      locale:"ja-JP", m:149    },
  { code:"SGD", symbol:"S$", name:"Singapore Dollar",  locale:"en-SG", m:1.35   },
  { code:"INR", symbol:"₹",  name:"Indian Rupee",      locale:"en-IN", m:83     },
  { code:"AUD", symbol:"A$", name:"Australian Dollar", locale:"en-AU", m:1.53   },
];

/* ─── MATH ─────────────────────────────────────────── */
function calcFV(P, PMT, rAnnual, years) {
  const r = rAnnual / 100 / 12, n = years * 12;
  if (r === 0) return P + PMT * n;
  return P * Math.pow(1+r,n) + PMT * ((Math.pow(1+r,n)-1)/r);
}
function calcInflation(value, inflationRate, years) {
  return value / Math.pow(1 + inflationRate/100, years);
}

/* ─── FORMATTING ─────────────────────────────────────── */
function fmt(value, cur, compact=false) {
  const v = Math.round(value * cur.m);
  if (compact) {
    if (Math.abs(v) >= 1e12) return cur.symbol+(v/1e12).toFixed(1)+"T";
    if (Math.abs(v) >= 1e9)  return cur.symbol+(v/1e9).toFixed(1)+"B";
    if (Math.abs(v) >= 1e6)  return cur.symbol+(v/1e6).toFixed(1)+"M";
    if (Math.abs(v) >= 1e3)  return cur.symbol+(v/1e3).toFixed(0)+"K";
    return cur.symbol+v.toLocaleString();
  }
  try {
    return new Intl.NumberFormat(cur.locale,{style:"currency",currency:cur.code,maximumFractionDigits:0}).format(v);
  } catch { return cur.symbol+v.toLocaleString(); }
}

/* ─── COLORS ─────────────────────────────────────────── */
const INDIGO  = "#4F46E5";
const DARK    = "#0D0A2E";
const DARK2   = "#1C1752";
const LAV     = "#EEF2FF";
const BORDER  = "#DDD6FE";
const MUTED   = "#64748B";
const TEXT    = "#0F172A";
const VIOLET  = "#7C3AED";
const AMBER   = "#F59E0B";

/* ─── SVG FLOWERS ────────────────────────────────────── */
function Flower({ x, y, size=1, opacity=1, rotate=0, color="#9333EA" }) {
  const petals = 6;
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${size})`} opacity={opacity}>
      {Array.from({length:petals},(_,i)=>{
        const angle = (i/petals)*360;
        return (
          <ellipse key={i}
            cx={Math.cos((angle-90)*Math.PI/180)*14}
            cy={Math.sin((angle-90)*Math.PI/180)*14}
            rx={7} ry={13} fill={color} fillOpacity={0.65}
            transform={`rotate(${angle},${Math.cos((angle-90)*Math.PI/180)*14},${Math.sin((angle-90)*Math.PI/180)*14})`}
          />
        );
      })}
      <circle cx={0} cy={0} r={9} fill="#FDE68A" fillOpacity={0.9}/>
      <circle cx={0} cy={0} r={5} fill="#F59E0B" fillOpacity={0.8}/>
    </g>
  );
}
function FloralStem({ x, y, height=80 }) {
  return (
    <g>
      <path d={`M${x} ${y+height} Q${x-12} ${y+height*0.6} ${x} ${y+height*0.3} Q${x+10} ${y+height*0.15} ${x} ${y}`}
        stroke="#4C1D95" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
      <ellipse cx={x-16} cy={y+height*0.55} rx={10} ry={6} fill="#7C3AED" fillOpacity={0.45} transform={`rotate(-30,${x-16},${y+height*0.55})`}/>
      <ellipse cx={x+14} cy={y+height*0.35} rx={9} ry={5} fill="#A78BFA" fillOpacity={0.45} transform={`rotate(20,${x+14},${y+height*0.35})`}/>
    </g>
  );
}

/* ─── HERO BACKGROUND ────────────────────────────────── */
function HeroGardenBottom() {
  return (
    <svg style={{position:"absolute",bottom:0,left:0,width:"100%",height:220,pointerEvents:"none"}} viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice">
      <path d="M0 220 Q300 160 600 200 Q900 240 1200 180 L1200 220 Z" fill="#F5F4FF" opacity="0.08"/>
      <FloralStem x={80}   y={90}  height={100}/>
      <Flower x={80}  y={78}  size={1.7} color="#9333EA" opacity={0.85} rotate={10}/>
      <FloralStem x={130}  y={110} height={80}/>
      <Flower x={130} y={100} size={1.1} color="#A855F7" opacity={0.7} rotate={-15}/>
      <Flower x={170} y={130} size={0.7} color="#C084FC" opacity={0.55} rotate={35}/>
      <FloralStem x={240}  y={130} height={65}/>
      <Flower x={240} y={122} size={0.85} color="#7C3AED" opacity={0.6} rotate={20}/>

      <FloralStem x={960}  y={95}  height={100}/>
      <Flower x={960} y={83}  size={1.8} color="#8B5CF6" opacity={0.85} rotate={-12}/>
      <FloralStem x={1010} y={115} height={80}/>
      <Flower x={1010} y={105} size={1.2} color="#A855F7" opacity={0.7} rotate={25}/>
      <Flower x={920} y={140} size={0.75} color="#C4B5FD" opacity={0.5} rotate={-40}/>
      <FloralStem x={1080} y={130} height={65}/>
      <Flower x={1080} y={122} size={0.9} color="#7C3AED" opacity={0.6} rotate={15}/>

      <FloralStem x={550}  y={115} height={85}/>
      <Flower x={550} y={103} size={1.4} color="#D946EF" opacity={0.7} rotate={5}/>
      <FloralStem x={610}  y={130} height={60}/>
      <Flower x={610} y={122} size={0.85} color="#A855F7" opacity={0.55} rotate={30}/>
      <FloralStem x={490}  y={135} height={60}/>
      <Flower x={490} y={127} size={0.8} color="#9333EA" opacity={0.55} rotate={-25}/>

      <path d="M0 200 Q200 170 400 185 Q600 200 800 178 Q1000 160 1200 175 L1200 220 L0 220 Z" fill="#0D0A2E" opacity="0.6"/>
    </svg>
  );
}

/* ─── ANIMATED ORB ───────────────────────────────────── */
function GlowOrb({ style }) {
  return <div style={{ position:"absolute", borderRadius:"50%", pointerEvents:"none", ...style }} />;
}

/* ─── COUNTER ANIMATION ──────────────────────────────── */
function AnimatedValue({ value, currency }) {
  const [displayed, setDisplayed] = useState(value);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const fromRef  = useRef(value);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const from = fromRef.current;
    const to   = value;
    const duration = 600;
    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * ease);
      setDisplayed(cur);
      if (t < 1) frameRef.current = requestAnimationFrame(animate);
      else fromRef.current = to;
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <span>{fmt(displayed, currency)}</span>;
}

/* ─── CUSTOM TOOLTIP ─────────────────────────────────── */
function DarkTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:DARK2,borderRadius:14,padding:"12px 18px",minWidth:170,boxShadow:"0 16px 40px rgba(79,70,229,.35)",maxWidth:220}}>
      <p style={{margin:"0 0 8px",color:"#A5B4FC",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Year {label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{margin:"2px 0",fontSize:13,fontWeight:600,color:p.color||"white",fontVariantNumeric:"tabular-nums"}}>
          <span style={{color:"#94A3B8",fontWeight:500}}>{p.name}: </span>
          {typeof p.value==="number" ? fmt(p.value,currency) : p.value}
        </p>
      ))}
    </div>
  );
}
function BarTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:DARK2,borderRadius:14,padding:"12px 18px",boxShadow:"0 16px 40px rgba(79,70,229,.35)",maxWidth:230}}>
      <p style={{margin:"0 0 8px",color:"#A5B4FC",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Year {label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{margin:"2px 0",fontSize:13,fontWeight:600,color:"white",fontVariantNumeric:"tabular-nums"}}>
          <span style={{color:p.fill,fontWeight:600}}>{p.name}: </span>
          {fmt(p.value,currency)}
        </p>
      ))}
    </div>
  );
}

/* ─── EDITABLE SLIDER ────────────────────────────────── */
function EditableSlider({ label, value, min, max, step, onChange, prefix="", suffix="" }) {
  const [localStr, setLocalStr] = useState(String(value));
  const [focused, setFocused]   = useState(false);

  useEffect(() => {
    if (!focused) setLocalStr(step < 1 ? value.toFixed(1) : String(Math.round(value)));
  }, [value, focused, step]);

  const commit = (str) => {
    const n = parseFloat(str);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    setFocused(false);
  };

  const pct = ((value-min)/(max-min))*100;
  const dispMin = prefix + (step < 1 ? min.toFixed(1) : min.toLocaleString()) + suffix;
  const dispMax = prefix + (step < 1 ? max.toFixed(1) : max.toLocaleString()) + suffix;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <span style={{fontSize:11,fontWeight:700,color:MUTED,letterSpacing:"0.08em",textTransform:"uppercase",flexShrink:0}}>{label}</span>
        <div style={{
          display:"flex",alignItems:"center",gap:3,
          background: focused ? "white" : LAV,
          border: focused ? `1.5px solid ${INDIGO}` : "1.5px solid transparent",
          borderRadius:10,padding:"4px 10px",
          boxShadow: focused ? `0 0 0 3px rgba(79,70,229,0.15)` : "none",
          transition:"all .18s",cursor:"text",
        }}>
          {prefix && <span style={{fontSize:14,fontWeight:700,color:focused?INDIGO:"#818CF8",lineHeight:1,flexShrink:0}}>{prefix}</span>}
          <input
            type="number"
            value={focused ? localStr : (step < 1 ? value.toFixed(1) : Math.round(value))}
            min={min} max={max} step={step}
            onFocus={() => { setFocused(true); setLocalStr(step < 1 ? value.toFixed(1) : String(Math.round(value))); }}
            onChange={e => {
              setLocalStr(e.target.value);
              const n = parseFloat(e.target.value);
              if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
            }}
            onBlur={e => commit(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter") { e.target.blur(); commit(localStr); } }}
            style={{
              border:"none",background:"transparent",
              fontSize:16,fontWeight:800,color:TEXT,
              width:`${Math.max(3,String(Math.round(value)).length)+2}ch`,
              maxWidth:120,
              outline:"none",fontFamily:"inherit",
              MozAppearance:"textfield",
              WebkitAppearance:"none",
              textAlign:"right",
            }}
          />
          {suffix && <span style={{fontSize:14,fontWeight:700,color:focused?INDIGO:"#818CF8",lineHeight:1,flexShrink:0}}>{suffix}</span>}
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{background:`linear-gradient(to right,${INDIGO} ${pct}%,#DDD6FE ${pct}%)`}}
      />
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:10,color:"#C4B5FD"}}>{dispMin}</span>
        <span style={{fontSize:10,color:"#C4B5FD"}}>{dispMax}</span>
      </div>
    </div>
  );
}

/* ─── CARD ───────────────────────────────────────────── */
function Card({ children, style={} }) {
  return (
    <div style={{background:"white",borderRadius:32,border:`1px solid ${BORDER}`,boxShadow:"0 20px 60px rgba(79,70,229,.09),0 2px 12px rgba(0,0,0,.04)",overflow:"hidden",...style}}>
      {children}
    </div>
  );
}
function SectionLabel({ tag, title, sub }) {
  return (
    <div style={{marginBottom:20}}>
      <span style={{display:"inline-block",fontSize:10,fontWeight:700,color:INDIGO,letterSpacing:"0.14em",textTransform:"uppercase",background:LAV,padding:"4px 12px",borderRadius:999,marginBottom:8}}>{tag}</span>
      <h3 style={{margin:"0 0 4px",fontSize:20,fontWeight:800,color:TEXT,letterSpacing:"-0.01em"}}>{title}</h3>
      {sub && <p style={{margin:0,fontSize:13,color:MUTED,lineHeight:1.6}}>{sub}</p>}
    </div>
  );
}
function StatPill({ label, value, green, featured }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,minWidth:0}}>
      <span style={{fontSize:10,fontWeight:700,color:"#818CF8",letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>
      <span style={{
        fontSize: featured ? "clamp(15px,2.5vw,22px)" : "clamp(13px,2vw,16px)",
        fontWeight:800,
        color: green ? "#6EE7B7" : "white",
        fontVariantNumeric:"tabular-nums",
        wordBreak:"break-all",
        lineHeight:1.2,
      }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════ */
export default function BloomCalculator() {
  const [initial,  setInitial]  = useState(6700);
  const [monthly,  setMonthly]  = useState(2650);
  const [rate,     setRate]     = useState(5.5);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [inflation, setInflation] = useState(3.0);
  const [activeTab, setActiveTab] = useState(0);

  const growthData = useMemo(()=>
    Array.from({length:31},(_,y)=>({
      year: y,
      value:     Math.round(calcFV(initial,monthly,rate,y)),
      principal: Math.round(initial + monthly*y*12),
      real:      Math.round(calcInflation(calcFV(initial,monthly,rate,y),inflation,y)),
    })),[initial,monthly,rate,inflation]);

  const breakdownData = useMemo(()=>
    [5,10,15,20,25,30].map(y=>({
      year: y,
      principal: Math.round(initial + monthly*y*12),
      interest:  Math.round(Math.max(0,calcFV(initial,monthly,rate,y)-(initial+monthly*y*12))),
    })),[initial,monthly,rate]);

  const doublingData = useMemo(()=>
    [2,3,4,5,6,7,8,9,10,11,12].map(r=>({
      rate: r, years: parseFloat((72/r).toFixed(1)), label:`${r}%`,
    })),[]);

  const projected   = growthData[30].value;
  const contributed = initial + monthly*360;
  const netGain     = Math.max(0, projected - contributed);
  const realValue   = growthData[30].real;
  const multiple    = contributed>0 ? (projected/contributed).toFixed(2) : "—";

  const tabs = ["Compound Growth","Principal vs Interest","Rule of 72"];

  return (
    <div style={{minHeight:"100vh",background:"#F5F4FF",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .serif { font-family:'DM Serif Display',Georgia,serif; }
        input[type=range]{-webkit-appearance:none;appearance:none;height:5px;border-radius:999px;outline:none;cursor:pointer;display:block;width:100%;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${INDIGO};cursor:grab;box-shadow:0 2px 12px rgba(79,70,229,.5);transition:transform .15s,box-shadow .15s;}
        input[type=range]:hover::-webkit-slider-thumb{transform:scale(1.13);box-shadow:0 4px 18px rgba(79,70,229,.55);}
        input[type=range]:active::-webkit-slider-thumb{cursor:grabbing;transform:scale(1.2);}
        input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${INDIGO};border:none;}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;}
        select{-webkit-appearance:none;appearance:none;}
        .tab-btn{border:none;cursor:pointer;font-family:inherit;transition:all .18s;border-radius:999px;font-weight:600;font-size:13px;}
        .tab-btn.active{background:${DARK2};color:white;box-shadow:0 4px 16px rgba(28,23,82,.25);}
        .tab-btn.inactive{background:transparent;color:${MUTED};}
        .tab-btn.inactive:hover{background:#EEF2FF;color:${TEXT};}

        @keyframes drift1{0%,100%{transform:translate(0px,0px) scale(1);}50%{transform:translate(35px,-25px) scale(1.08);}}
        @keyframes drift2{0%,100%{transform:translate(0px,0px) scale(1);}50%{transform:translate(-28px,20px) scale(1.05);}}
        @keyframes drift3{0%,100%{transform:translate(0px,0px) scale(1);}50%{transform:translate(20px,30px) scale(1.1);}}
        @keyframes floatFlowers{0%,100%{transform:translateY(0px);}50%{transform:translateY(-8px);}}
        @keyframes glowPulse{0%,100%{opacity:0.55;transform:scale(1);}50%{opacity:0.8;transform:scale(1.04);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0px);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes shimmer{0%,100%{opacity:1;}50%{opacity:0.88;}}
        @keyframes ringPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.18;}50%{transform:translate(-50%,-50%) scale(1.12);opacity:0.1;}}
        @keyframes ringPulse2{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.1;}50%{transform:translate(-50%,-50%) scale(1.2);opacity:0.06;}}

        .hero-fade-1{animation:fadeUp .7s ease forwards;}
        .hero-fade-2{animation:fadeUp .7s .15s ease both;}
        .hero-fade-3{animation:fadeUp .7s .3s ease both;}
        .hero-fade-4{animation:fadeUp .7s .45s ease both;}
        .hero-fade-5{animation:fadeUp .7s .6s ease both;}
        .flowers-float{animation:floatFlowers 5s ease-in-out infinite;}

        @media(max-width:640px){
          .nav-name{font-size:12px!important;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
          .card-body{padding:18px!important;}
          .card-head{padding:20px 18px 12px!important;}
          .hero-val{font-size:clamp(32px,12vw,72px)!important;}
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(13,10,46,0.92)",backdropFilter:"blur(20px) saturate(1.8)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:1080,margin:"0 auto",padding:"0 28px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#7C3AED,#4F46E5)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 14px rgba(124,58,237,.4)"}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16 6.2V11.8L9 16L2 11.8V6.2L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2.5" fill="white" opacity=".9"/>
              </svg>
            </div>
            <span style={{fontWeight:700,fontSize:15,color:"white",letterSpacing:"-0.02em"}}>Bloom</span>
          </div>
          <span style={{fontSize:12,color:"rgba(165,180,252,0.7)",fontWeight:500,display:"flex",alignItems:"center",gap:7}}>
            <span style={{width:5,height:5,background:"#A78BFA",borderRadius:"50%",display:"inline-block"}}/>
            Personal Financial Calculator
            <span style={{width:5,height:5,background:"#A78BFA",borderRadius:"50%",display:"inline-block"}}/>
          </span>
          <span className="nav-name" style={{fontSize:13,fontWeight:600,color:"#A78BFA",letterSpacing:"0.01em",fontStyle:"italic"}}>
            Kenvara Solivo Lwie
          </span>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section style={{position:"relative",background:`linear-gradient(170deg, ${DARK} 0%, #150E3E 55%, #1E1060 100%)`,overflow:"hidden",minHeight:640,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingBottom:120}}>

        {/* Animated background orbs */}
        <GlowOrb style={{width:500,height:500,top:"10%",left:"5%",background:"radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 70%)",animation:"drift1 12s ease-in-out infinite"}}/>
        <GlowOrb style={{width:400,height:400,top:"-5%",right:"8%",background:"radial-gradient(circle,rgba(79,70,229,.16) 0%,transparent 70%)",animation:"drift2 15s ease-in-out infinite"}}/>
        <GlowOrb style={{width:300,height:300,bottom:"20%",left:"30%",background:"radial-gradient(circle,rgba(217,70,239,.12) 0%,transparent 70%)",animation:"drift3 18s ease-in-out infinite"}}/>

        {/* Pulse rings behind counter */}
        <div style={{position:"absolute",top:"50%",left:"50%",width:380,height:380,borderRadius:"50%",border:"1px solid rgba(167,139,250,0.25)",animation:"ringPulse 4s ease-in-out infinite",zIndex:1}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",width:520,height:520,borderRadius:"50%",border:"1px solid rgba(167,139,250,0.12)",animation:"ringPulse2 4s 1s ease-in-out infinite",zIndex:1}}/>

        {/* Star dots */}
        {[[12,8],[88,5],[25,18],[72,12],[50,3],[35,22],[65,7],[80,20]].map(([lp,tp],i)=>(
          <div key={i} style={{position:"absolute",left:`${lp}%`,top:`${tp}%`,width:i%3===0?3:2,height:i%3===0?3:2,borderRadius:"50%",background:"rgba(196,181,253,0.5)",pointerEvents:"none"}}/>
        ))}

        {/* Main hero content */}
        <div style={{position:"relative",zIndex:5,textAlign:"center",padding:"0 24px",display:"flex",flexDirection:"column",alignItems:"center"}}>

          {/* Eyebrow pill */}
          <div className="hero-fade-1" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(124,58,237,0.25)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:999,padding:"7px 18px",marginBottom:32}}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              {Array.from({length:6},(_,i)=>{
                const a=(i/6)*360;
                return <ellipse key={i} cx={Math.cos((a-90)*Math.PI/180)*5.5} cy={Math.sin((a-90)*Math.PI/180)*5.5} rx="2.8" ry="5" fill="#C084FC" fillOpacity=".8" transform={`rotate(${a},${Math.cos((a-90)*Math.PI/180)*5.5},${Math.sin((a-90)*Math.PI/180)*5.5})`}/>;
              })}
              <circle cx="0" cy="0" r="3" fill="#FDE68A"/>
            </svg>
            <span style={{fontSize:11,fontWeight:700,color:"#C4B5FD",letterSpacing:"0.12em",textTransform:"uppercase"}}>Compound Interest Calculator</span>
          </div>

          {/* Headline */}
          <div className="hero-fade-2">
            <h1 className="serif" style={{fontSize:"clamp(52px,9vw,92px)",color:"white",lineHeight:1.0,margin:"0 0 4px",letterSpacing:"-0.03em",fontWeight:400}}>
              Watch your money
            </h1>
            <h1 className="serif" style={{
              fontSize:"clamp(58px,10vw,108px)",
              lineHeight:1.0,margin:"0 0 28px",letterSpacing:"-0.03em",
              fontStyle:"italic",fontWeight:400,
              background:"linear-gradient(125deg,#FDE68A 0%,#F59E0B 40%,#FCD34D 70%,#FDE68A 100%)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text",
            }}>
              bloom.
            </h1>
          </div>

          {/* Live projected value */}
          <div className="hero-fade-3" style={{marginBottom:40,padding:"28px 40px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:28,backdropFilter:"blur(12px)",minWidth:340,maxWidth:520}}>
            <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:"#818CF8",letterSpacing:"0.14em",textTransform:"uppercase"}}>
              Your 30-year projection
            </p>
            <div className="hero-val" style={{
              fontSize:"clamp(38px,7vw,72px)",
              fontWeight:800,
              fontVariantNumeric:"tabular-nums",
              letterSpacing:"-0.02em",
              background:"linear-gradient(135deg,#FDE68A,#F59E0B,#FCD34D)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text",
              animation:"shimmer 3s ease-in-out infinite",
              lineHeight:1.1,marginBottom:10,
            }}>
              <AnimatedValue value={projected} currency={currency}/>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"rgba(196,181,253,0.8)",fontWeight:500}}>
                💰 <span style={{color:"#A5B4FC"}}>Contributed:</span> {fmt(contributed,currency,true)}
              </span>
              <span style={{fontSize:12,color:"rgba(196,181,253,0.8)",fontWeight:500}}>
                ✦ <span style={{color:"#6EE7B7"}}>Earned:</span> +{fmt(netGain,currency,true)}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="hero-fade-4" style={{color:"rgba(196,181,253,0.75)",fontSize:16,maxWidth:440,margin:"0 0 36px",lineHeight:1.8}}>
            Adjust the controls below to model your personal wealth trajectory — including real purchasing power after inflation.
          </p>

          {/* Scroll CTA */}
          <div className="hero-fade-5" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,color:"rgba(167,139,250,0.6)",fontSize:12,fontWeight:600,letterSpacing:"0.05em"}}>
            <span>Scroll to explore</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{animation:"floatFlowers 2s ease-in-out infinite"}}>
              <path d="M5 8L10 13L15 8" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Floating garden at bottom */}
        <div className="flowers-float" style={{position:"absolute",bottom:0,left:0,right:0,zIndex:4}}>
          <HeroGardenBottom/>
        </div>

        {/* Gradient fade to light bg */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(to bottom,transparent,#F5F4FF)",zIndex:6,pointerEvents:"none"}}/>
      </section>

      {/* ── EXPLAINER CARDS ───────────────────────────────── */}
      <section style={{maxWidth:1080,margin:"48px auto 32px",padding:"0 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14}}>
          {[
            { icon:"🌱", title:"The Power of Compounding", text:"You earn interest on your interest. A small difference in annual rate creates enormous differences over decades — start early." },
            { icon:"📅", title:"Why Monthly Contributions", text:"Regular deposits harness dollar-cost averaging and extend compounding. Monthly additions can dwarf your initial lump sum over 20–30 years." },
            { icon:"📉", title:"Inflation Erodes Real Value", text:"Future wealth is reduced by inflation. $1M in 30 years may only buy what $400K buys today — this calculator shows both." },
            { icon:"⚡", title:"Rule of 72", text:"Divide 72 by your annual growth rate to estimate doubling time. At 6%, your portfolio doubles every 12 years. At 12%, every 6 years." },
          ].map(({icon,title,text})=>(
            <div key={title} style={{background:"white",borderRadius:22,padding:"20px 22px",border:`1px solid ${BORDER}`,boxShadow:"0 4px 20px rgba(79,70,229,.05)",transition:"box-shadow .2s,transform .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(79,70,229,.12)";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(79,70,229,.05)";e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{fontSize:24,marginBottom:10}}>{icon}</div>
              <h4 style={{margin:"0 0 7px",fontSize:14,fontWeight:700,color:TEXT}}>{title}</h4>
              <p style={{margin:0,fontSize:13,color:MUTED,lineHeight:1.7}}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTROLS CARD ─────────────────────────────────── */}
      <section style={{maxWidth:1080,margin:"0 auto 32px",padding:"0 20px"}}>
        <Card>
          <div className="card-head" style={{padding:"26px 32px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,borderBottom:"1px solid #F1F5F9"}}>
            <div>
              <span style={{display:"block",fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:3}}>Wealth Projection Tool</span>
              <h2 style={{margin:0,fontSize:19,fontWeight:800,color:TEXT,letterSpacing:"-0.01em"}}>Configure Your Scenario</h2>
              <p style={{margin:"4px 0 0",fontSize:12,color:MUTED}}>Click any value to type an exact number</p>
            </div>
            {/* Currency selector */}
            <div style={{position:"relative",flexShrink:0}}>
              <select value={currency.code} onChange={e=>setCurrency(CURRENCIES.find(c=>c.code===e.target.value))}
                style={{background:"#F8FAFC",border:`1px solid ${BORDER}`,borderRadius:12,padding:"8px 36px 8px 13px",fontSize:13,fontWeight:600,color:"#334155",cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
                {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
              </select>
              <svg style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="11" height="7" viewBox="0 0 11 7" fill="none">
                <path d="M1 1L5.5 6L10 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="card-body" style={{padding:"24px 32px 30px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"24px 40px"}}>
            <EditableSlider label="Initial Deposit"      value={initial}   min={0}   max={100000} step={100}  onChange={setInitial}   prefix={currency.symbol}/>
            <EditableSlider label="Monthly Contribution" value={monthly}   min={0}   max={10000}  step={50}   onChange={setMonthly}   prefix={currency.symbol}/>
            <EditableSlider label="Annual Growth Rate"   value={rate}      min={0}   max={20}     step={0.1}  onChange={setRate}      suffix="%"/>
            <EditableSlider label="Expected Inflation"   value={inflation} min={0}   max={12}     step={0.1}  onChange={setInflation} suffix="%"/>
          </div>
        </Card>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────── */}
      <section style={{maxWidth:1080,margin:"0 auto 32px",padding:"0 20px"}}>
        <div style={{background:`linear-gradient(135deg,${DARK} 0%,${DARK2} 100%)`,borderRadius:28,padding:"24px 30px",boxShadow:"0 20px 60px rgba(13,10,46,.25)"}}>
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:"18px 22px"}}>
            <StatPill label="Projected Value (30Y)"       value={fmt(projected,currency,true)}  featured/>
            <StatPill label="Total Contributed"           value={fmt(contributed,currency,true)}/>
            <StatPill label="Net Interest Earned"         value={`+${fmt(netGain,currency,true)}`} green/>
            <StatPill label="Growth Multiple"             value={`${multiple}×`}                green/>
            <StatPill label="Real Value (Inflation adj.)" value={fmt(realValue,currency,true)}/>
          </div>
          <p style={{margin:"14px 0 0",fontSize:11,color:"rgba(99,102,241,0.8)",lineHeight:1.5}}>
            * Nominal values assume monthly compounding. Real value adjusts for {inflation.toFixed(1)}% annual inflation. Display values shown in {currency.code}.
          </p>
        </div>
      </section>

      {/* ── GRAPH TABS ─────────────────────────────────────── */}
      <section style={{maxWidth:1080,margin:"0 auto 72px",padding:"0 20px",display:"flex",flexDirection:"column",gap:22}}>
        <div style={{display:"flex",gap:8,background:"white",borderRadius:999,padding:6,border:`1px solid ${BORDER}`,width:"fit-content",flexWrap:"wrap",boxShadow:"0 4px 16px rgba(79,70,229,.07)"}}>
          {tabs.map((t,i)=>(
            <button key={t} className={`tab-btn ${i===activeTab?"active":"inactive"}`} onClick={()=>setActiveTab(i)} style={{padding:"8px 20px"}}>{t}</button>
          ))}
        </div>

        {/* Chart 1 */}
        {activeTab===0 && (
          <Card>
            <div className="card-head" style={{padding:"26px 30px 10px"}}>
              <SectionLabel
                tag="Chart 1 of 3"
                title="Compound Growth vs Inflation-Adjusted Value"
                sub={`Nominal growth at ${rate.toFixed(1)}% annual rate versus real purchasing power eroded by ${inflation.toFixed(1)}% inflation. The gap between lines is the invisible cost of inflation.`}
              />
            </div>
            <div style={{padding:"8px 16px 8px",height:300}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{top:10,right:28,left:4,bottom:0}}>
                  <defs>
                    <linearGradient id="gNom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={INDIGO} stopOpacity={0.22}/>
                      <stop offset="100%" stopColor={INDIGO} stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.15}/>
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="gPrin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E2E8F0" stopOpacity={0.7}/>
                      <stop offset="100%" stopColor="#E2E8F0" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} tickFormatter={v=>v%5===0?`Y${v}`:""} interval={0}/>
                  <YAxis tickLine={false} axisLine={false} width={74} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} tickFormatter={v=>fmt(v,currency,true)}/>
                  <Tooltip content={<DarkTooltip currency={currency}/>}/>
                  <Legend iconType="plainline" wrapperStyle={{fontSize:12,paddingTop:8}}/>
                  <Area type="monotone" dataKey="principal" name="Contributed" stroke="#CBD5E1" strokeWidth={1.5} fill="url(#gPrin)" dot={false}/>
                  <Area type="monotone" dataKey="real"      name="Real Value"  stroke="#A78BFA" strokeWidth={2}   fill="url(#gReal)" dot={false} strokeDasharray="6 4"/>
                  <Area type="monotone" dataKey="value"     name="Nominal"     stroke={INDIGO}  strokeWidth={2.5} fill="url(#gNom)"  dot={false} activeDot={{r:6,fill:INDIGO,stroke:"white",strokeWidth:2.5}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{padding:"0 28px 22px"}}>
              <div style={{background:LAV,borderRadius:16,padding:"14px 18px",display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18}}>💡</span>
                <p style={{margin:0,fontSize:13,color:"#4338CA",lineHeight:1.65}}>
                  <strong>Insight:</strong> After 30 years at {rate.toFixed(1)}% growth and {inflation.toFixed(1)}% inflation, your {fmt(projected,currency,true)} nominal portfolio has a real purchasing power of only {fmt(realValue,currency,true)} — a {(100-realValue/projected*100).toFixed(0)}% reduction. This is why investing above inflation is critical.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Chart 2 */}
        {activeTab===1 && (
          <Card>
            <div className="card-head" style={{padding:"26px 30px 10px"}}>
              <SectionLabel
                tag="Chart 2 of 3"
                title="Principal vs Interest Earned Over Time"
                sub="At each 5-year milestone: how much came from your contributions versus compound interest. The interest portion typically overtakes contributions around year 15–20."
              />
            </div>
            <div style={{padding:"8px 16px 8px",height:300}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{top:10,right:28,left:4,bottom:0}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} tickFormatter={v=>`Y${v}`}/>
                  <YAxis tickLine={false} axisLine={false} width={74} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} tickFormatter={v=>fmt(v,currency,true)}/>
                  <Tooltip content={<BarTooltip currency={currency}/>}/>
                  <Legend iconType="square" wrapperStyle={{fontSize:12,paddingTop:8}}/>
                  <Bar dataKey="principal" name="Your Contributions" stackId="a" fill="#C4B5FD" radius={[0,0,6,6]}/>
                  <Bar dataKey="interest"  name="Interest Earned"    stackId="a" fill={INDIGO}  radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{padding:"0 28px 22px"}}>
              <div style={{background:LAV,borderRadius:16,padding:"14px 18px",display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18}}>📊</span>
                <p style={{margin:0,fontSize:13,color:"#4338CA",lineHeight:1.65}}>
                  <strong>Insight:</strong> Of your total {fmt(projected,currency,true)} at year 30, you personally contributed {fmt(contributed,currency,true)} — only {(contributed/projected*100).toFixed(0)}% of the final value. The remaining {(netGain/projected*100).toFixed(0)}% ({fmt(netGain,currency,true)}) was generated by compounding interest working silently in the background.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Chart 3 */}
        {activeTab===2 && (
          <Card>
            <div className="card-head" style={{padding:"26px 30px 10px"}}>
              <SectionLabel
                tag="Chart 3 of 3"
                title="Rule of 72 — Doubling Time by Growth Rate"
                sub="A classic mental shortcut: divide 72 by your annual return rate to estimate years needed to double your investment. Visualised across rates from 2% to 12%."
              />
            </div>
            <div style={{padding:"8px 16px 8px",height:300}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={doublingData} margin={{top:10,right:28,left:4,bottom:0}}>
                  <defs>
                    <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#A21CAF"/>
                      <stop offset="100%" stopColor={INDIGO}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} label={{value:"Annual Rate",position:"insideBottomRight",offset:-10,fontSize:11,fill:"#94A3B8"}}/>
                  <YAxis tickLine={false} axisLine={false} width={50} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} label={{value:"Years",angle:-90,position:"insideLeft",offset:10,fontSize:11,fill:"#94A3B8"}}/>
                  <Tooltip content={({active,payload,label})=>{
                    if(!active||!payload?.length) return null;
                    return (
                      <div style={{background:DARK2,borderRadius:14,padding:"12px 18px",boxShadow:"0 16px 40px rgba(79,70,229,.35)"}}>
                        <p style={{margin:"0 0 6px",color:"#A5B4FC",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Rate {label}</p>
                        <p style={{margin:0,color:"white",fontSize:14,fontWeight:700}}>Doubles in <span style={{color:"#6EE7B7"}}>{payload[0].value} years</span></p>
                      </div>
                    );
                  }}/>
                  <Line type="monotone" dataKey="years" name="Years to Double" stroke="url(#gLine)" strokeWidth={3} dot={{fill:INDIGO,r:5,strokeWidth:0}} activeDot={{r:7,fill:VIOLET,stroke:"white",strokeWidth:2}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{padding:"0 28px 22px"}}>
              <div style={{background:LAV,borderRadius:16,padding:"14px 18px",display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18}}>⚡</span>
                <p style={{margin:0,fontSize:13,color:"#4338CA",lineHeight:1.65}}>
                  <strong>Your scenario:</strong> At {rate.toFixed(1)}% annual growth, your money doubles approximately every <strong>{(72/rate).toFixed(1)} years</strong> (Rule of 72). Over 30 years, that's roughly <strong>{Math.floor(30/(72/rate))} full doublings</strong> — which is why starting early and maintaining a strong rate of return matters so much.
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{background:`linear-gradient(135deg,${DARK} 0%,${DARK2} 100%)`,padding:"40px 28px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.14}} viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
          <Flower x={80}  y={100} size={2}   color="#9333EA" opacity={1} rotate={10}/>
          <Flower x={720} y={90}  size={1.8} color="#7C3AED" opacity={1} rotate={-20}/>
          <Flower x={400} y={50}  size={1.2} color="#A855F7" opacity={1} rotate={5}/>
          <Flower x={240} y={130} size={0.9} color="#C084FC" opacity={1} rotate={30}/>
          <Flower x={560} y={140} size={1.0} color="#8B5CF6" opacity={1} rotate={-15}/>
        </svg>
        <div style={{position:"relative",zIndex:1}}>
          <h3 className="serif" style={{color:"white",fontSize:30,margin:"0 0 6px",letterSpacing:"-0.01em"}}>
            Bloom <em style={{color:"#F59E0B"}}>Calculator</em>
          </h3>
          <p style={{color:"#818CF8",fontSize:13,margin:"0 0 4px",fontWeight:500}}>Designed & built by Kenvara Solivo Lwie</p>
          <p style={{color:"#4C4A84",fontSize:12,margin:0}}>For educational purposes only. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
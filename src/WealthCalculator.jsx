import { useState, useMemo } from "react";
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

/* ─── MATH ───────────────────────────────────────────── */
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
const DARK    = "#1C1752";
const LAV     = "#EEF2FF";
const BORDER  = "#DDD6FE";
const MUTED   = "#64748B";
const TEXT    = "#0F172A";
const VIOLET  = "#7C3AED";
const FUCHSIA = "#A21CAF";

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
            rx={7} ry={13} fill={color} fillOpacity={0.55}
            transform={`rotate(${angle},${Math.cos((angle-90)*Math.PI/180)*14},${Math.sin((angle-90)*Math.PI/180)*14})`}
          />
        );
      })}
      <circle cx={0} cy={0} r={9} fill="#FDE68A" fillOpacity={0.9}/>
      <circle cx={0} cy={0} r={5} fill="#F59E0B" fillOpacity={0.7}/>
    </g>
  );
}

function FloralStem({ x, y, height=80 }) {
  return (
    <g>
      <path d={`M${x} ${y+height} Q${x-12} ${y+height*0.6} ${x} ${y+height*0.3} Q${x+10} ${y+height*0.15} ${x} ${y}`}
        stroke="#6B21A8" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
      <ellipse cx={x-16} cy={y+height*0.55} rx={10} ry={6} fill="#A78BFA" fillOpacity={0.5} transform={`rotate(-30,${x-16},${y+height*0.55})`}/>
      <ellipse cx={x+14} cy={y+height*0.35} rx={9} ry={5} fill="#C4B5FD" fillOpacity={0.5} transform={`rotate(20,${x+14},${y+height*0.35})`}/>
    </g>
  );
}

function PurpleDecorations() {
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"hidden"}} viewBox="0 0 1100 780" preserveAspectRatio="xMidYMid slice">
      {/* Large corner flowers */}
      <FloralStem x={72} y={220} height={110}/>
      <Flower x={72} y={210} size={1.8} color="#9333EA" opacity={0.7} rotate={15}/>
      <FloralStem x={42} y={310} height={80}/>
      <Flower x={42} y={300} size={1.1} color="#7C3AED" opacity={0.5} rotate={-10}/>
      <Flower x={105} y={280} size={0.75} color="#A855F7" opacity={0.4} rotate={40}/>

      <FloralStem x={1040} y={180} height={120}/>
      <Flower x={1040} y={168} size={2.0} color="#8B5CF6" opacity={0.65} rotate={-20}/>
      <FloralStem x={1068} y={290} height={70}/>
      <Flower x={1068} y={280} size={1.1} color="#A855F7" opacity={0.45} rotate={30}/>
      <Flower x={1005} y={250} size={0.8} color="#C084FC" opacity={0.35} rotate={-50}/>

      {/* Mid-left cluster */}
      <FloralStem x={30} y={480} height={90}/>
      <Flower x={30} y={470} size={1.3} color="#A21CAF" opacity={0.5} rotate={5}/>
      <FloralStem x={58} y={530} height={60}/>
      <Flower x={58} y={522} size={0.9} color="#9333EA" opacity={0.4} rotate={25}/>

      {/* Mid-right cluster */}
      <FloralStem x={1080} y={460} height={100}/>
      <Flower x={1080} y={450} size={1.4} color="#7C3AED" opacity={0.5} rotate={-15}/>
      <Flower x={1055} y={500} size={0.75} color="#A855F7" opacity={0.35} rotate={55}/>

      {/* Small scattered flowers */}
      <Flower x={160} y={60}  size={0.55} color="#C084FC" opacity={0.3} rotate={20}/>
      <Flower x={920} y={80}  size={0.6}  color="#A78BFA" opacity={0.3} rotate={-30}/>
      <Flower x={550} y={30}  size={0.45} color="#DDD6FE" opacity={0.5} rotate={10}/>
      <Flower x={280} y={740} size={0.7}  color="#9333EA" opacity={0.25} rotate={15}/>
      <Flower x={820} y={720} size={0.65} color="#7C3AED" opacity={0.25} rotate={-20}/>
      <Flower x={460} y={760} size={0.5}  color="#C4B5FD" opacity={0.35} rotate={5}/>

      {/* Tiny petal dots */}
      {[[200,140],[380,50],[700,45],[870,130],[140,650],[980,610]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r={4+i%3*2} fill="#C4B5FD" fillOpacity={0.25+i*0.04}/>
      ))}
      {/* Vines / curves */}
      <path d="M0 720 Q80 680 120 620 Q160 560 140 480" stroke="#A78BFA" strokeWidth={1.5} fill="none" strokeDasharray="6 5" opacity={0.25}/>
      <path d="M1100 680 Q1020 640 980 560 Q950 490 970 420" stroke="#C4B5FD" strokeWidth={1.5} fill="none" strokeDasharray="6 5" opacity={0.22}/>
    </svg>
  );
}

/* ─── CUSTOM TOOLTIP ─────────────────────────────────── */
function DarkTooltip({ active, payload, label, currency, extra="" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:DARK,borderRadius:14,padding:"12px 18px",minWidth:170,boxShadow:"0 16px 40px rgba(79,70,229,.35)",maxWidth:220}}>
      <p style={{margin:"0 0 8px",color:"#A5B4FC",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Year {label}{extra}</p>
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
    <div style={{background:DARK,borderRadius:14,padding:"12px 18px",boxShadow:"0 16px 40px rgba(79,70,229,.35)",maxWidth:230}}>
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

/* ─── SLIDER ─────────────────────────────────────────── */
function Slider({ label, value, min, max, step, onChange, display }) {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:MUTED,letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:16,fontWeight:800,color:TEXT,fontVariantNumeric:"tabular-nums"}}>{display(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{background:`linear-gradient(to right,${INDIGO} ${pct}%,#DDD6FE ${pct}%)`}}
      />
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:10,color:"#C4B5FD"}}>{display(min)}</span>
        <span style={{fontSize:10,color:"#C4B5FD"}}>{display(max)}</span>
      </div>
    </div>
  );
}

/* ─── CARD WRAPPER ───────────────────────────────────── */
function Card({ children, style={} }) {
  return (
    <div style={{background:"white",borderRadius:36,border:`1px solid ${BORDER}`,boxShadow:"0 24px 64px rgba(79,70,229,.10),0 2px 12px rgba(0,0,0,.05)",overflow:"hidden",...style}}>
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

/* ─── STAT PILL (overflow-safe) ──────────────────────── */
function StatPill({ label, value, green, featured }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4,minWidth:0}}>
      <span style={{fontSize:10,fontWeight:700,color:"#818CF8",letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>
      <span style={{
        fontSize: featured ? "clamp(14px,2.5vw,24px)" : "clamp(13px,2vw,17px)",
        fontWeight:800,
        color: green ? "#6EE7B7" : "white",
        fontVariantNumeric:"tabular-nums",
        wordBreak:"break-all",
        lineHeight:1.15,
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

  /* ── Dataset: compound growth + inflation ── */
  const growthData = useMemo(()=>
    Array.from({length:31},(_,y)=>({
      year: y,
      value:     Math.round(calcFV(initial, monthly, rate, y)),
      principal: Math.round(initial + monthly*y*12),
      real:      Math.round(calcInflation(calcFV(initial,monthly,rate,y), inflation, y)),
    })),[initial,monthly,rate,inflation]);

  /* ── Dataset: Savings breakdown (interest earned vs principal per 5Y) ── */
  const breakdownData = useMemo(()=>
    [5,10,15,20,25,30].map(y=>({
      year: y,
      principal: Math.round(initial + monthly*y*12),
      interest:  Math.round(Math.max(0,calcFV(initial,monthly,rate,y) - (initial+monthly*y*12))),
    })),[initial,monthly,rate]);

  /* ── Dataset: Rule of 72 — doubling scenarios ── */
  const doublingData = useMemo(()=>
    [2,3,4,5,6,7,8,9,10,11,12].map(r=>({
      rate: r,
      years: parseFloat((72/r).toFixed(1)),
      label:`${r}%`,
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
        select{-webkit-appearance:none;appearance:none;}
        .tab-btn{border:none;cursor:pointer;font-family:inherit;transition:all .18s;border-radius:999px;font-weight:600;font-size:13px;}
        .tab-btn.active{background:${DARK};color:white;box-shadow:0 4px 16px rgba(28,23,82,.25);}
        .tab-btn.inactive{background:transparent;color:${MUTED};}
        .tab-btn.inactive:hover{background:#EEF2FF;color:${TEXT};}
        @media(max-width:640px){
          .nav-name{font-size:12px!important;}
          .hero-title{font-size:42px!important;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
          .card-body{padding:18px 18px 26px!important;}
          .card-head{padding:20px 18px 12px!important;}
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(245,244,255,0.88)",backdropFilter:"blur(18px) saturate(1.8)",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{maxWidth:1080,margin:"0 auto",padding:"0 28px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {/* Logo mark */}
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,background:DARK,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16 6.2V11.8L9 16L2 11.8V6.2L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2.5" fill="white" opacity=".9"/>
              </svg>
            </div>
            <span style={{fontWeight:700,fontSize:15,color:TEXT,letterSpacing:"-0.02em"}}>Bloom</span>
          </div>
          {/* Tagline center */}
          <span style={{fontSize:12,color:MUTED,fontWeight:500,display:"flex",alignItems:"center",gap:7}}>
            <span style={{width:6,height:6,background:"#A78BFA",borderRadius:"50%",display:"inline-block"}}/>
            Personal Financial Calculator
            <span style={{width:6,height:6,background:"#A78BFA",borderRadius:"50%",display:"inline-block"}}/>
          </span>
          {/* Author */}
          <span className="nav-name" style={{fontSize:13,fontWeight:600,color:INDIGO,letterSpacing:"0.01em",fontStyle:"italic"}}>
            Kenvara Solivo Lwie
          </span>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{position:"relative",textAlign:"center",padding:"72px 24px 56px",overflow:"hidden",minHeight:380}}>
        {/* Purple flower SVG decorations */}
        <PurpleDecorations />

        {/* Glow blobs */}
        <div style={{position:"absolute",top:"-10%",left:"25%",width:400,height:400,background:"radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"10%",right:"18%",width:300,height:300,background:"radial-gradient(circle,rgba(167,139,250,.09) 0%,transparent 70%)",pointerEvents:"none"}}/>

        <div style={{position:"relative",zIndex:2}}>
          {/* Big site name */}
          <h1 className="serif hero-title" style={{fontSize:"clamp(52px,10vw,96px)",color:TEXT,lineHeight:1.0,margin:"0 0 8px",letterSpacing:"-0.03em"}}>
            Bloom
          </h1>
          <h1 className="serif hero-title" style={{fontSize:"clamp(38px,7vw,68px)",color:VIOLET,lineHeight:1.0,margin:"0 0 22px",letterSpacing:"-0.02em",fontStyle:"italic"}}>
            Calculator
          </h1>

          {/* Divider ornament */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:22}}>
            <div style={{width:48,height:1,background:"linear-gradient(to right,transparent,#C4B5FD)"}}/>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {Array.from({length:6},(_,i)=>{
                const a=(i/6)*360;
                return <ellipse key={i}
                  cx={Math.cos((a-90)*Math.PI/180)*6} cy={Math.sin((a-90)*Math.PI/180)*6}
                  rx="3" ry="5.5" fill="#A855F7" fillOpacity=".6"
                  transform={`rotate(${a},${Math.cos((a-90)*Math.PI/180)*6},${Math.sin((a-90)*Math.PI/180)*6})`}/>;
              })}
              <circle cx="0" cy="0" r="3.5" fill="#FDE68A"/>
            </svg>
            <div style={{width:48,height:1,background:"linear-gradient(to left,transparent,#C4B5FD)"}}/>
          </div>

          <p style={{color:MUTED,fontSize:17,maxWidth:440,margin:"0 auto 6px",lineHeight:1.8}}>
            See exactly how your money grows over time through the power of compounding interest.
          </p>
          <p style={{color:"#94A3B8",fontSize:13,maxWidth:360,margin:"0 auto",lineHeight:1.6}}>
            Adjust the sliders below to model your personal wealth trajectory — including real-value after inflation.
          </p>

          {/* Author badge */}
          <div style={{marginTop:22,display:"inline-flex",alignItems:"center",gap:8,background:"white",border:`1px solid ${BORDER}`,borderRadius:999,padding:"8px 18px",boxShadow:"0 4px 14px rgba(124,58,237,.1)"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {Array.from({length:6},(_,i)=>{
                const a=(i/6)*360;
                return <ellipse key={i}
                  cx={Math.cos((a-90)*Math.PI/180)*4.5} cy={Math.sin((a-90)*Math.PI/180)*4.5}
                  rx="2.2" ry="4" fill="#A855F7" fillOpacity=".7"
                  transform={`rotate(${a},${Math.cos((a-90)*Math.PI/180)*4.5},${Math.sin((a-90)*Math.PI/180)*4.5})`}/>;
              })}
              <circle cx="0" cy="0" r="2.5" fill="#FDE68A"/>
            </svg>
            <span style={{fontSize:12,fontWeight:600,color:VIOLET}}>by Kenvara Solivo Lwie</span>
          </div>
        </div>
      </section>

      {/* ── WHAT IS COMPOUND INTEREST explainer ─────────── */}
      <section style={{maxWidth:1080,margin:"0 auto 32px",padding:"0 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
          {[
            { icon:"🌱", title:"The Power of Compounding", text:"Compounding means you earn interest on your interest. Even a small difference in annual rate creates enormous differences over decades — the earlier you start, the more dramatic the effect." },
            { icon:"📅", title:"Why Monthly Contributions Matter", text:"Regular monthly deposits harness dollar-cost averaging and extend compounding to each new deposit. Even modest monthly additions can dwarf your initial lump sum over 20–30 years." },
            { icon:"📉", title:"Inflation Erodes Real Value", text:"The 'real' purchasing power of your future wealth is reduced by inflation. A portfolio worth $1M in 30 years may only buy what $400K buys today — this calculator shows both nominal and real figures." },
            { icon:"⚡", title:"Rule of 72 Simplified", text:"Divide 72 by your annual growth rate to estimate how many years it takes to double your money. At 6%, your portfolio doubles every 12 years. At 12%, every 6 years — a dramatic difference." },
          ].map(({icon,title,text})=>(
            <div key={title} style={{background:"white",borderRadius:24,padding:"22px 24px",border:`1px solid ${BORDER}`,boxShadow:"0 4px 20px rgba(79,70,229,.06)"}}>
              <div style={{fontSize:26,marginBottom:10}}>{icon}</div>
              <h4 style={{margin:"0 0 8px",fontSize:14,fontWeight:700,color:TEXT}}>{title}</h4>
              <p style={{margin:0,fontSize:13,color:MUTED,lineHeight:1.7}}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTROLS + MAIN CARD ─────────────────────────── */}
      <section style={{maxWidth:1080,margin:"0 auto 36px",padding:"0 20px"}}>
        <Card>
          {/* Card header */}
          <div className="card-head" style={{padding:"26px 32px 14px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,borderBottom:`1px solid #F1F5F9`}}>
            <div>
              <span style={{display:"block",fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:3}}>Wealth Projection Tool</span>
              <h2 style={{margin:0,fontSize:19,fontWeight:800,color:TEXT,letterSpacing:"-0.01em"}}>Configure Your Scenario</h2>
            </div>
            {/* Currency */}
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

          {/* Sliders */}
          <div className="card-body" style={{padding:"22px 32px 28px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"22px 36px"}}>
            <Slider label="Initial Deposit"       value={initial}   min={0}  max={100000} step={100}  onChange={setInitial}   display={v=>fmt(v,currency)}/>
            <Slider label="Monthly Contribution"  value={monthly}   min={0}  max={10000}  step={50}   onChange={setMonthly}   display={v=>fmt(v,currency)}/>
            <Slider label="Annual Growth Rate"    value={rate}      min={0}  max={20}     step={0.1}  onChange={setRate}      display={v=>`${v.toFixed(1)}%`}/>
            <Slider label="Expected Inflation %"  value={inflation} min={0}  max={12}     step={0.1}  onChange={setInflation} display={v=>`${v.toFixed(1)}%`}/>
          </div>
        </Card>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <section style={{maxWidth:1080,margin:"0 auto 32px",padding:"0 20px"}}>
        <div style={{background:DARK,borderRadius:28,padding:"22px 28px"}}>
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"16px 20px"}}>
            <StatPill label="Projected Value (30Y)"    value={fmt(projected,currency,true)}  featured green={false}/>
            <StatPill label="Total Contributed"        value={fmt(contributed,currency,true)} green={false}/>
            <StatPill label="Net Interest Earned"      value={`+${fmt(netGain,currency,true)}`} green/>
            <StatPill label="Growth Multiple"          value={`${multiple}×`}                green/>
            <StatPill label="Real Value (Inflation adj.)" value={fmt(realValue,currency,true)}  green={false}/>
          </div>
          <p style={{margin:"14px 0 0",fontSize:11,color:"#6366F1",lineHeight:1.5}}>
            * Nominal values assume monthly compounding. Real value adjusts for {inflation.toFixed(1)}% annual inflation using the Fisher equation.
          </p>
        </div>
      </section>

      {/* ── GRAPH TABS ───────────────────────────────────── */}
      <section style={{maxWidth:1080,margin:"0 auto 64px",padding:"0 20px",display:"flex",flexDirection:"column",gap:24}}>

        {/* Tab bar */}
        <div style={{display:"flex",gap:8,background:"white",borderRadius:999,padding:6,border:`1px solid ${BORDER}`,width:"fit-content",flexWrap:"wrap"}}>
          {tabs.map((t,i)=>(
            <button key={t} className={`tab-btn ${i===activeTab?"active":"inactive"}`}
              onClick={()=>setActiveTab(i)}
              style={{padding:"8px 18px"}}>
              {t}
            </button>
          ))}
        </div>

        {/* ── GRAPH 1: Compound Growth + Real Value ── */}
        {activeTab===0 && (
          <Card>
            <div className="card-head" style={{padding:"24px 30px 8px"}}>
              <SectionLabel
                tag="Chart 1 of 3"
                title="Compound Growth vs Inflation-Adjusted Value"
                sub={`Nominal portfolio growth at ${rate.toFixed(1)}% annual rate, versus real purchasing power eroded by ${inflation.toFixed(1)}% annual inflation. The gap between the two lines is the invisible cost of inflation.`}
              />
            </div>
            <div style={{padding:"8px 16px 8px",height:300}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{top:10,right:28,left:4,bottom:0}}>
                  <defs>
                    <linearGradient id="gNom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={INDIGO} stopOpacity={0.2}/>
                      <stop offset="100%" stopColor={INDIGO} stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.15}/>
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="gPrin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E2E8F0" stopOpacity={0.6}/>
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
            <div style={{padding:"0 28px 20px"}}>
              <div style={{background:LAV,borderRadius:16,padding:"14px 18px",display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18}}>💡</span>
                <p style={{margin:0,fontSize:13,color:"#4338CA",lineHeight:1.65}}>
                  <strong>Insight:</strong> After 30 years at {rate.toFixed(1)}% growth and {inflation.toFixed(1)}% inflation, your {fmt(projected,currency,true)} nominal portfolio has a real purchasing power of only {fmt(realValue,currency,true)} — a {(100-realValue/projected*100).toFixed(0)}% reduction. This is why investing above inflation is critical.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ── GRAPH 2: Principal vs Interest breakdown ── */}
        {activeTab===1 && (
          <Card>
            <div className="card-head" style={{padding:"24px 30px 8px"}}>
              <SectionLabel
                tag="Chart 2 of 3"
                title="Principal vs Interest Earned Over Time"
                sub="At each 5-year milestone, this shows how much of your total portfolio came from your own contributions (principal) versus compound interest generated by the market. The interest portion typically overtakes contributions around year 15–20."
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
            <div style={{padding:"0 28px 20px"}}>
              <div style={{background:LAV,borderRadius:16,padding:"14px 18px",display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18}}>📊</span>
                <p style={{margin:0,fontSize:13,color:"#4338CA",lineHeight:1.65}}>
                  <strong>Insight:</strong> Of your total {fmt(projected,currency,true)} at year 30, you personally contributed {fmt(contributed,currency,true)} — only {(contributed/projected*100).toFixed(0)}% of the final value. The remaining {(netGain/projected*100).toFixed(0)}% ({fmt(netGain,currency,true)}) was generated by compounding interest working silently in the background.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ── GRAPH 3: Rule of 72 ── */}
        {activeTab===2 && (
          <Card>
            <div className="card-head" style={{padding:"24px 30px 8px"}}>
              <SectionLabel
                tag="Chart 3 of 3"
                title="Rule of 72 — Doubling Time by Growth Rate"
                sub="A classic mental shortcut in finance: divide 72 by your annual return rate to estimate the number of years needed to double your investment. This chart visualises that relationship across rates from 2% to 12%."
              />
            </div>
            <div style={{padding:"8px 16px 8px",height:300}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={doublingData} margin={{top:10,right:28,left:4,bottom:0}}>
                  <defs>
                    <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor={FUCHSIA} stopOpacity={1}/>
                      <stop offset="100%" stopColor={INDIGO}  stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} label={{value:"Annual Rate",position:"insideBottomRight",offset:-10,fontSize:11,fill:"#94A3B8"}}/>
                  <YAxis tickLine={false} axisLine={false} width={50} tick={{fontSize:11,fill:"#94A3B8",fontWeight:500}} label={{value:"Years",angle:-90,position:"insideLeft",offset:10,fontSize:11,fill:"#94A3B8"}}/>
                  <Tooltip
                    content={({active,payload,label})=> {
                      if(!active||!payload?.length) return null;
                      return (
                        <div style={{background:DARK,borderRadius:14,padding:"12px 18px",boxShadow:"0 16px 40px rgba(79,70,229,.35)"}}>
                          <p style={{margin:"0 0 6px",color:"#A5B4FC",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Rate {label}</p>
                          <p style={{margin:0,color:"white",fontSize:14,fontWeight:700}}>Doubles in <span style={{color:"#6EE7B7"}}>{payload[0].value} years</span></p>
                        </div>
                      );
                    }}
                  />
                  <Line type="monotone" dataKey="years" name="Years to Double"
                    stroke="url(#gLine)" strokeWidth={3} dot={{fill:INDIGO,r:5,strokeWidth:0}}
                    activeDot={{r:7,fill:VIOLET,stroke:"white",strokeWidth:2}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{padding:"0 28px 20px"}}>
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
      <footer style={{background:DARK,padding:"36px 28px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.12}} viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
          <Flower x={80}  y={100} size={2}   color="#9333EA" opacity={1} rotate={10}/>
          <Flower x={720} y={90}  size={1.8} color="#7C3AED" opacity={1} rotate={-20}/>
          <Flower x={400} y={50}  size={1.2} color="#A855F7" opacity={1} rotate={5}/>
          <Flower x={240} y={130} size={0.9} color="#C084FC" opacity={1} rotate={30}/>
          <Flower x={560} y={140} size={1.0} color="#8B5CF6" opacity={1} rotate={-15}/>
        </svg>
        <div style={{position:"relative",zIndex:1}}>
          <h3 className="serif" style={{color:"white",fontSize:28,margin:"0 0 6px",letterSpacing:"-0.01em"}}>Bloom <em style={{color:"#A78BFA"}}>Calculator</em></h3>
          <p style={{color:"#818CF8",fontSize:13,margin:"0 0 4px",fontWeight:500}}>Designed & built by Kenvara Solivo Lwie</p>
          <p style={{color:"#4C4A84",fontSize:12,margin:0}}>For educational purposes only. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}

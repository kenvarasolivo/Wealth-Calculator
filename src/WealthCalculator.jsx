import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar",          locale: "en-US", m: 1 },
  { code: "EUR", symbol: "€",  name: "Euro",               locale: "de-DE", m: 0.92 },
  { code: "GBP", symbol: "£",  name: "British Pound",      locale: "en-GB", m: 0.79 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah",  locale: "id-ID", m: 15850 },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen",       locale: "ja-JP", m: 149 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar",   locale: "en-SG", m: 1.35 },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",       locale: "en-IN", m: 83 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar",  locale: "en-AU", m: 1.53 },
];

function calcPortfolio(P, PMT, rAnnual, years) {
  const r = rAnnual / 100 / 12;
  const n = years * 12;
  if (r === 0) return P + PMT * n;
  return P * Math.pow(1 + r, n) + PMT * ((Math.pow(1 + r, n) - 1) / r);
}

function fmtMoney(value, cur) {
  const v = Math.round(value * cur.m);
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: "currency", currency: cur.code,
      maximumFractionDigits: 0, minimumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${cur.symbol}${v.toLocaleString()}`;
  }
}

function fmtAxis(value, cur) {
  const v = value * cur.m;
  if (v >= 1e12) return `${cur.symbol}${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `${cur.symbol}${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6)  return `${cur.symbol}${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3)  return `${cur.symbol}${(v / 1e3).toFixed(0)}K`;
  return `${cur.symbol}${Math.round(v)}`;
}

const C = {
  darkBg:    "#1C1752",
  indigo:    "#4F46E5",
  indigoMid: "#6366F1",
  lavLight:  "#F5F4FF",
  lavCard:   "#EEF2FF",
  border:    "#E0E7FF",
  muted:     "#64748B",
  text:      "#0F172A",
};

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  const portfolio = payload.find(p => p.dataKey === "value");
  const principal = payload.find(p => p.dataKey === "principal");
  const gain = portfolio && principal ? portfolio.value - principal.value : 0;
  return (
    <div style={{
      background: C.darkBg, border: "none", borderRadius: 16,
      padding: "14px 20px", minWidth: 200,
      boxShadow: "0 20px 48px rgba(79,70,229,0.35)",
    }}>
      <p style={{ margin: "0 0 10px", color: "#A5B4FC", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Year {label}
      </p>
      {portfolio && (
        <p style={{ margin: "0 0 4px", color: "white", fontSize: 16, fontWeight: 700 }}>
          {fmtMoney(portfolio.value, currency)}
        </p>
      )}
      {principal && (
        <p style={{ margin: "0 0 4px", color: "#A5B4FC", fontSize: 13 }}>
          Invested: {fmtMoney(principal.value, currency)}
        </p>
      )}
      {gain > 0 && (
        <p style={{ margin: 0, color: "#6EE7B7", fontSize: 13, fontWeight: 600 }}>
          +{fmtMoney(gain, currency)} gain
        </p>
      )}
    </div>
  );
};

function Slider({ label, value, min, max, step, onChange, display }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.text, fontVariantNumeric: "tabular-nums" }}>
          {display(value)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: "100%", cursor: "pointer",
          background: `linear-gradient(to right, ${C.indigo} ${pct}%, ${C.border} ${pct}%)`
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#C7D2FE" }}>{display(min)}</span>
        <span style={{ fontSize: 11, color: "#C7D2FE" }}>{display(max)}</span>
      </div>
    </div>
  );
}

function StatPill({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "#818CF8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 16, fontWeight: 700, color: highlight ? "#6EE7B7" : "white", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

export default function WealthCalculator() {
  const [initial,  setInitial]  = useState(6700);
  const [monthly,  setMonthly]  = useState(2650);
  const [rate,     setRate]     = useState(5.5);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [hoverYear, setHoverYear] = useState(null);

  const data = useMemo(() =>
    Array.from({ length: 31 }, (_, y) => ({
      year: y,
      value:     Math.round(calcPortfolio(initial, monthly, rate, y)),
      principal: Math.round(initial + monthly * y * 12),
    })),
    [initial, monthly, rate]
  );

  const projected   = data[30].value;
  const contributed = initial + monthly * 360;
  const netGain     = Math.max(0, projected - contributed);
  const multiple    = contributed > 0 ? (projected / contributed).toFixed(2) : "—";

  return (
    <div style={{ minHeight: "100vh", background: C.lavLight, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .bloom-serif { font-family: 'DM Serif Display', Georgia, serif; }
        input[type=range] {
          -webkit-appearance: none; appearance: none;
          height: 5px; border-radius: 999px; outline: none; transition: opacity .2s;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 22px; height: 22px; border-radius: 50%;
          background: ${C.indigo}; cursor: grab;
          box-shadow: 0 2px 12px rgba(79,70,229,.5);
          transition: transform .15s, box-shadow .15s;
        }
        input[type=range]:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.2); }
        input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.12); box-shadow: 0 4px 18px rgba(79,70,229,.55); }
        input[type=range]::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%;
          background: ${C.indigo}; border: none;
          box-shadow: 0 2px 12px rgba(79,70,229,.5);
        }
        select { -webkit-appearance: none; appearance: none; }
        .bloom-nav-link { color: #64748B; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .15s; }
        .bloom-nav-link:hover { color: #1E293B; }
        .bloom-btn-launch { transition: background .15s, transform .12s, box-shadow .15s; }
        .bloom-btn-launch:hover { background: #312E81 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(49,46,129,.35) !important; }
        .bloom-btn-launch:active { transform: translateY(0); }
        .bloom-cta:hover { background: #312E81 !important; box-shadow: 0 8px 32px rgba(79,70,229,.4) !important; transform: translateY(-1px); }
        .bloom-cta:active { transform: translateY(0); }
        @media (max-width: 680px) {
          .bloom-nav-links { display: none !important; }
          .bloom-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .bloom-hero-h1 { font-size: clamp(40px, 12vw, 72px) !important; }
          .bloom-card-pad { padding: 20px 22px 28px !important; }
          .bloom-header-pad { padding: 24px 24px 12px !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(245,244,255,0.88)", backdropFilter: "blur(16px) saturate(1.8)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, background: C.darkBg, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16 6.2V11.8L9 16L2 11.8V6.2L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2.5" fill="white" opacity=".9"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.text, letterSpacing: "-0.02em" }}>Bloom Calculator</span>
          </div>

          {/* Links */}
          <div className="bloom-nav-links" style={{ display: "flex", gap: 36 }}>
            {["Business", "Treasury", "Developers", "Join Us"].map(l => (
              <a key={l} href="#" className="bloom-nav-link">{l}</a>
            ))}
          </div>

          <button className="bloom-btn-launch" style={{
            background: C.darkBg, color: "white", border: "none",
            borderRadius: 999, padding: "10px 22px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", letterSpacing: "0.01em",
            boxShadow: "0 4px 16px rgba(28,23,82,.25)",
            flexShrink: 0,
          }}>
            Kenvara Solivo Lwie
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "68px 24px 52px", position: "relative" }}>
        {/* Decorative glow blobs */}
        <div style={{ position: "absolute", top: 20, left: "20%", width: 320, height: 320, background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 40, right: "15%", width: 260, height: 260, background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: C.lavCard, color: C.indigo, fontSize: 12, fontWeight: 600,
          padding: "6px 15px", borderRadius: 999, border: `1px solid ${C.border}`,
          marginBottom: 28, letterSpacing: "0.04em",
        }}>
          <span style={{ width: 7, height: 7, background: "#22C55E", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,.2)" }} />
          Yield-bearing stablecoin · Live on mainnet
        </div>

        <h1 className="bloom-serif bloom-hero-h1" style={{ fontSize: "clamp(52px, 9vw, 80px)", color: C.text, lineHeight: 1.06, margin: "0 0 22px", letterSpacing: "-0.02em" }}>
          Where Money<br />
          <em style={{ color: C.indigo, fontStyle: "italic" }}>Grows</em>
        </h1>
        <p style={{ color: C.muted, fontSize: 17, maxWidth: 380, margin: "0 auto 0", lineHeight: 1.75 }}>
          A programmable, utility-driven stable token designed for native value accrual and seamless DeFi integration.
        </p>
      </section>

      {/* ── CALCULATOR CARD ──────────────────────────────── */}
      <section style={{ maxWidth: 880, margin: "0 auto 80px", padding: "0 20px" }}>
        <div style={{
          background: "white", borderRadius: 40,
          boxShadow: "0 32px 80px rgba(79,70,229,0.12), 0 4px 16px rgba(0,0,0,0.06)",
          border: `1px solid ${C.border}`, overflow: "hidden",
        }}>

          {/* Card top bar */}
          <div className="bloom-header-pad" style={{ padding: "28px 36px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderBottom: `1px solid #F1F5F9` }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Wealth Growth Projection
              </p>
              <h2 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
                30-Year Compound Forecast
              </h2>
            </div>

            {/* Currency selector */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <select
                value={currency.code}
                onChange={e => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
                style={{
                  background: "#F8FAFC", border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "8px 38px 8px 13px",
                  fontSize: 13, fontWeight: 600, color: "#334155",
                  cursor: "pointer", fontFamily: "inherit", outline: "none",
                }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
                ))}
              </select>
              <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="11" height="7" viewBox="0 0 11 7" fill="none">
                <path d="M1 1L5.5 6L10 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* ── CHART ─────────────────────────── */}
          <div style={{ padding: "16px 12px 4px", height: 268 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 28, left: 4, bottom: 0 }}
                onMouseMove={s => s?.activePayload && setHoverYear(s.activeLabel)}
                onMouseLeave={() => setHoverYear(null)}
              >
                <defs>
                  <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C.indigoMid} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={C.indigoMid} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gPrin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#A5B4FC" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="year" tickLine={false} axisLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                  tickFormatter={v => v % 5 === 0 ? `Y${v}` : ""}
                  interval={0}
                />
                <YAxis
                  tickLine={false} axisLine={false} width={72}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                  tickFormatter={v => fmtAxis(v, currency)}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                {hoverYear !== null && (
                  <ReferenceLine x={hoverYear} stroke={C.indigo} strokeDasharray="4 4" strokeOpacity={0.4} />
                )}
                <Area
                  type="monotone" dataKey="principal"
                  stroke="#C7D2FE" strokeWidth={1.5} fill="url(#gPrin)" dot={false}
                />
                <Area
                  type="monotone" dataKey="value"
                  stroke={C.indigo} strokeWidth={2.5} fill="url(#gVal)" dot={false}
                  activeDot={{ r: 6, fill: C.indigo, stroke: "white", strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart legend */}
          <div style={{ display: "flex", gap: 20, justifyContent: "center", paddingBottom: 4 }}>
            {[
              { color: C.indigo, label: "Portfolio Value" },
              { color: "#C7D2FE", label: "Total Contributed" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 24, height: 3, background: color, borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── STATS STRIP ──────────────────── */}
          <div style={{ margin: "16px 28px 4px", background: C.darkBg, borderRadius: 24, padding: "20px 28px" }}>
            <div className="bloom-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px 24px" }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#818CF8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Projected Value (30Y)
                </p>
                <p style={{ margin: 0, color: "white", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                  {fmtMoney(projected, currency)}
                </p>
              </div>
              <StatPill label="Total Contributed"  value={fmtMoney(contributed, currency)} />
              <StatPill label="Net Gain"            value={`+${fmtMoney(netGain, currency)}`} highlight />
              <StatPill label="Growth Multiple"     value={`${multiple}×`} highlight />
            </div>
          </div>

          {/* ── SLIDERS ──────────────────────── */}
          <div className="bloom-card-pad" style={{ padding: "20px 36px 36px", display: "flex", flexDirection: "column", gap: 26 }}>
            <Slider
              label="Initial Deposit"
              value={initial} min={0} max={100000} step={100}
              onChange={setInitial}
              display={v => fmtMoney(v, currency)}
            />
            <Slider
              label="Monthly Contribution"
              value={monthly} min={0} max={10000} step={50}
              onChange={setMonthly}
              display={v => fmtMoney(v, currency)}
            />
            <Slider
              label="Annual Growth Rate"
              value={rate} min={0} max={20} step={0.1}
              onChange={setRate}
              display={v => `${v.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* ── CTA BELOW CARD ───────────────────────────── */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button className="bloom-cta" style={{
            background: C.darkBg, color: "white", border: "none",
            borderRadius: 999, padding: "14px 36px",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", letterSpacing: "0.01em",
            boxShadow: "0 8px 28px rgba(79,70,229,0.28)",
            transition: "background .15s, transform .12s, box-shadow .15s",
          }}>
            Start Growing Today →
          </button>
          <p style={{ color: "#94A3B8", fontSize: 12, marginTop: 10, fontWeight: 500 }}>
            No lockups · No delays · Fully liquid, always
          </p>
        </div>
      </section>
    </div>
  );
}

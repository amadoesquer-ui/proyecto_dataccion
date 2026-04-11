import React, { useState, useEffect, useMemo } from 'react';
import datosJSON from './data/endireh_minificado.json';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Minus } from 'lucide-react';

const formatoNumero = (num) => new Intl.NumberFormat('es-MX').format(Math.round(num));

const ESTADOS_MEXICO = [
  { id: 1, nom: 'Aguascalientes' }, { id: 2, nom: 'Baja California' }, { id: 3, nom: 'Baja California Sur' },
  { id: 4, nom: 'Campeche' }, { id: 5, nom: 'Coahuila' }, { id: 6, nom: 'Colima' },
  { id: 7, nom: 'Chiapas' }, { id: 8, nom: 'Chihuahua' }, { id: 9, nom: 'Ciudad de México' },
  { id: 10, nom: 'Durango' }, { id: 11, nom: 'Guanajuato' }, { id: 12, nom: 'Guerrero' },
  { id: 13, nom: 'Hidalgo' }, { id: 14, nom: 'Jalisco' }, { id: 15, nom: 'México' },
  { id: 16, nom: 'Michoacán' }, { id: 17, nom: 'Morelos' }, { id: 18, nom: 'Nayarit' },
  { id: 19, nom: 'Nuevo León' }, { id: 20, nom: 'Oaxaca' }, { id: 21, nom: 'Puebla' },
  { id: 22, nom: 'Querétaro' }, { id: 23, nom: 'Quintana Roo' }, { id: 24, nom: 'San Luis Potosí' },
  { id: 25, nom: 'Sinaloa' }, { id: 26, nom: 'Sonora' }, { id: 27, nom: 'Tabasco' },
  { id: 28, nom: 'Tamaulipas' }, { id: 29, nom: 'Tlaxcala' }, { id: 30, nom: 'Veracruz' },
  { id: 31, nom: 'Yucatán' }, { id: 32, nom: 'Zacatecas' }
];

// ─── 10 TIPOS DE VIOLENCIA ──────────────────────────────────────────────────
const GRUPOS_VIOLENCIA = [
  { grupo: 'Total', base: 'prev_viol_total', tieneVida: true },
  { grupo: 'Psicológica', base: 'prev_viol_psicologica', tieneVida: true },
  { grupo: 'Física', base: 'prev_viol_fisica', tieneVida: true },
  { grupo: 'Sexual', base: 'prev_viol_sexual', tieneVida: true },
  { grupo: 'Económica', base: 'prev_viol_economica', tieneVida: true },
  { grupo: 'Familiar', base: 'prev_viol_familiar', tieneVida: false },
  { grupo: 'De pareja', base: 'prev_viol_pareja', tieneVida: true, vidaSufijo: '_lr' },
  { grupo: 'Comunitaria', base: 'prev_viol_comunitaria', tieneVida: true },
  { grupo: 'Escolar', base: 'prev_viol_escolar', tieneVida: true },
  { grupo: 'Laboral', base: 'prev_viol_laboral', tieneVida: true },
];

function buildViolId(grupoObj, periodo) {
  if (periodo === 'vida') {
    if (!grupoObj.tieneVida) return grupoObj.base + '_12m';
    return grupoObj.base + (grupoObj.vidaSufijo || '_lv');
  }
  return grupoObj.base + '_12m';
}

function getEtiquetaCompleta(grupoObj, periodo) {
  const tipo = grupoObj.grupo.toLowerCase();
  if (periodo === 'vida') {
    if (!grupoObj.tieneVida) return `Prevalencia de violencia ${tipo} en los últimos 12 meses`;
    if (grupoObj.vidaSufijo === '_lr') return `Prevalencia de violencia ${tipo} a lo largo de la relación`;
    return `Prevalencia de violencia ${tipo} a lo largo de la vida`;
  }
  return `Prevalencia de violencia ${tipo} en los últimos 12 meses`;
}

// ─── CATÁLOGOS ───────────────────────────────────────────────────────────────
const NIVELES_ACADEMICOS = [
  { val: '0', etiqueta: 'Ninguno' },
  { val: '1', etiqueta: 'Preescolar' },
  { val: '2', etiqueta: 'Primaria' },
  { val: '3', etiqueta: 'Secundaria' },
  { val: '4', etiqueta: 'Preparatoria' },
  { val: '5', etiqueta: 'Técnico con primaria' },
  { val: '6', etiqueta: 'Técnico con secundaria' },
  { val: '7', etiqueta: 'Técnico con preparatoria' },
  { val: '8', etiqueta: 'Normal básica' },
  { val: '9', etiqueta: 'Normal licenciatura' },
  { val: '10', etiqueta: 'Licenciatura' },
  { val: '11', etiqueta: 'Posgrado' },
];

const SITUACION_CONYUGAL = [
  { val: '1', etiqueta: 'Unión libre' },
  { val: '2', etiqueta: 'Separada' },
  { val: '3', etiqueta: 'Divorciada' },
  { val: '4', etiqueta: 'Viuda' },
  { val: '5', etiqueta: 'Casada' },
  { val: '6', etiqueta: 'Soltera' },
];

const SI_NO = [{ val: '1', etiqueta: 'Sí' }, { val: '2', etiqueta: 'No' }];

const INDIGENA_OPTS = [
  { val: '1', etiqueta: 'Sí' },
  { val: '2', etiqueta: 'Sí, en parte' },
  { val: '3', etiqueta: 'No' },
];

// ─── SELECTOR DE VIOLENCIA (10 tipos + periodo) ─────────────────────────────
function SelectorViolencia({ grupoSel, setGrupoSel, periodoSel, setPeriodoSel, tema, fs }) {
  const grupoObj = GRUPOS_VIOLENCIA.find(g => g.grupo === grupoSel) || GRUPOS_VIOLENCIA[0];
  const etiqueta = getEtiquetaCompleta(grupoObj, periodoSel);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 4 }}>
          {GRUPOS_VIOLENCIA.map((g) => {
            const activo = g.grupo === grupoSel;
            return (
              <button key={g.grupo} onClick={() => setGrupoSel(g.grupo)}
                style={{ whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: 99, fontSize: fs(11), fontFamily: "'DM Sans', sans-serif", fontWeight: activo ? 600 : 400, border: `1.5px solid ${activo ? tema.accent : `${tema.text}20`}`, background: activo ? tema.accent : 'transparent', color: activo ? tema.accentTextOnBg : tema.text, cursor: 'pointer', transition: 'all 0.2s' }}>
                {g.grupo}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {grupoObj.tieneVida && (
          <button onClick={() => setPeriodoSel('vida')}
            style={{ padding: '4px 12px', borderRadius: 99, fontSize: fs(10), fontFamily: "'DM Sans', sans-serif", fontWeight: periodoSel === 'vida' ? 600 : 400, border: `1px solid ${periodoSel === 'vida' ? tema.accent : `${tema.text}15`}`, background: periodoSel === 'vida' ? `${tema.accent}20` : 'transparent', color: periodoSel === 'vida' ? tema.accent : `${tema.text}99`, cursor: 'pointer', transition: 'all 0.2s' }}>
            {grupoObj.vidaSufijo === '_lr' ? 'A lo largo de la relación' : 'A lo largo de la vida'}
          </button>
        )}
        <button onClick={() => setPeriodoSel('12m')}
          style={{ padding: '4px 12px', borderRadius: 99, fontSize: fs(10), fontFamily: "'DM Sans', sans-serif", fontWeight: periodoSel === '12m' ? 600 : 400, border: `1px solid ${periodoSel === '12m' ? tema.accent : `${tema.text}15`}`, background: periodoSel === '12m' ? `${tema.accent}20` : 'transparent', color: periodoSel === '12m' ? tema.accent : `${tema.text}99`, cursor: 'pointer', transition: 'all 0.2s' }}>
          Últimos 12 meses
        </button>
      </div>
      <p style={{ fontSize: fs(10), opacity: 0.5, marginTop: 6, fontStyle: 'italic', textAlign: 'center' }}>{etiqueta}</p>
    </div>
  );
}

// ─── RADIAL BAR CHART ────────────────────────────────────────────────────────
function RadialBarChart({ datosRadial, indiceActivo, setIndiceActivo, tema }) {
  const SIZE = 420; const cx = SIZE / 2; const cy = SIZE / 2;
  const minR = 55; const maxR = 195; const N = datosRadial.length;
  const gapDeg = 1.8; const sliceDeg = (360 / N) - gapDeg;
  const polar = (deg, r) => ({ x: cx + r * Math.cos(deg * Math.PI / 180), y: cy + r * Math.sin(deg * Math.PI / 180) });
  const arc = (s, e, ri, ro) => {
    const s1 = polar(s, ro), e1 = polar(e, ro), s2 = polar(e, ri), e2 = polar(s, ri);
    const lg = (e - s) > 180 ? 1 : 0;
    return `M${s1.x},${s1.y} A${ro},${ro},0,${lg},1,${e1.x},${e1.y} L${s2.x},${s2.y} A${ri},${ri},0,${lg},0,${e2.x},${e2.y} Z`;
  };
  const seg = datosRadial[indiceActivo]; const pct = seg ? seg.pct.toFixed(1) : '0.0';
  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE, maxWidth: '100%' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block', overflow: 'visible' }}>
          {[0.33, 0.66, 1.0].map((f, i) => <circle key={i} cx={cx} cy={cy} r={minR + f * (maxR - minR)} fill="none" stroke={`${tema.text}12`} strokeWidth={0.8} strokeDasharray="3 4" />)}
          {datosRadial.map((d, i) => {
            const sD = i * (360 / N) - 90, eD = sD + sliceDeg;
            const oR = minR + (d.pct / 100) * (maxR - minR);
            return <path key={i} d={arc(sD, eD, minR, Math.max(oR, minR + 2))} fill={i === indiceActivo ? tema.accent : `${tema.text}30`} opacity={i === indiceActivo ? 1 : 0.5} style={{ transition: 'fill 0.3s, opacity 0.3s', cursor: 'pointer' }} onClick={() => setIndiceActivo(i)} />;
          })}
          <circle cx={cx} cy={cy} r={minR - 4} fill={tema.bg} style={{ transition: 'fill 0.5s' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', width: (minR - 4) * 2 * 0.85 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: Math.min(36, (minR - 4) * 0.65), fontWeight: 900, color: tema.accent, lineHeight: 1, display: 'block' }}>{pct}%</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: `${tema.text}80`, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3, display: 'block' }}>del total de mujeres</span>
        </div>
      </div>
    </div>
  );
}

// ─── DOT PLOT 100 ────────────────────────────────────────────────────────────
function DotPlot100({ nombre, pctEstado, pctNacional, tema, fs }) {
  const masAlto = pctEstado > pctNacional;
  const color = masAlto ? '#c2410c' : '#7c3aed';
  const COLS = 25; const step = 13; const svgW = COLS * step + 4; const svgH = 4 * step + 4;
  const filled = Math.min(Math.round(pctEstado), 100);
  const nacIdx = Math.max(0, Math.min(Math.round(pctNacional) - 1, 99));
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: fs(11), fontWeight: 600, color: tema.text, maxWidth: '55%', opacity: 0.85 }}>{nombre}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: fs(10), color, fontWeight: 700 }}>{pctEstado}%</span>
          <span style={{ fontSize: fs(10), color: `${tema.text}60` }}>/ {pctNacional}% nac.</span>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const x = (i % COLS) * step + 6.5 + 2, y = Math.floor(i / COLS) * step + 6.5 + 2;
          if (i === nacIdx) return <circle key={i} cx={x} cy={y} r={6} fill={i < filled ? color : 'none'} stroke={`${tema.text}50`} strokeWidth={1.5} opacity={0.95} />;
          return <circle key={i} cx={x} cy={y} r={4.5} fill={i < filled ? color : `${tema.text}15`} opacity={i < filled ? 0.8 : 0.4} />;
        })}
      </svg>
    </div>
  );
}

// ─── DOT HISTOGRAM ───────────────────────────────────────────────────────────
function DotHistogram({ histogramaEdades, edadUsuario, tema }) {
  if (!histogramaEdades) return null;
  const bins = Object.keys(histogramaEdades), vals = Object.values(histogramaEdades);
  const maxV = Math.max(...vals); const dPB = 20; const bW = 32; const dR = 4; const dS = dR * 2 + 1.5;
  const cH = dPB * dS + 24; const cW = bins.length * (bW + 4) + 10;
  const edad = parseInt(edadUsuario);
  const getBin = (e) => { if (isNaN(e)) return -1; if (e <= 19) return 0; if (e <= 24) return 1; if (e <= 29) return 2; if (e <= 34) return 3; if (e <= 39) return 4; if (e <= 44) return 5; if (e <= 49) return 6; if (e <= 54) return 7; if (e <= 59) return 8; if (e <= 64) return 9; return 10; };
  const uB = getBin(edad);
  return (
    // CÓDIGO MODIFICADO
    <div style={{ overflowX: 'auto', marginBottom: 12, marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24, paddingBottom: 8 }}>
      <svg width={cW} height={cH} viewBox={`0 0 ${cW} ${cH}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
        {bins.map((bin, bi) => {
          const fD = Math.max(1, Math.round((vals[bi] / maxV) * dPB));
          const x = bi * (bW + 4) + 5; const isU = bi === uB;
          const dC = isU ? tema.accent : `${tema.text}50`;
          return (
            <g key={bin}>
              {isU && <line x1={x + bW / 2} y1={0} x2={x + bW / 2} y2={cH - 18} stroke={tema.accent} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />}
              {Array.from({ length: dPB }).map((_, di) => <circle key={di} cx={x + bW / 2} cy={di * dS + dR + 2} r={dR} fill={di >= dPB - fD ? dC : `${tema.text}10`} opacity={di >= dPB - fD ? (isU ? 0.95 : 0.6) : 0.3} />)}
              <text x={x + bW / 2} y={cH - 4} textAnchor="middle" style={{ fontSize: 8, fill: isU ? tema.accent : `${tema.text}60`, fontFamily: "'DM Sans', sans-serif", fontWeight: isU ? 700 : 400 }}>{bin}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── BARRAS HORIZONTALES ─────────────────────────────────────────────────────
function BarrasHorizontales({ datos, seleccionado, tema, fs }) {
  return (
    <div>{datos.map((d) => {
      const a = d.val === seleccionado;
      return (
        <div key={d.val} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: fs(12), fontWeight: a ? 700 : 400, color: a ? tema.accent : `${tema.text}80` }}>{d.etiqueta}</span>
            <span style={{ fontSize: fs(11), fontWeight: 600, color: a ? tema.accent : `${tema.text}60` }}>{d.pctViol.toFixed(1)}%</span>
          </div>
          <div style={{ width: '100%', height: a ? 14 : 10, borderRadius: 99, background: `${tema.text}10`, overflow: 'hidden', transition: 'height 0.3s' }}>
            <div style={{ width: `${Math.min(d.pctViol, 100)}%`, height: '100%', borderRadius: 99, background: a ? tema.accent : `${tema.text}35`, transition: 'width 0.5s, background 0.3s' }} />
          </div>
        </div>
      );
    })}</div>
  );
}

// ─── WAFFLE ──────────────────────────────────────────────────────────────────
function WaffleChart({ pctViol, label, tema, color }) {
  const f = Math.round(pctViol); const cs = 16; const g = 2; const sz = 10 * (cs + g);
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: tema.text, opacity: 0.8 }}>{label}</p>
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display: 'block', margin: '0 auto' }}>
        {Array.from({ length: 100 }).map((_, i) => <rect key={i} x={(i % 10) * (cs + g)} y={Math.floor(i / 10) * (cs + g)} width={cs} height={cs} rx={3} fill={i < f ? color : `${tema.text}10`} opacity={i < f ? 0.85 : 0.4} />)}
      </svg>
      <p style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Playfair Display', serif", color, marginTop: 6 }}>{pctViol.toFixed(1)}%</p>
    </div>
  );
}

// ─── GAUGE ───────────────────────────────────────────────────────────────────
function GaugeSemiCircle({ pctViol, label, tema, color }) {
  const r = 55; const s = 12; const ch = Math.PI * r; const f = (pctViol / 100) * ch;
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: tema.text, opacity: 0.8 }}>{label}</p>
      <svg width={r * 2 + s + 4} height={r + s + 20} viewBox={`0 0 ${r * 2 + s + 4} ${r + s + 20}`} style={{ display: 'block', margin: '0 auto' }}>
        <path d={`M ${s / 2 + 2} ${r + s / 2 + 2} A ${r} ${r} 0 0 1 ${r * 2 + s / 2 + 2} ${r + s / 2 + 2}`} fill="none" stroke={`${tema.text}12`} strokeWidth={s} strokeLinecap="round" />
        <path d={`M ${s / 2 + 2} ${r + s / 2 + 2} A ${r} ${r} 0 0 1 ${r * 2 + s / 2 + 2} ${r + s / 2 + 2}`} fill="none" stroke={color} strokeWidth={s} strokeLinecap="round" strokeDasharray={`${f} ${ch}`} style={{ transition: 'stroke-dasharray 0.6s' }} />
        <text x={r + s / 2 + 2} y={r + s / 2 - 4} textAnchor="middle" style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Playfair Display', serif", fill: color }}>{pctViol.toFixed(1)}%</text>
      </svg>
    </div>
  );
}

// ─── SLOPE CHART ─────────────────────────────────────────────────────────────
function SlopeChart({ datos, tema }) {
  if (!datos?.length) return null;
  const mx = Math.max(...datos.map(d => d.pctViol), 1);
  const W = 300; const H = 180; const pL = 110; const pR = 50; const pT = 16; const pB = 16;
  const uH = H - pT - pB;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {datos.map((d, i) => {
        const y = pT + (i / Math.max(datos.length - 1, 1)) * uH;
        const bW = (d.pctViol / mx) * (W - pL - pR);
        return (
          <g key={i}>
            <text x={pL - 8} y={y + 4} textAnchor="end" style={{ fontSize: 10, fill: `${tema.text}80`, fontFamily: "'DM Sans', sans-serif" }}>{d.label}</text>
            <rect x={pL} y={y - 5} width={Math.max(bW, 2)} height={10} rx={5} fill={tema.accent} opacity={0.7} />
            <text x={pL + bW + 6} y={y + 4} style={{ fontSize: 10, fill: tema.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{d.pctViol.toFixed(1)}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── CÁLCULOS ────────────────────────────────────────────────────────────────
function calcPrevGrupo(db, col, vals, violId) {
  if (!db) return [];
  const { columns: c, data: d } = db;
  const iF = c.indexOf('FAC_MUJ'), iG = c.indexOf(col), iV = c.indexOf(violId);
  if (iG < 0 || iV < 0 || iF < 0) return [];
  const ac = {}; vals.forEach(v => { ac[v.val] = { t: 0, v: 0 }; });
  for (let i = 0; i < d.length; i++) {
    const f = Number(d[i][iF]), raw = String(d[i][iG]).trim(), intV = String(parseInt(raw, 10));
    const k = ac[raw] !== undefined ? raw : ac[intV] !== undefined ? intV : null;
    if (k) { ac[k].t += f; if (String(d[i][iV]) === '1' || d[i][iV] === 1) ac[k].v += f; }
  }
  return vals.map(v => ({ val: v.val, etiqueta: v.etiqueta, pctViol: ac[v.val].t > 0 ? (ac[v.val].v / ac[v.val].t) * 100 : 0, total: ac[v.val].t }));
}

function calcPrevIngreso(db, colIng, colPer, violId) {
  if (!db) return [];
  const { columns: c, data: d } = db;
  const iF = c.indexOf('FAC_MUJ'), iI = c.indexOf(colIng), iP = c.indexOf(colPer), iV = c.indexOf(violId);
  if (iI < 0 || iV < 0 || iF < 0) return [];
  const rangos = [{ label: 'Sin ingreso', min: 0, max: 0 }, { label: '$1 – $3,000', min: 1, max: 3000 }, { label: '$3,001 – $6,000', min: 3001, max: 6000 }, { label: '$6,001 – $12,000', min: 6001, max: 12000 }, { label: '$12,001 – $25,000', min: 12001, max: 25000 }, { label: '$25,001+', min: 25001, max: Infinity }];
  const ac = rangos.map(() => ({ t: 0, v: 0 }));
  for (let i = 0; i < d.length; i++) {
    const ing = parseInt(d[i][iI], 10);
    if (isNaN(ing) || ing >= 999998) continue;
    const f = Number(d[i][iF]); let p = iP >= 0 ? String(d[i][iP]).trim() : '3';
    let m = ing; if (ing > 0) { if (p === '1') m = ing * 4; else if (p === '2') m = ing * 2; }
    const ri = rangos.findIndex(r => m >= r.min && m <= r.max);
    if (ri >= 0) { ac[ri].t += f; if (String(d[i][iV]) === '1' || d[i][iV] === 1) ac[ri].v += f; }
  }
  return rangos.map((r, i) => ({ label: r.label, pctViol: ac[i].t > 0 ? (ac[i].v / ac[i].t) * 100 : 0, total: ac[i].t }));
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function HistoriaEndireh() {
  const [pasoActual, setPasoActual] = useState(1);
  const [estadoSel, setEstadoSel] = useState(1);
  const [edadUsuario, setEdadUsuario] = useState('');
  const [datosBase, setDatosBase] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [grupoViol, setGrupoViol] = useState('Total');
  const [periodoViol, setPeriodoViol] = useState('vida');
  const [nivelSel, setNivelSel] = useState('10');
  const [leeSel, setLeeSel] = useState('1');
  const [escuelaSel, setEscuelaSel] = useState('2');
  const [indigenaSel, setIndigenaSel] = useState('3');
  const [trabajaSel, setTrabajaSel] = useState('1');
  const [conyugalSel, setConyugalSel] = useState('5');
  const [viveParejaSel, setViveParejaSel] = useState('1');
  const [parejaTraSel, setParejaTraSel] = useState('1');
  const [indiceRadial, setIndiceRadial] = useState(0);
  const [fontScale, setFontScale] = useState(1.0);
  const fs = (b) => Math.round(b * fontScale);

  const TOTAL_PASOS = 12;
  const gObj = GRUPOS_VIOLENCIA.find(g => g.grupo === grupoViol) || GRUPOS_VIOLENCIA[0];
  const tipoViol = buildViolId(gObj, periodoViol);
  const nombreViol = getEtiquetaCompleta(gObj, periodoViol);

  const temas = {
    1: { bg: '#ffffff', text: '#1a0a0a', accent: '#c0392b', accentTextOnBg: '#fff' },
    2: { bg: '#faf8f6', text: '#1a0a0a', accent: '#c0392b', accentTextOnBg: '#fff' },
    3: { bg: '#f5eae6', text: '#1a0a0a', accent: '#b91c1c', accentTextOnBg: '#fff' },
    4: { bg: '#ebd5ce', text: '#1a0a0a', accent: '#991b1b', accentTextOnBg: '#fff' },
    5: { bg: '#d4a89c', text: '#1a0a0a', accent: '#1a0a0a', accentTextOnBg: '#f5eae6' },
    6: { bg: '#9b3b3b', text: '#fce8e4', accent: '#0d0505', accentTextOnBg: '#fce8e4' },
    7: { bg: '#6b1e1e', text: '#f5ddd8', accent: '#0d0505', accentTextOnBg: '#f5ddd8' },
    8: { bg: '#4a1212', text: '#f0d0c8', accent: '#f0d0c8', accentTextOnBg: '#4a1212' },
    9: { bg: '#2d0e0e', text: '#e8c0b8', accent: '#e8c0b8', accentTextOnBg: '#2d0e0e' },
    10: { bg: '#1a0808', text: '#e0b0a8', accent: '#f5f5f5', accentTextOnBg: '#1a0808' },
    11: { bg: '#0d0404', text: '#d8a098', accent: '#ffffff', accentTextOnBg: '#0d0404' },
    12: { bg: '#050202', text: '#d0908a', accent: '#ffffff', accentTextOnBg: '#050202' },
  };
  const tema = temas[pasoActual] || temas[1];
  const NOMBRES = ['Inicio', 'Tipos de violencia', 'Entidad Federativa', 'Edad', 'Estudios', 'Alfabetismo', 'Autoadscripción indígena', 'Condición de trabajo', 'Condición de pareja', 'Economía de pareja', 'Qué sigue', 'Fin'];

  useEffect(() => {
    if (datosJSON) {
      setDatosBase(datosJSON);
      setCargando(false);
    }
  }, []);

  const metricas = useMemo(() => {
    if (!datosBase) return null;
    const { columns: c, data: d } = datosBase;
    const iF = c.indexOf('FAC_MUJ'), iV = c.indexOf('prev_viol_total_lv');
    let tM = 0, tV = 0;
    for (let i = 0; i < d.length; i++) { const f = Number(d[i][iF]); tM += f; if (d[i][iV] === 1 || d[i][iV] === '1') tV += f; }
    return { totalMujeres: tM, totalViolenciaLV: tV };
  }, [datosBase]);

  const datosRadial = useMemo(() => {
    if (!datosBase) return [];
    const { columns: c, data: d } = datosBase; const iF = c.indexOf('FAC_MUJ');
    const tipos = GRUPOS_VIOLENCIA.map(g => ({ label: g.grupo, col: g.base + (g.tieneVida ? (g.vidaSufijo || '_lv') : '_12m') }));
    let tM = 0; const sums = tipos.map(() => 0);
    for (let i = 0; i < d.length; i++) { const f = Number(d[i][iF]); tM += f; tipos.forEach((t, ti) => { const idx = c.indexOf(t.col); if (idx >= 0 && (d[i][idx] === 1 || d[i][idx] === '1')) sums[ti] += f; }); }
    return tipos.map((t, ti) => ({ label: t.label, pct: tM > 0 ? parseFloat(((sums[ti] / tM) * 100).toFixed(1)) : 0 }));
  }, [datosBase]);

  const metricasEstado = useMemo(() => {
    if (!datosBase) return [];
    const { columns: c, data: d } = datosBase; const iF = c.indexOf('FAC_MUJ'); const iE = c.indexOf('CVE_ENT');
    const inds = GRUPOS_VIOLENCIA.flatMap(g => {
      const a = [{ id: g.base + '_12m', grupo: g.grupo, per: '12m' }];
      if (g.tieneVida) a.unshift({ id: g.base + (g.vidaSufijo || '_lv'), grupo: g.grupo, per: 'vida' });
      return a;
    }).map(i => ({ ...i, ci: c.indexOf(i.id) }));
    let pN = 0, pE = 0; const cN = {}, cE = {};
    inds.forEach(i => { cN[i.id] = 0; cE[i.id] = 0; });
    for (let i = 0; i < d.length; i++) {
      const f = Number(d[i][iF]); const esE = parseInt(d[i][iE], 10) === estadoSel;
      pN += f; if (esE) pE += f;
      for (const ind of inds) { if (ind.ci >= 0 && (d[i][ind.ci] === 1 || d[i][ind.ci] === '1')) { cN[ind.id] += f; if (esE) cE[ind.id] += f; } }
    }
    return inds.map(i => ({ id: i.id, grupo: i.grupo, periodo: i.per, nombre: `Violencia ${i.grupo.toLowerCase()}`, pctEstado: pE > 0 ? parseFloat(((cE[i.id] / pE) * 100).toFixed(1)) : 0, pctNacional: pN > 0 ? parseFloat(((cN[i.id] / pN) * 100).toFixed(1)) : 0 }));
  }, [datosBase, estadoSel]);

  const histEdades = useMemo(() => {
    if (!datosBase) return null;
    const { columns: c, data: d } = datosBase; const iF = c.indexOf('FAC_MUJ'); const iA = c.indexOf('EDAD'); const iV = c.indexOf(tipoViol);
    if (iV < 0) return null;
    const dist = { '15-19': 0, '20-24': 0, '25-29': 0, '30-34': 0, '35-39': 0, '40-44': 0, '45-49': 0, '50-54': 0, '55-59': 0, '60-64': 0, '65+': 0 };
    for (let i = 0; i < d.length; i++) {
      if (d[i][iV] === 1 || d[i][iV] === '1') {
        const e = parseInt(d[i][iA], 10); const f = Number(d[i][iF]);
        if (e >= 15 && e <= 19) dist['15-19'] += f; else if (e <= 24) dist['20-24'] += f; else if (e <= 29) dist['25-29'] += f;
        else if (e <= 34) dist['30-34'] += f; else if (e <= 39) dist['35-39'] += f; else if (e <= 44) dist['40-44'] += f;
        else if (e <= 49) dist['45-49'] += f; else if (e <= 54) dist['50-54'] += f; else if (e <= 59) dist['55-59'] += f;
        else if (e <= 64) dist['60-64'] += f; else if (e >= 65 && e <= 96) dist['65+'] += f;
      }
    }
    return dist;
  }, [datosBase, tipoViol]);

  const metEdad = useMemo(() => {
    if (!datosBase || !edadUsuario) return { menores: 0, mayores: 0 };
    const { columns: c, data: d } = datosBase; const iF = c.indexOf('FAC_MUJ'); const iA = c.indexOf('EDAD'); const iV = c.indexOf(tipoViol);
    if (iV < 0) return { menores: 0, mayores: 0 };
    let mn = 0, my = 0; const eN = parseInt(edadUsuario);
    for (let i = 0; i < d.length; i++) { if (d[i][iV] === 1 || d[i][iV] === '1') { if (d[i][iA] <= eN) mn += d[i][iF]; else my += d[i][iF]; } }
    return { menores: mn, mayores: my };
  }, [datosBase, edadUsuario, tipoViol]);

  const prevNivel = useMemo(() => calcPrevGrupo(datosBase, 'NIV', NIVELES_ACADEMICOS, tipoViol), [datosBase, tipoViol]);
  const prevLee = useMemo(() => calcPrevGrupo(datosBase, 'P2_8', SI_NO, tipoViol), [datosBase, tipoViol]);
  const prevEscuela = useMemo(() => calcPrevGrupo(datosBase, 'P2_9', SI_NO, tipoViol), [datosBase, tipoViol]);
  const prevIndigena = useMemo(() => calcPrevGrupo(datosBase, 'P2_10', INDIGENA_OPTS, tipoViol), [datosBase, tipoViol]);
  const prevTrabaja = useMemo(() => calcPrevGrupo(datosBase, 'P2_13', SI_NO, tipoViol), [datosBase, tipoViol]);
  const prevConyugal = useMemo(() => calcPrevGrupo(datosBase, 'P3_1', SITUACION_CONYUGAL, tipoViol), [datosBase, tipoViol]);
  const prevViveP = useMemo(() => calcPrevGrupo(datosBase, 'P3_2', SI_NO, tipoViol), [datosBase, tipoViol]);
  const prevParejaT = useMemo(() => calcPrevGrupo(datosBase, 'P4_3', [{ val: '1', etiqueta: 'Sí trabaja' }, { val: '2', etiqueta: 'No trabaja' }], tipoViol), [datosBase, tipoViol]);
  const prevIngPro = useMemo(() => calcPrevIngreso(datosBase, 'P4_2', 'P4_2_1', tipoViol), [datosBase, tipoViol]);
  const prevIngPar = useMemo(() => calcPrevIngreso(datosBase, 'P4_5_AB', 'P4_5_1_AB', tipoViol), [datosBase, tipoViol]);

  const nomEstado = ESTADOS_MEXICO.find(e => e.id === estadoSel)?.nom || '';

  if (cargando) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#7a6e68' }}>Cargando datos...</div>;
  if (!datosBase) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>Error: No se encontró el archivo.</div>;

  const Chip = ({ opciones, valor, onChange, small }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
      {opciones.map(o => {
        const a = o.val === valor; return (
          <button key={o.val} onClick={() => onChange(o.val)} style={{ padding: small ? '4px 10px' : '6px 14px', borderRadius: 99, fontSize: fs(small ? 11 : 12), fontFamily: "'DM Sans', sans-serif", fontWeight: a ? 600 : 400, border: `1.5px solid ${a ? tema.accent : `${tema.text}20`}`, background: a ? tema.accent : 'transparent', color: a ? tema.accentTextOnBg : tema.text, cursor: 'pointer', transition: 'all 0.2s' }}>{o.etiqueta}</button>
        );
      })}
    </div>
  );

  const vP = { grupoSel: grupoViol, setGrupoSel: setGrupoViol, periodoSel: periodoViol, setPeriodoSel: setPeriodoViol, tema, fs };
  const estFilt = metricasEstado.filter(m => m.periodo === periodoViol);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ minHeight: '100dvh', width: '100%', background: tema.bg, color: tema.text, display: 'flex', flexDirection: 'column', transition: 'background 0.8s ease, color 0.5s ease', fontFamily: "'DM Sans', sans-serif" }}>

        {/* HEADER */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '14px 24px 8px', background: tema.bg, transition: 'background 0.8s ease', borderBottom: `1px solid ${tema.text}15` }}>
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            {Array.from({ length: TOTAL_PASOS }).map((_, i) => <div key={i} style={{ height: 3, flex: i + 1 === pasoActual ? 3 : 1, borderRadius: 99, background: i + 1 <= pasoActual ? tema.accent : `${tema.text}20`, transition: 'flex 0.4s, background 0.4s' }} />)}
          </div>
          <div style={{ maxWidth: 480, margin: '5px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: fs(10), letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4 }}>DAT4cción — Yo. Nosotras. Todas</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setFontScale(s => Math.max(0.8, s - 0.1))} style={{ width: 24, height: 24, borderRadius: 99, border: `1px solid ${tema.text}20`, background: 'transparent', color: tema.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Minus size={12} /></button>
              <button onClick={() => setFontScale(s => Math.min(1.5, s + 0.1))} style={{ width: 24, height: 24, borderRadius: 99, border: `1px solid ${tema.text}20`, background: 'transparent', color: tema.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Plus size={12} /></button>
              <span style={{ fontSize: fs(10), opacity: 0.4 }}>{pasoActual}/{TOTAL_PASOS}</span>
            </div>
          </div>
        </div>

        {/* CONTENT — AnimatePresence keyed ONLY on pasoActual */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 76, paddingBottom: 80 }} className="hide-scrollbar">
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 24px 0' }}>
            <AnimatePresence mode="wait">
              <motion.div key={pasoActual} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>

                {/* ═══ PASO 1 — Intro ═══ */}
                {pasoActual === 1 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Violencia basada en género </p>
                  {/* TEXTO_EDITABLE */}<h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(38), fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>Yo. Nosotras. Todas.</h1>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(16), lineHeight: 1.7, opacity: 0.75, marginBottom: 32 }}>A continuación podrás consultar los principales indicadores de violencia basada en género de la Encuesta Nacional sobre la Dinámica de las Relaciones en los Hogares (ENDIREH) 2021. Este tablero te permitirá ver qué tan prevalente es la violencia en la vida de las personas con tus características.</p>
                  <div style={{ height: 1, background: `${tema.text}12`, marginBottom: 32 }} />
                  <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                    <div style={{ flex: 1, background: `${tema.text}06`, borderRadius: 16, padding: '20px 16px' }}>
                      <p style={{ fontSize: fs(28), fontFamily: "'Playfair Display', serif", fontWeight: 900, color: tema.accent }}>{metricas ? formatoNumero(metricas.totalMujeres) : '—'}</p>
                      <p style={{ fontSize: fs(12), opacity: 0.55, marginTop: 4 }}>total de mujeres de 15 años o más en México</p>
                    </div>
                    <div style={{ flex: 1, background: `${tema.accent}12`, borderRadius: 16, padding: '20px 16px' }}>
                      <p style={{ fontSize: fs(28), fontFamily: "'Playfair Display', serif", fontWeight: 900, color: tema.accent }}>{metricas ? formatoNumero(metricas.totalViolenciaLV) : '—'}</p>
                      <p style={{ fontSize: fs(12), opacity: 0.55, marginTop: 4 }}>total de mujeres de 15 años o más en México que han vivido algún tipo de violencia</p>
                    </div>
                  </div>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(15), lineHeight: 1.75, opacity: 0.7 }}>Visita la página de la ENDIREH para saber más: <a href="https://www.inegi.org.mx/programas/endireh/2021/" target="_blank" rel="noopener noreferrer">https://www.inegi.org.mx/programas/endireh/2021/</a> </p>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(15), lineHeight: 1.75, opacity: 0.7 }}>Haz clic en el botón rojo para empezar. </p>
                </div>}

                {/* ═══ PASO 2 — Radial ═══ */}
                {pasoActual === 2 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Panorama general</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>Los tipos de violencia</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>Selecciona un tipo de violencia para ver su prevalencia a nivel nacional. Cada barra representa la proporción de mujeres afectadas a lo largo de su vida.</p>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 4 }}>
                      {datosRadial.map((d, i) => {
                        const a = i === indiceRadial; return (
                          <button key={i} onClick={() => setIndiceRadial(i)} style={{ whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: 99, fontSize: fs(11), fontWeight: a ? 600 : 400, border: `1.5px solid ${a ? tema.accent : `${tema.text}20`}`, background: a ? tema.accent : 'transparent', color: a ? tema.accentTextOnBg : tema.text, cursor: 'pointer', transition: 'all 0.2s' }}>{d.label}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ marginLeft: -48, marginRight: -48, display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
                    <RadialBarChart datosRadial={datosRadial} indiceActivo={indiceRadial} setIndiceActivo={setIndiceRadial} tema={tema} />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(16), fontWeight: 700 }}>Violencia {datosRadial[indiceRadial]?.label}</span>
                  </div>
                </div>}

                {/* ═══ PASO 3 — Estado (todas las gráficas, solo toggle periodo) ═══ */}
                {pasoActual === 3 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Tu entidad</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>¿Dónde vives?</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 16 }}>Cada bolita representa 1%. Las bolitas llenas muestran el valor de tu estado. La bolita grande indica el promedio nacional. Bolitas naranjas significa que ese tipo de violencia es más prevalente que el promedio nacional. Bolitas moradas significa que es menor.</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {ESTADOS_MEXICO.map(e => {
                      const a = estadoSel === e.id; return (
                        <button key={e.id} onClick={() => setEstadoSel(e.id)} style={{ whiteSpace: 'nowrap', padding: '3px 8px', borderRadius: 99, fontSize: fs(11), fontWeight: a ? 600 : 400, border: `1.5px solid ${a ? tema.accent : `${tema.text}20`}`, background: a ? tema.accent : 'transparent', color: a ? tema.accentTextOnBg : tema.text, cursor: 'pointer', transition: 'all 0.2s' }}>{e.nom}</button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                    <button onClick={() => setPeriodoViol('vida')} style={{ padding: '5px 14px', borderRadius: 99, fontSize: fs(11), fontWeight: periodoViol === 'vida' ? 600 : 400, border: `1.5px solid ${periodoViol === 'vida' ? tema.accent : `${tema.text}20`}`, background: periodoViol === 'vida' ? tema.accent : 'transparent', color: periodoViol === 'vida' ? tema.accentTextOnBg : tema.text, cursor: 'pointer', transition: 'all 0.2s' }}>A lo largo de la vida</button>
                    <button onClick={() => setPeriodoViol('12m')} style={{ padding: '5px 14px', borderRadius: 99, fontSize: fs(11), fontWeight: periodoViol === '12m' ? 600 : 400, border: `1.5px solid ${periodoViol === '12m' ? tema.accent : `${tema.text}20`}`, background: periodoViol === '12m' ? tema.accent : 'transparent', color: periodoViol === '12m' ? tema.accentTextOnBg : tema.text, cursor: 'pointer', transition: 'all 0.2s' }}>Últimos 12 meses</button>
                  </div>
                  <div style={{ borderRadius: 16, padding: '16px 8px', background: `${tema.text}04` }}>
                    <p style={{ fontSize: fs(10), opacity: 0.5, marginBottom: 10, paddingLeft: 4 }}>● llena = % de {nomEstado} | ◉ grande = % nacional | <span style={{ color: '#c2410c' }}>Naranja</span> = mayor que el promedio nacional | <span style={{ color: '#7c3aed' }}>Morado</span> = menor que el promedio nacional</p>
                    {estFilt.map(m => <DotPlot100 key={m.id} nombre={m.nombre} pctEstado={m.pctEstado} pctNacional={m.pctNacional} tema={tema} fs={fs} />)}
                  </div>
                </div>}

                {/* ═══ PASO 4 — Edad ═══ */}
                {pasoActual === 4 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Tu edad</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>¿Cuántos años tienes?</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>Ingresa tu edad para saber cuántas mujeres de tu edad o menores han vivido cierto tipo de violencia</p>
                  <SelectorViolencia {...vP} />
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: fs(12), opacity: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tu edad</label>
                    <input type="number" value={edadUsuario} onChange={(e) => setEdadUsuario(e.target.value)} placeholder="Ej. 28" style={{ width: '100%', fontSize: fs(42), fontFamily: "'Playfair Display', serif", fontWeight: 900, border: 'none', borderBottom: `2px solid ${edadUsuario ? tema.accent : `${tema.text}30`}`, background: 'transparent', outline: 'none', color: tema.text, padding: '4px 0' }} />
                  </div>
                  <div style={{ background: `${tema.text}05`, borderRadius: 16, padding: 16 }}>
                    <DotHistogram histogramaEdades={histEdades} edadUsuario={edadUsuario} tema={tema} />
                  </div>
                  {edadUsuario && <div style={{ marginTop: 16 }}>
                    <div style={{ borderLeft: `3px solid ${tema.accent}`, paddingLeft: 16, marginBottom: 12 }}>
                      {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(15), lineHeight: 1.7, opacity: 0.85 }}><strong style={{ color: tema.accent }}>{formatoNumero(metEdad.menores)}</strong> mujeres de {edadUsuario} años o menos han experimentado {nombreViol.toLowerCase()}.</p>
                    </div>
                    <div style={{ borderLeft: `3px solid ${tema.text}30`, paddingLeft: 16 }}>
                      <p style={{ fontSize: fs(15), lineHeight: 1.7, opacity: 0.7 }}>Y otras <strong>{formatoNumero(metEdad.mayores)}</strong> mujeres mayores que tú también lo han vivido.</p>
                    </div>
                  </div>}
                </div>}

                {/* ═══ PASO 5 — Nivel académico ═══ */}
                {pasoActual === 5 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Tu educación</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>¿Cuál es tu nivel de estudios?</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>La educación formal nos puede alejar de la violencia, pero difícilmente puede eliminarla. Selecciona tu nivel educativo para ver cómo se compara con los demás.</p>
                  <SelectorViolencia {...vP} />
                  <Chip opciones={NIVELES_ACADEMICOS} valor={nivelSel} onChange={setNivelSel} />
                  <div style={{ background: `${tema.text}05`, borderRadius: 16, padding: 16 }}><BarrasHorizontales datos={prevNivel} seleccionado={nivelSel} tema={tema} fs={fs} /></div>
                  {(() => { const d = prevNivel.find(x => x.val === nivelSel); return d ? <div style={{ marginTop: 16 }}><div style={{ borderLeft: `3px solid ${tema.accent}`, paddingLeft: 16 }}>{/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(15), lineHeight: 1.7, opacity: 0.85 }}>Entre mujeres con nivel <strong style={{ color: tema.accent }}>{d.etiqueta}</strong>, el <strong>{d.pctViol.toFixed(1)}%</strong> ha experimentado {nombreViol.toLowerCase()}.</p></div></div> : null; })()}
                </div>}

                {/* ═══ PASO 6 — Alfabetismo ═══ */}
                {pasoActual === 6 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Alfabetismo y escuela</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8, color: tema.text }}>La educación como antídoto</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>¿Saber leer y escribir puede hacer un cambio ante la violencia?</p>
                  <SelectorViolencia {...vP} />
                  <p style={{ fontSize: fs(13), fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>¿Sabes leer y escribir?</p>
                  <Chip opciones={SI_NO} valor={leeSel} onChange={setLeeSel} small />
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
                    {prevLee.map(d => <WaffleChart key={d.val} pctViol={d.pctViol} label={d.val === '1' ? 'Sí sabe leer' : 'No sabe leer'} tema={tema} color={d.val === leeSel ? tema.accent : `${tema.text}40`} />)}
                  </div>
                  <div style={{ height: 1, background: `${tema.text}12`, marginBottom: 20 }} />
                  <p style={{ fontSize: fs(13), fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>¿Asistes a la escuela?</p>
                  <Chip opciones={SI_NO} valor={escuelaSel} onChange={setEscuelaSel} small />
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    {prevEscuela.map(d => <WaffleChart key={d.val} pctViol={d.pctViol} label={d.val === '1' ? 'Sí asiste' : 'No asiste'} tema={tema} color={d.val === escuelaSel ? tema.accent : `${tema.text}40`} />)}
                  </div>
                </div>}

                {/* ═══ PASO 7 — Indígena ═══ */}
                {pasoActual === 7 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Identidad</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8, color: tema.text }}>¿Te consideras indígena?</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>La identidad indígena puede influir en la experiencia y vivencia de la violencia. Estos datos muestran la prevalencia para cada grupo. Por tus costumbres, raíces o tradiciones, ¿te consideras indígena?</p>
                  <SelectorViolencia {...vP} />
                  <Chip opciones={INDIGENA_OPTS} valor={indigenaSel} onChange={setIndigenaSel} />
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {prevIndigena.map(d => <GaugeSemiCircle key={d.val} pctViol={d.pctViol} label={d.etiqueta} tema={tema} color={d.val === indigenaSel ? tema.accent : `${tema.text}35`} />)}
                  </div>
                  {(() => { const d = prevIndigena.find(x => x.val === indigenaSel); return d ? <div style={{ marginTop: 20 }}><div style={{ borderLeft: `3px solid ${tema.accent}`, paddingLeft: 16 }}>{/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(15), lineHeight: 1.7, opacity: 0.85 }}>Entre mujeres que se consideran <strong style={{ color: tema.accent }}>{d.etiqueta.toLowerCase()}</strong> indígenas, el <strong>{d.pctViol.toFixed(1)}%</strong> ha experimentado {nombreViol.toLowerCase()}.</p></div></div> : null; })()}
                </div>}

                {/* ═══ PASO 8 — Trabajo ═══ */}
                {pasoActual === 8 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Tu economía</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8, color: tema.text }}>¿Trabajas? ¿Cuánto ganas?</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>La independencia económica se relaciona con algunos tipos de violencia, aunque lamentablemente puede exponernos a otros. A continuación se muestra la prevalencia de violencia según tu condición laboral.</p>
                  <SelectorViolencia {...vP} />
                  <p style={{ fontSize: fs(13), fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>¿Trabajaste la semana pasada?</p>
                  <Chip opciones={SI_NO} valor={trabajaSel} onChange={setTrabajaSel} small />
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
                    {prevTrabaja.map(d => <WaffleChart key={d.val} pctViol={d.pctViol} label={d.val === '1' ? 'Sí trabajé' : 'No trabajé'} tema={tema} color={d.val === trabajaSel ? tema.accent : `${tema.text}40`} />)}
                  </div>
                  <div style={{ height: 1, background: `${tema.text}12`, marginBottom: 20 }} />
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(13), fontWeight: 600, marginBottom: 12, opacity: 0.7 }}>Prevalencia de violencia por rango de ingreso mensual propio</p>
                  <div style={{ background: `${tema.text}05`, borderRadius: 16, padding: 16 }}><SlopeChart datos={prevIngPro} tema={tema} /></div>
                </div>}

                {/* ═══ PASO 9 — Condición de pareja ═══ */}
                {pasoActual === 9 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Tu relación</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8, color: tema.text }}>¿Cuál es tu situación de pareja?</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>La situación conyugal y la convivencia con alguien cercano afectan la percepción y vivencia de la violencia. ¿Cómo se compara tu situación con las demás?</p>
                  <SelectorViolencia {...vP} />
                  <Chip opciones={SITUACION_CONYUGAL} valor={conyugalSel} onChange={setConyugalSel} />
                  <div style={{ background: `${tema.text}05`, borderRadius: 16, padding: 16, marginBottom: 20 }}><BarrasHorizontales datos={prevConyugal} seleccionado={conyugalSel} tema={tema} fs={fs} /></div>
                  <div style={{ height: 1, background: `${tema.text}12`, marginBottom: 20 }} />
                  <p style={{ fontSize: fs(13), fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>¿Vives con esposo o pareja?</p>
                  <Chip opciones={SI_NO} valor={viveParejaSel} onChange={setViveParejaSel} small />
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    {prevViveP.map(d => <GaugeSemiCircle key={d.val} pctViol={d.pctViol} label={d.val === '1' ? 'Sí vive con pareja' : 'No vive con pareja'} tema={tema} color={d.val === viveParejaSel ? tema.accent : `${tema.text}35`} />)}
                  </div>
                </div>}

                {/* ═══ PASO 10 — Ingreso pareja ═══ */}
                {pasoActual === 10 && <div>
                  <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>Economía de pareja</p>
                  {/* TEXTO_EDITABLE */}<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(28), fontWeight: 900, lineHeight: 1.15, marginBottom: 8, color: tema.text }}>¿Tu pareja trabaja? ¿Cuánto gana?</h2>
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(14), opacity: 0.6, marginBottom: 20 }}>La dinámica económica puede afectar la prevalencia de violencia. Explora cómo.</p>
                  <SelectorViolencia {...vP} />
                  <p style={{ fontSize: fs(13), fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>¿Tu pareja trabaja por un ingreso?</p>
                  <Chip opciones={[{ val: '1', etiqueta: 'Sí' }, { val: '2', etiqueta: 'No' }]} valor={parejaTraSel} onChange={setParejaTraSel} small />
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
                    {prevParejaT.map(d => <WaffleChart key={d.val} pctViol={d.pctViol} label={d.etiqueta} tema={tema} color={d.val === parejaTraSel ? tema.accent : `${tema.text}40`} />)}
                  </div>
                  <div style={{ height: 1, background: `${tema.text}12`, marginBottom: 20 }} />
                  {/* TEXTO_EDITABLE */}<p style={{ fontSize: fs(13), fontWeight: 600, marginBottom: 12, opacity: 0.7 }}>Prevalencia de violencia por rango de ingreso mensual de la pareja</p>
                  <div style={{ background: `${tema.text}05`, borderRadius: 16, padding: 16 }}><SlopeChart datos={prevIngPar} tema={tema} /></div>
                </div>}

                {/* ═══ PASO 11 — Reflexión ═══ */}
                {pasoActual === 11 && (
                  <div>
                    <p style={{ fontSize: fs(12), letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>¿Qué sigue?</p>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(32), fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: tema.text }}>No estás sola</h2>

                    {[
                      'Reconocer la violencia es el primer paso para eliminarla.',
                      'Tienes derecho a vivir sin miedo. Existen instituciones listas para apoyarte y acompañarte en el proceso.',
                      'Si necesitas ayuda o quieres iniciar un proceso legal para denunciar algún tipo de violencia, consulta cómo hacerlo aquí:'
                    ].map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (i * 0.4) }}
                        viewport={{ once: true }}
                        style={{
                          marginBottom: 20,
                          paddingLeft: 16,
                          borderLeft: `3px solid ${tema.accent}`,
                          color: tema.text
                        }}
                      >
                        <p style={{
                          fontSize: fs(16),
                          lineHeight: 1.5,
                          fontWeight: i === 2 ? 600 : 400
                        }}>
                          {i === 2 ? (
                            <>
                              {t}
                              <br /> {/* Salto de línea antes del enlace */}
                              <a
                                href="https://mujeresseguras.cdmx.gob.mx/como-denunciar/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: tema.accent,
                                  textDecoration: 'underline',
                                  wordBreak: 'break-all',
                                  display: 'inline-block', // Asegura que el salto se respete bien
                                  marginTop: 8 // Opcional: un pequeño espacio extra
                                }}
                              >
                                mujeresseguras.cdmx.gob.mx
                              </a>
                            </>
                          ) : t}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* ═══ PASO 12 — Cierre ═══ */}
                {pasoActual === 12 && (
                  <div style={{ textAlign: 'center', paddingTop: 20 }}>
                    <div style={{ width: 48, height: 4, background: tema.accent, borderRadius: 99, margin: '0 auto 32px' }} />

                    {/* SECCIÓN AÑADIDA: Cita de Angela Davis */}
                    <div style={{ marginBottom: 40, padding: '0 20px' }}>
                      <p style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: fs(22),
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                        color: tema.text,
                        marginBottom: 12
                      }}>
                        "No estoy aceptando las cosas que no puedo cambiar, estoy cambiando las cosas que no puedo aceptar"
                      </p>
                      <p style={{
                        fontSize: fs(14),
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: tema.accent
                      }}>
                        — Angela Davis
                      </p>
                    </div>

                    <div style={{ height: 1, background: `${tema.text}20`, marginBottom: 32 }} />

                    {/* TEXTO_EDITABLE: Nombres de los autores */}
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: fs(18), opacity: 0.65, lineHeight: 1.7, marginBottom: 32, color: tema.text }}>
                      Trabajo realizado por Iliusi Donaji Vega del Valle, María de Lourdes Alejandra Miranda Herrera, Amado Esquer Martínez y Andrés Alcalá Rodríguez para participar en el DAT4cción 2026
                    </p>

                    <div style={{ height: 1, background: `${tema.text}20`, marginBottom: 32 }} />

                    <div style={{ marginTop: 40 }}>
                      <button onClick={() => setPasoActual(1)} style={{ padding: '12px 28px', borderRadius: 99, background: tema.accent, color: tema.accentTextOnBg, border: 'none', fontSize: fs(14), fontWeight: 600, cursor: 'pointer', letterSpacing: '0.06em' }}>
                        Recorrer de nuevo
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER NAV */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '14px 24px 20px', background: tema.bg, transition: 'background 0.8s ease', borderTop: `1px solid ${tema.text}12` }}>
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setPasoActual(p => Math.max(p - 1, 1))} disabled={pasoActual === 1} style={{ width: 44, height: 44, borderRadius: 99, border: `1.5px solid ${tema.text}20`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: pasoActual === 1 ? 'default' : 'pointer', opacity: pasoActual === 1 ? 0.2 : 0.7, color: tema.text, transition: 'all 0.2s' }}><ChevronLeft size={20} /></button>
            <p style={{ fontSize: fs(11), opacity: 0.4 }}>{NOMBRES[pasoActual - 1]}</p>
            <button onClick={() => setPasoActual(p => Math.min(p + 1, TOTAL_PASOS))} disabled={pasoActual === TOTAL_PASOS} style={{ width: 44, height: 44, borderRadius: 99, border: 'none', background: pasoActual === TOTAL_PASOS ? `${tema.text}15` : tema.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: pasoActual === TOTAL_PASOS ? 'default' : 'pointer', color: tema.accentTextOnBg, boxShadow: pasoActual === TOTAL_PASOS ? 'none' : `0 4px 14px ${tema.accent}55`, transition: 'all 0.3s', opacity: pasoActual === TOTAL_PASOS ? 0.3 : 1 }}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </>
  );
}

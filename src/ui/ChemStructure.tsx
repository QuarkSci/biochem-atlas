import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { ChemKey } from '@/data/types'

/**
 * 2D kimyoviy tuzilmalar — qo'lda chizilgan SVG. Nega kutubxona emas:
 * kerak bo'lgani atigi 5 ta chizma, lekin ularning har biri darslikdagidek
 * IZOHLANGAN bo'lishi kerak (qaysi atom nima qiladi, qaysi bog' uziladi) —
 * SMILES'dan avtomatik chizilgan rasm buni bermaydi.
 *
 * Ranglar 3D sahnadagi ranglar bilan bir xil: His192 sariq, Asp165 binafsha,
 * Arg to'q sariq/moviy, substrat pushti — o'quvchi 2D va 3D orasida
 * bog'lanishni ranglar orqali ko'radi.
 */

const C = {
  bond: '#cbd5e1',
  faint: '#64748b',
  o: '#ff6b6b',
  n: '#7cc4ff',
  his: '#ffcc00',
  asp: '#a78bfa',
  loop: '#ffa94d',
  clamp: '#4fd1c5',
  sub: '#ff2d78',
  nad: '#9ae6b4',
}

type Props = { chem: ChemKey; lang: 'uz' | 'en' }

const T = {
  reaction: {
    uz: ['Piruvat', 'L-laktat', 'NADH + H⁺', 'NAD⁺', 'LDH'],
    en: ['Pyruvate', 'L-lactate', 'NADH + H⁺', 'NAD⁺', 'LDH'],
  },
  reactionNote: {
    uz: 'H⁻ (hidrid) NADH ning C4 idan C2 uglerodga, H⁺ esa His192 dan kislorodga — bir qadamda.',
    en: 'H⁻ (hydride) from NADH C4 to the C2 carbon, H⁺ from His192 to the oxygen — in one step.',
  },
  hisAspNote: {
    uz: 'Asp165 imidazolni ushlab, pKa sini ko\'taradi — shundagina His192 fiziologik pH da proton bera oladi.',
    en: 'Asp165 holds the imidazole and raises its pKa — only then can His192 give up a proton at physiological pH.',
  },
  clampNote: {
    uz: 'Karboksilat ikki tishli tuz ko\'prigi bilan qotiriladi — substrat faqat bitta yuzi bilan NADH ga qaraydi.',
    en: 'The carboxylate is locked by a bidentate salt bridge — the substrate can present only one face to NADH.',
  },
  loop: { uz: ['OCHIQ', 'YOPIQ', 'substrat kiradi', '~10 Å'], en: ['OPEN', 'CLOSED', 'substrate enters', '~10 Å'] },
  loopNote: {
    uz: 'Yopilgach suv siqib chiqariladi va nikotinamid halqasi substratga 3–4 Å ga yaqinlashadi.',
    en: 'Once closed, water is excluded and the nicotinamide ring comes within 3–4 Å of the substrate.',
  },
  iso: {
    uz: ['yurak, eritrotsit', 'RES, limfa', "o'pka", 'buyrak, plasenta', 'jigar, mushak'],
    en: ['heart, red cells', 'RES, lymph', 'lung', 'kidney, placenta', 'liver, muscle'],
  },
  isoNote: {
    uz: 'H (LDHB) — laktat → piruvat, aerob to\'qima. M (LDHA) — piruvat → laktat, anaerob to\'qima.',
    en: 'H (LDHB) — lactate → pyruvate, aerobic tissue. M (LDHA) — pyruvate → lactate, anaerobic tissue.',
  },
}

/** Qo'sh bog' — ikkita parallel chiziq. */
function Double({ x1, y1, x2, y2, gap = 3 }: { x1: number; y1: number; x2: number; y2: number; gap?: number }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = (-dy / len) * gap
  const ny = (dx / len) * gap
  return (
    <>
      <line x1={x1 + nx} y1={y1 + ny} x2={x2 + nx} y2={y2 + ny} />
      <line x1={x1 - nx} y1={y1 - ny} x2={x2 - nx} y2={y2 - ny} />
    </>
  )
}

function Reaction({ lang }: { lang: 'uz' | 'en' }) {
  const t = T.reaction[lang]
  // Bitta 3-uglerodli skelet: CH3 — C2 — C1(=O)(O⁻). dx = gorizontal siljish.
  const Skeleton = ({ dx, alcohol }: { dx: number; alcohol: boolean }) => (
    <g transform={`translate(${dx} 0)`}>
      <text x="16" y="118" textAnchor="middle" fill={C.bond} fontSize="12">
        H₃C
      </text>
      <line x1="30" y1="114" x2="48" y2="114" />
      {alcohol ? (
        <>
          <line x1="56" y1="106" x2="56" y2="90" />
          <text x="56" y="84" textAnchor="middle" fill={C.o} fontSize="12">
            OH
          </text>
          <line x1="56" y1="122" x2="56" y2="134" stroke={C.nad} />
          <text x="56" y="148" textAnchor="middle" fill={C.nad} fontSize="11" fontWeight={600}>
            H
          </text>
        </>
      ) : (
        <>
          <Double x1={56} y1={106} x2={56} y2={90} />
          <text x="56" y="84" textAnchor="middle" fill={C.o} fontSize="12">
            O
          </text>
        </>
      )}
      <text x="56" y="118" textAnchor="middle" fill={alcohol ? C.bond : C.sub} fontSize="12" fontWeight={600}>
        C
      </text>
      <line x1="64" y1="114" x2="82" y2="114" />
      <Double x1={90} y1={106} x2={90} y2={90} />
      <text x="90" y="84" textAnchor="middle" fill={C.o} fontSize="12">
        O
      </text>
      <text x="90" y="118" textAnchor="middle" fill={C.bond} fontSize="12">
        C
      </text>
      <line x1="98" y1="114" x2="112" y2="114" />
      <text x="124" y="118" textAnchor="middle" fill={C.o} fontSize="12">
        O⁻
      </text>
    </g>
  )

  return (
    <svg viewBox="0 0 420 200" className="chem-svg" role="img">
      <g stroke={C.bond} strokeWidth="1.4" strokeLinecap="round" fill="none">
        <Skeleton dx={0} alcohol={false} />
        <Skeleton dx={280} alcohol={true} />
        {/* Muvozanat strelkalari */}
        <path d="M168 104 H252" markerEnd="url(#chem-arrow)" />
        <path d="M252 124 H168" markerEnd="url(#chem-arrow)" />
      </g>
      <defs>
        <marker id="chem-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill={C.bond} />
        </marker>
      </defs>
      <text x="210" y="96" textAnchor="middle" fill={C.nad} fontSize="11">
        {t[2]}
      </text>
      <text x="210" y="140" textAnchor="middle" fill={C.faint} fontSize="11">
        {t[3]}
      </text>
      <text x="210" y="160" textAnchor="middle" fill={C.his} fontSize="10" letterSpacing="0.12em">
        {t[4]}
      </text>
      <text x="62" y="176" textAnchor="middle" fill={C.sub} fontSize="11" fontWeight={600}>
        {t[0]}
      </text>
      <text x="342" y="176" textAnchor="middle" fill={C.sub} fontSize="11" fontWeight={600}>
        {t[1]}
      </text>
      {/* Yangi kiral markaz: hidrid aynan shu C2 ga keldi. */}
      <circle cx="336" cy="114" r="12" fill="none" stroke={C.nad} strokeWidth="1" strokeDasharray="2 2" />
      <text x="378" y="152" fill={C.nad} fontSize="9.5">
        {lang === 'uz' ? '← H⁻ (NADH dan)' : '← H⁻ (from NADH)'}
      </text>
    </svg>
  )
}

function HisAsp({ lang }: { lang: 'uz' | 'en' }) {
  // Imidazol halqasi — markaz (200,96), r 34. Burchaklar: Cε1 tepada.
  const cx = 200
  const cy = 96
  const r = 34
  const p = (deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)]
  const [ce1x, ce1y] = p(90)
  const [nd1x, nd1y] = p(162)
  const [cgx, cgy] = p(234)
  const [cd2x, cd2y] = p(306)
  const [ne2x, ne2y] = p(18)
  return (
    <svg viewBox="0 0 420 200" className="chem-svg" role="img">
      <g stroke={C.his} strokeWidth="1.5" strokeLinecap="round" fill="none">
        {/* Qo'sh bog'lar uchun bitta chiziq CHIZILMAYDI — Double o'zi ikkita
            parallel chiziq beradi, aks holda uch qator bo'lib ketadi. */}
        <line x1={ce1x} y1={ce1y} x2={nd1x} y2={nd1y} />
        <line x1={nd1x} y1={nd1y} x2={cgx} y2={cgy} />
        <line x1={cd2x} y1={cd2y} x2={ne2x} y2={ne2y} />
        <g strokeWidth="1.3">
          <Double x1={cgx} y1={cgy} x2={cd2x} y2={cd2y} gap={3.5} />
          <Double x1={ce1x} y1={ce1y} x2={ne2x} y2={ne2y} gap={3.5} />
        </g>
        {/* Yon zanjir: Cγ dan CH2 ga */}
        <path d={`M${cgx} ${cgy} L${cgx - 26} ${cgy + 22}`} />
      </g>
      <text x={cgx - 40} y={cgy + 34} fill={C.faint} fontSize="10">
        CH₂—
      </text>
      <circle cx={nd1x} cy={nd1y} r="9" fill="#0c1015" />
      <circle cx={ne2x} cy={ne2y} r="9" fill="#0c1015" />
      <text x={nd1x} y={nd1y + 4} textAnchor="middle" fill={C.n} fontSize="11" fontWeight={600}>
        N
      </text>
      <text x={ne2x} y={ne2y + 4} textAnchor="middle" fill={C.n} fontSize="11" fontWeight={600}>
        N
      </text>
      <text x={nd1x - 4} y={nd1y - 12} textAnchor="middle" fill={C.faint} fontSize="9">
        δ1
      </text>
      <text x={ne2x + 6} y={ne2y - 12} textAnchor="middle" fill={C.faint} fontSize="9">
        ε2
      </text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill={C.his} fontSize="10" letterSpacing="0.06em">
        His192
      </text>

      {/* Asp165 karboksilati, chapda */}
      <g stroke={C.asp} strokeWidth="1.5" strokeLinecap="round" fill="none">
        <line x1="58" y1="96" x2="78" y2="86" />
        <Double x1={78} y1={86} x2={98} y2={96} />
        <line x1="78" y1="86" x2="78" y2="64" />
      </g>
      <text x="48" y="100" textAnchor="end" fill={C.faint} fontSize="10">
        —CH₂
      </text>
      <text x="78" y="58" textAnchor="middle" fill={C.o} fontSize="11">
        O
      </text>
      <text x="106" y="100" textAnchor="middle" fill={C.o} fontSize="11">
        O⁻
      </text>
      <text x="82" y="126" textAnchor="middle" fill={C.asp} fontSize="10" letterSpacing="0.06em">
        Asp165
      </text>

      {/* 2.64 Å vodorod bog'i */}
      <line x1="118" y1="96" x2={nd1x - 12} y2={nd1y} stroke={C.asp} strokeWidth="1.3" strokeDasharray="4 3" />
      <text x={(118 + nd1x) / 2 - 4} y="86" textAnchor="middle" fill={C.asp} fontSize="10">
        2.64 Å
      </text>

      {/* Nε2 dan substrat kislorodiga proton */}
      <text x={ne2x + 14} y={ne2y - 2} fill={C.his} fontSize="11">
        H⁺
      </text>
      <path
        d={`M${ne2x + 14} ${ne2y + 10} L322 132`}
        stroke={C.his}
        strokeWidth="1.3"
        strokeDasharray="4 3"
        fill="none"
        markerEnd="url(#chem-arrow2)"
      />
      <defs>
        <marker id="chem-arrow2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill={C.his} />
        </marker>
      </defs>
      <g stroke={C.sub} strokeWidth="1.5" fill="none" strokeLinecap="round">
        <Double x1={336} y1={136} x2={336} y2={116} />
        <line x1="336" y1="136" x2="336" y2="156" />
      </g>
      <text x="336" y="112" textAnchor="middle" fill={C.o} fontSize="11">
        O
      </text>
      <text x="336" y="172" textAnchor="middle" fill={C.sub} fontSize="10">
        C2 ({lang === 'uz' ? 'substrat' : 'substrate'})
      </text>
    </svg>
  )
}

function ArgClamp({ lang }: { lang: 'uz' | 'en' }) {
  return (
    <svg viewBox="0 0 420 230" className="chem-svg" role="img">
      {/* Arg168 guanidiniy guruhi: markaziy C, tepada NH2+ (qo'sh bog'),
          pastda NH2, chapda yon zanjir. */}
      <g stroke={C.clamp} strokeWidth="1.5" strokeLinecap="round" fill="none">
        <Double x1={66} y1={104} x2={66} y2={84} gap={3} />
        <line x1="66" y1="120" x2="66" y2="142" />
      </g>
      <text x="58" y="116" textAnchor="end" fill={C.faint} fontSize="10.5">
        R—NH—
      </text>
      <text x="66" y="116" textAnchor="middle" fill={C.bond} fontSize="12" fontWeight={600}>
        C
      </text>
      <text x="66" y="78" textAnchor="middle" fill={C.n} fontSize="11">
        NH₂⁺
      </text>
      <text x="66" y="156" textAnchor="middle" fill={C.n} fontSize="11">
        NH₂
      </text>
      <text x="60" y="190" textAnchor="middle" fill={C.clamp} fontSize="10.5" letterSpacing="0.06em">
        Arg168
      </text>

      {/* Ikki tishli tuz ko'prigi: ikkala NH2 karboksilatning ikki kislorodiga. */}
      <line x1="88" y1="74" x2="176" y2="94" stroke={C.clamp} strokeWidth="1.3" strokeDasharray="4 3" />
      <line x1="88" y1="152" x2="176" y2="130" stroke={C.clamp} strokeWidth="1.3" strokeDasharray="4 3" />

      {/* Substrat karboksilati va C2 */}
      <text x="188" y="98" textAnchor="middle" fill={C.o} fontSize="12">
        O
      </text>
      <text x="188" y="134" textAnchor="middle" fill={C.o} fontSize="12">
        O⁻
      </text>
      <g stroke={C.sub} strokeWidth="1.5" strokeLinecap="round" fill="none">
        <Double x1={200} y1={96} x2={222} y2={108} gap={2.6} />
        <line x1="200" y1="130" x2="222" y2="118" />
        <line x1="238" y1="114" x2="262" y2="114" />
        <Double x1={272} y1={106} x2={272} y2={84} gap={3} />
        <line x1="272" y1="122" x2="272" y2="144" />
      </g>
      <text x="230" y="118" textAnchor="middle" fill={C.bond} fontSize="12">
        C
      </text>
      <text x="272" y="118" textAnchor="middle" fill={C.sub} fontSize="12" fontWeight={600}>
        C2
      </text>
      <text x="272" y="78" textAnchor="middle" fill={C.o} fontSize="11">
        O
      </text>
      <text x="272" y="158" textAnchor="middle" fill={C.bond} fontSize="11">
        CH₃
      </text>
      <text x="236" y="190" textAnchor="middle" fill={C.sub} fontSize="10.5" letterSpacing="0.06em">
        {lang === 'uz' ? 'piruvat' : 'pyruvate'}
      </text>

      {/* Thr247 pastdan karboksilatga, Asn137 tepadan C2 kislorodiga. */}
      <line x1="192" y1="146" x2="286" y2="196" stroke={C.clamp} strokeWidth="1.3" strokeDasharray="4 3" />
      <text x="330" y="202" textAnchor="middle" fill={C.clamp} fontSize="10">
        Thr247—OH
      </text>
      <line x1="288" y1="72" x2="326" y2="58" stroke={C.clamp} strokeWidth="1.3" strokeDasharray="4 3" />
      <text x="336" y="56" fill={C.clamp} fontSize="10">
        Asn137
      </text>

      {/* Hidrid faqat bitta yuzdan keladi — L-laktat shundan chiqadi. */}
      <path d="M338 120 L288 118" stroke={C.nad} strokeWidth="1.4" strokeDasharray="3 3" fill="none" markerEnd="url(#chem-arrow3)" />
      <defs>
        <marker id="chem-arrow3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill={C.nad} />
        </marker>
      </defs>
      <text x="346" y="123" fill={C.nad} fontSize="10">
        H⁻ (NADH)
      </text>
    </svg>
  )
}

function Loop({ lang }: { lang: 'uz' | 'en' }) {
  const t = T.loop[lang]
  const Panel = ({ dx, closed }: { dx: number; closed: boolean }) => (
    <g transform={`translate(${dx} 0)`}>
      <path d="M12 150 Q12 74 84 74 Q156 74 156 150 Z" fill="#1b2230" stroke={C.faint} strokeWidth="1" />
      {/* Faol markaz cho'ntagi */}
      <path d="M52 150 Q52 104 84 104 Q116 104 116 150 Z" fill="#0c1015" stroke="none" />
      {/* Mobil ilmoq */}
      <path
        d={closed ? 'M46 108 Q84 128 122 108' : 'M46 108 Q84 34 122 108'}
        stroke={C.loop}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="84" cy={closed ? 120 : 62} r="5" fill={C.loop} />
      <text x="84" y={closed ? 110 : 52} textAnchor="middle" fill={C.loop} fontSize="9">
        Arg105
      </text>
      {/* Substrat va NADH */}
      <circle cx={closed ? 84 : 84} cy="138" r="7" fill={C.sub} />
      <rect x="66" y="152" width="36" height="7" rx="3" fill={C.nad} />
      <text x="84" y="176" textAnchor="middle" fill={closed ? C.loop : C.faint} fontSize="10" letterSpacing="0.1em">
        {closed ? t[1] : t[0]}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 420 200" className="chem-svg" role="img">
      <Panel dx={10} closed={false} />
      <Panel dx={246} closed={true} />
      <path d="M190 112 H236" stroke={C.bond} strokeWidth="1.4" fill="none" markerEnd="url(#chem-arrow4)" />
      <defs>
        <marker id="chem-arrow4" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill={C.bond} />
        </marker>
      </defs>
      <text x="213" y="102" textAnchor="middle" fill={C.faint} fontSize="9">
        {t[2]}
      </text>
      <text x="213" y="130" textAnchor="middle" fill={C.loop} fontSize="10">
        {t[3]}
      </text>
    </svg>
  )
}

const ISO = [
  { name: 'LDH1', h: 4 },
  { name: 'LDH2', h: 3 },
  { name: 'LDH3', h: 2 },
  { name: 'LDH4', h: 1 },
  { name: 'LDH5', h: 0 },
]

function Isoenzymes({ lang }: { lang: 'uz' | 'en' }) {
  const tissues = T.iso[lang]
  return (
    <svg viewBox="0 0 420 170" className="chem-svg" role="img">
      {ISO.map((iso, i) => {
        const x = 14 + i * 80
        // To'rtta o'rin: chapdan H (moviy), qolgani M (to'q sariq).
        const cells = [0, 1, 2, 3].map((k) => ({
          cx: x + 18 + (k % 2) * 30,
          cy: 34 + Math.floor(k / 2) * 30,
          h: k < iso.h,
        }))
        return (
          <g key={iso.name}>
            {cells.map((c, k) => (
              <g key={k}>
                <circle cx={c.cx} cy={c.cy} r="12" fill={c.h ? '#2b6cb0' : '#b7791f'} opacity="0.85" />
                <text x={c.cx} y={c.cy + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight={600}>
                  {c.h ? 'H' : 'M'}
                </text>
              </g>
            ))}
            <text x={x + 33} y="104" textAnchor="middle" fill={C.bond} fontSize="11" fontWeight={600}>
              {iso.name}
            </text>
            <text x={x + 33} y="120" textAnchor="middle" fill={C.faint} fontSize="9">
              {`H${iso.h}M${4 - iso.h}`.replace('H0', '').replace('M0', '')}
            </text>
            <text x={x + 33} y="140" textAnchor="middle" fill={C.faint} fontSize="8.5">
              {tissues[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const NOTE: Record<ChemKey, { uz: string; en: string }> = {
  reaction: T.reactionNote,
  'his-asp': T.hisAspNote,
  'arg-clamp': T.clampNote,
  loop: T.loopNote,
  isoenzymes: T.isoNote,
}

function Drawing({ chem, lang }: Props) {
  switch (chem) {
    case 'reaction':
      return <Reaction lang={lang} />
    case 'his-asp':
      return <HisAsp lang={lang} />
    case 'arg-clamp':
      return <ArgClamp lang={lang} />
    case 'loop':
      return <Loop lang={lang} />
    case 'isoenzymes':
      return <Isoenzymes lang={lang} />
  }
}

export function ChemStructure({ chem, lang }: Props) {
  // Inspector ~300px keng — chizma u yerda o'qiladi, lekin taqdimotda yoki
  // telefonda yaqindan ko'rish kerak bo'ladi, shuning uchun kattalashadi.
  const [big, setBig] = useState(false)
  return (
    <>
      <div className="chem-frame">
        <button className="chem-zoom" onClick={() => setBig(true)} aria-label={lang === 'uz' ? 'Kattalashtirish' : 'Enlarge'}>
          ⤢
        </button>
        <Drawing chem={chem} lang={lang} />
        <p className="chem-note">{NOTE[chem][lang]}</p>
      </div>
      {/* Portal SHART: inspector'da backdrop-filter bor, u position:fixed uchun
          containing block yaratadi — portalsiz oyna panel ichida qolib ketadi. */}
      {big &&
        createPortal(
        <div className="chem-lightbox" onClick={() => setBig(false)} role="dialog">
          <div className="chem-lightbox-inner glass" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close" onClick={() => setBig(false)} aria-label="close">
              ×
            </button>
            <Drawing chem={chem} lang={lang} />
            <p className="chem-note">{NOTE[chem][lang]}</p>
          </div>
        </div>,
          document.body,
        )}
    </>
  )
}

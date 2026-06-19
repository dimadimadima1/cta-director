import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Layers, Image as ImageIcon, Upload, X, Check, Copy, ShieldCheck, Lock, Sparkles,
  ArrowLeft, RefreshCw, LayoutTemplate, FileImage, Wand2, Palette, Star, AlertTriangle, Package, Pencil, Info,
} from "lucide-react";

const C = {
  bg: "#090c14", bgGrad: "#0c1120", panel: "#0f1422", panel2: "#131a2b",
  line: "rgba(255,255,255,0.07)", lineSoft: "rgba(255,255,255,0.11)", dash: "rgba(255,255,255,0.16)",
  text: "#eef1f7", mute: "#8b93a7", faint: "#5a6276",
  flame: "#ee5e2c", flameDeep: "#cf4a1e", flameSoft: "rgba(238,94,44,0.10)", flameRing: "rgba(238,94,44,0.32)",
  warn: "rgba(238,94,44,0.13)", warnLine: "rgba(238,94,44,0.45)",
  ok: "#3fae6e", okSoft: "rgba(63,174,110,0.12)",
  safe: "rgba(255,255,255,0.045)", safeLine: "rgba(255,255,255,0.20)",
  zone: "rgba(238,94,44,0.07)", zoneLine: "rgba(238,94,44,0.32)",
};

const CTA_RULES = [
  "1080×1920 vertical, mobile-first.",
  "Instagram / Reels safe areas respected.",
  "CTA button in the lower-middle safe area, not near the bottom edge.",
  "Hierarchy: headline → product → CTA button → trust elements.",
  "Product is the hero, 30–45% of the frame.",
  "Uploaded asset is the mandatory source of truth for packaging, branding & text.",
  "Preserve packaging exactly — never redesign labels or branding.",
  "Inspiration used only for layout direction, never copied or recreated 1:1.",
  "Never invent logos, prices or claims not in the upload.",
  "Premium, clean, conversion-optimized for OpenAI Flow.",
];
const ANGLES = [
  { name: "Hero Spotlight", line: "Clean product-hero spotlight on a soft on-brand background." },
  { name: "Benefit-Led", line: "Open on the single strongest benefit to spark desire fast." },
  { name: "Social Proof", line: "Foreground reviews and trust right by the CTA to cut hesitation." },
];

/* AI Suggest (index 0) adapts to detected brand. Others have FIXED identities. */
const STYLES = [
  { key: "aisuggest", name: "AI Suggest", desc: "Adapts to your brand palette", ai: true, palette: ["#E51929", "#F2EDE8", "#0C1018"], promptDesc: "adapt the visual language to the product's own detected brand palette and aesthetic — match the brand's colors, tone and feel from the uploaded asset.", quality: "Clean premium composition tuned to the brand.", rec: { spacing: "Match the brand's own spacing rhythm.", hierarchy: "Mirror the source page's hierarchy.", typography: "Match the brand's typography style.", cta: "Brand-colored prominent pill." }, theme: { screen: "#0f1422", ink: "#ffffff", sub: "#aab1c2", accent: "#ee5e2c", light: false } },
  { key: "apple", name: "Apple Minimal", desc: "Neutral whites, grays, subtle blacks", palette: ["#FFFFFF", "#EAEAEA", "#1A1A1A"], promptDesc: "clean white/neutral backgrounds, premium spacing, minimal typography, product hero, elegant CTA button.", quality: "Clean Apple-style professional composition.", rec: { spacing: "Generous even margins, lots of negative space.", hierarchy: "One clear headline → product → single CTA.", typography: "Minimal sans, tight bold headline, light body.", cta: "Solid black/neutral pill, medium, centered." }, theme: { screen: "#FFFFFF", ink: "#1A1A1A", sub: "#6b7280", accent: "#1A1A1A", light: true } },
  { key: "luxury", name: "Luxury Premium", desc: "Charcoal, gold, champagne", palette: ["#D4AF37", "#2B241C", "#F5E7C1"], promptDesc: "high-end ecommerce look, charcoal and gold tones, refined shadows, sophisticated gradients, polished product photography.", quality: "Polished high-end editorial composition.", rec: { spacing: "Wide luxurious margins, deliberate emptiness.", hierarchy: "Elegant headline, product on a soft gradient stage.", typography: "Refined serif/sans mix, airy letter-spacing.", cta: "Slim refined gold pill, understated." }, theme: { screen: "#2B241C", ink: "#F5E7C1", sub: "#b9a98c", accent: "#D4AF37", light: false } },
  { key: "organic", name: "Organic Wellness", desc: "Soft beige and muted greens", palette: ["#6B8E5A", "#E9E1D2", "#3F5640"], promptDesc: "natural textures, soft beige and muted green tones, botanical elements, calm premium health aesthetic.", quality: "Calm natural premium wellness composition.", rec: { spacing: "Breathable, soft, organic asymmetry allowed.", hierarchy: "Benefit-led headline → product → trust icons.", typography: "Warm humanist sans, gentle weight contrast.", cta: "Rounded natural-green pill, calm and inviting." }, theme: { screen: "#E9E1D2", ink: "#3F5640", sub: "#6b7359", accent: "#6B8E5A", light: true } },
  { key: "ugc", name: "UGC Native", desc: "Clean whites with subtle blues", palette: ["#4A7DFF", "#FFFFFF", "#DCE8FF"], promptDesc: "clean white backgrounds with subtle blue accents, realistic phone-like composition, less polished but clean and conversion-focused.", quality: "Authentic social-native composition that still reads clean.", rec: { spacing: "Tighter, casual, screenshot-like framing.", hierarchy: "Hook headline → hand-held product → CTA chip.", typography: "Friendly sans, chat/UI-style accents.", cta: "App-style rounded blue button, high tap-affordance." }, theme: { screen: "#FFFFFF", ink: "#1c2530", sub: "#5a6680", accent: "#4A7DFF", light: true } },
  { key: "bold", name: "Bold Direct Response", desc: "High-contrast black, white & red", palette: ["#111111", "#FFFFFF", "#FF4D2D"], promptDesc: "high-contrast black and white with a punchy accent, stronger headline, bigger CTA button, more sales-driven layout.", quality: "High-contrast punchy direct-response composition.", rec: { spacing: "Compact, punchy, content fills the frame.", hierarchy: "Huge headline → product → oversized CTA.", typography: "Heavy condensed sans, maximum contrast.", cta: "Oversized high-contrast pill, impossible to miss." }, theme: { screen: "#FFFFFF", ink: "#111111", sub: "#555c6b", accent: "#FF4D2D", light: true } },
];

const INSPO = [
  { key: "auto", name: "AI Suggest", blurb: "AI picks the best hierarchy for your product", recommended: false, composition: "" },
  { key: "veda", name: "Veda Style", recommended: true, heroX: 50, blurb: "Premium wellness hero · centered product · trust icons", composition: "Centered composition. Large headline at the top, optional subheadline beneath it. Large hero product centered in the middle. A single centered CTA button directly below the product. Trust icons aligned in a horizontal row at the bottom. Generous whitespace, premium wellness aesthetic, Apple-inspired simplicity." },
  { key: "bloom", name: "Bloom Style", heroX: 50, blurb: "Floating product · benefit callouts · soft gradients", composition: "Lifestyle-inspired composition with the product floating naturally near the center. Benefit callouts arranged around the product with thin connector arrows. Soft gradients, airy spacing, organic visual flow, friendly premium feeling. CTA placed below the product." },
  { key: "mrg", name: "MRG Style", heroX: 30, blurb: "Offset product · floating UI cards · direct-response", composition: "Direct-response hierarchy. Hero product offset to one side. Floating information/UI cards around the product (routine or feature modules). A large conversion headline and a bold CTA pill. App-inspired modules, dynamic ecommerce feel." },
];
const LOAD_MSGS = ["Reading screenshot…", "Detecting product…", "Extracting headlines…", "Finding pricing…", "Detecting brand colors…", "Analyzing visual hierarchy…", "Identifying trust elements…", "Building CTA structure…", "Optimizing for Flow…", "Finalizing prompt…"];

const WARN = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ REQUIRED FOR BEST RESULTS

Attach the uploaded Website Screenshot and/or Product Image as an image reference inside Flow.
This prompt assumes those references are attached.
Without them, packaging, branding, typography, colors or product details may change.
Always include the original Website Screenshot or Product Image as a visual reference.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

/* ---------------- helpers ---------------- */
const clone = (o) => JSON.parse(JSON.stringify(o));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripFences = (t) => (t || "").replace(/```json|```/g, "").trim();
function parseJSON(txt) { const s = stripFences(txt); const a = s.indexOf("{"), b = s.lastIndexOf("}"); if (a < 0 || b < 0) throw new Error("no json"); return JSON.parse(s.slice(a, b + 1)); }
function hexToRgb(h) { h = (h || "").replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h || "000000", 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; }
const rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
function mix(a, b, t) { const x = hexToRgb(a), y = hexToRgb(b); return rgbToHex(x.r + (y.r - x.r) * t, x.g + (y.g - x.g) * t, x.b + (y.b - x.b) * t); }
function luminance(h) { const { r, g, b } = hexToRgb(h); const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
const idealText = (bg) => (luminance(bg) > 0.5 ? "#0c1018" : "#ffffff");
function styleTheme(styleKey, brand) {
  const st = STYLES.find((s) => s.key === styleKey) || STYLES[0];
  if (styleKey !== "aisuggest") return { ...st.theme, btnText: idealText(st.theme.accent) };
  const b = (brand || []).filter(Boolean);
  const accent = b[0] || "#ee5e2c";
  const base = b[1] || b[0] || "#1a2030";
  const dark = luminance(base) < 0.45;
  const screen = dark ? mix(base, "#000000", 0.5) : mix(base, "#ffffff", 0.8);
  const light = luminance(screen) > 0.5;
  return { screen, ink: light ? "#15181f" : "#ffffff", sub: light ? "#5a6276" : "#aab1c2", accent, btnText: idealText(accent), light };
}
function sampleColors(img) {
  try {
    const c = document.createElement("canvas"); const s = 48; c.width = s; c.height = s;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0, s, s); const d = x.getImageData(0, 0, s, s).data;
    let best = -1, acc = "#ee5e2c", ar = 0, ag = 0, ab = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (d[i + 3] < 128) continue; ar += r; ag += g; ab += b; n++; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sc = (mx ? (mx - mn) / mx : 0) * (mx / 255); if (sc > best && mx > 70) { best = sc; acc = rgbToHex(r, g, b); } }
    return n ? [acc, rgbToHex(ar / n, ag / n, ab / n), "#0c1018"] : [];
  } catch (e) { return []; }
}
const readImage = (file) => new Promise((res) => { const r = new FileReader(); r.onload = () => res({ name: file.name, dataUrl: r.result, base64: r.result.split(",")[1], mediaType: file.type }); r.readAsDataURL(file); });
async function callClaude({ image, text, maxTokens = 1200 }) {
  const content = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: image.mediaType || "image/png", data: image.base64 } });
  content.push({ type: "text", text });
  const resp = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, messages: [{ role: "user", content }] }) });
  const j = await resp.json();
  return (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}

/* ---------------- layout resolution (AI Suggest -> concrete structure) ---------------- */
function resolveLayout(d) {
  if (d.inspo !== "auto") return d.inspo;
  const f = d.flags;
  const bc = (f.benefits && d.benefits?.length) || 0;
  const trust = [f.reviews && d.reviews, f.guarantee && d.guarantee, f.benefits && d.benefits?.length].filter(Boolean).length;
  if (bc >= 3 && trust >= 2) return "mrg";   // dense, information-rich product -> app-card layout
  if (bc >= 2) return "bloom";                // benefit-rich -> callout layout
  return "veda";                              // otherwise -> calm centered premium
}

/* Explicit compositional instructions per structure — NO style names ever leak into the prompt. */
function compositionSpec(lay, a, ctaZone) {
  const f = a.flags;
  const sub = f.subheadline && a.subheadline ? ", with a smaller centered subheadline directly beneath it" : "";
  if (lay === "veda") return `- Build a perfectly symmetrical, centered composition with generous negative space (calm, minimal, premium-wellness feel).
- Place a clean minimal headline centered at the top${sub}.
- Make the hero product very large and centered, occupying ~42% of the vertical frame and clearly dominating the visual focus.
- Place ONE centered pill CTA directly beneath the product, within the ${ctaZone}.
- Align the trust elements as small icons in a single horizontal row along the bottom edge (above the bottom safe area).
- Hierarchy: headline -> large product -> CTA -> trust row. Low information density, lots of whitespace, minimal typography, perfectly balanced symmetry.`;
  if (lay === "bloom") return `- Build a lifestyle-first, slightly ASYMMETRICAL composition with airy spacing and natural movement.
- Let the product float naturally, positioned slightly off-center (around left-of-center) at a medium size (~28-32% of the frame).
- Arrange 3-4 short benefit callouts AROUND the product, each linked to it with a thin curved connector or arrow.
- Place a friendly premium headline at the top.
- Place the CTA AFTER the benefit callouts (lower in the frame, not immediately under the product), within the ${ctaZone}.
- Hierarchy: headline -> floating product with surrounding benefits -> CTA -> light trust. Soft gradients, medium negative space, emotional storytelling, medium information density.`;
  return `- Build a dynamic, app-inspired DIRECT-RESPONSE composition with denser information.
- Place the hero product shifted to the LEFT third of the frame.
- Stack 2-3 floating app-style information/UI cards vertically on the RIGHT side beside the product (feature or routine modules with small toggles).
- Place a bold, high-contrast conversion headline at the top${sub}.
- Place a prominent BOLD pill-shaped CTA in the ${ctaZone}.
- Hierarchy: bold headline -> offset product + right-side UI cards -> bold CTA. Lower negative space, higher information density, modern SaaS/app ecommerce energy and dynamic visual flow.`;
}

/* ---------------- prompt builder ---------------- */
function buildPrompt(a, source, angleIdx, inspoKey, styleKey) {
  const ref = source === "website" ? "Website Screenshot" : "Product Image";
  const f = a.flags;
  const style = STYLES.find((s) => s.key === styleKey) || STYLES[0];
  const colors = (a.brandColors || []).slice(0, 4).join(", ");
  const ctaZone = { High: "upper-middle area, comfortably inside the Reels safe zone", Balanced: "lower-middle safe zone", Low: "lower area, safely above the bottom safe zone" }[a.ctaPos];
  const L = (label, val, on = true) => (on && val ? `${label}: "${val}"` : null);
  const content = [
    L("Headline", a.headline, f.headline), L("Subheadline", a.subheadline, f.subheadline),
    `Product name: "${a.product || "the uploaded product"}"`, L("Price", a.price, f.price),
    `CTA button text: "${a.ctaText || "Shop Now"}"`, L("Reviews", a.reviews, f.reviews),
    L("Guarantee", a.guarantee, f.guarantee), (f.benefits && a.benefits?.length) ? `Benefits: "${a.benefits.join("; ")}"` : null,
  ].filter(Boolean).join("\n");
  const bottom = [f.reviews && a.reviews ? "reviews" : null, f.guarantee && a.guarantee ? "guarantee" : null, f.benefits && a.benefits?.length ? "benefits" : null].filter(Boolean).join(", ");
  const lay = resolveLayout(a);
  const comp = compositionSpec(lay, a, ctaZone);
  const compBlock = inspoKey === "auto"
    ? `Adaptive composition selected by analyzing this product's category, content and brand, then tuned for maximum conversion (hybridize where it helps; use the detected brand colors and tone):\n${comp}`
    : comp;

  return `${WARN}

REFERENCE PRIORITY:
Use the uploaded ${ref} as the PRIMARY visual reference and source of truth for packaging, branding, typography, colors, proportions and all visible text.
Use the uploaded logo as the exact logo reference, if provided.
Create an entirely original CTA — do not copy or recreate any reference layout 1:1.

CONTENT (use only these exact values; never invent prices, claims or logos):
${content}

VISUAL STYLE:
Apply a ${style.name} visual language: ${style.promptDesc}
Brand colors: ${colors || "use the product's own palette"}.
Typography: ${style.rec.typography}

COMPOSITION & LAYOUT — follow these exact instructions:
${compBlock}

GLOBAL FRAME RULES:
1080x1920 vertical, mobile-first. Keep every important element inside Instagram/Reels safe areas. The product is the hero and must be instantly recognizable. The CTA button must be clearly visible in the ${ctaZone}, never too close to the bottom edge.${bottom ? ` Trust elements present: ${bottom}.` : ""}

PRODUCT ACCURACY:
Preserve product packaging exactly. Do not redesign the label. Do not change product proportions. Do not alter branding, colors, typography or logo. Never invent branding and never hallucinate text. The product must look identical to the uploaded reference.

QUALITY:
${style.quality}
Premium Apple-quality cleanliness, photorealistic rendering, professional ecommerce composition. No fake claims, no invented prices, no altered packaging. Optimized specifically for OpenAI Flow.

REMINDER: Attach the original ${ref} as an image reference in Flow — this prompt assumes it is attached.`;
}

/* ============================================================ atoms */
function Logo() {
  return (<div className="flex items-center" style={{ gap: 10 }}>
    <svg width="26" height="26" viewBox="0 0 28 28"><path d="M14 3 L25 25 L17.8 25 L14 16.5 L10.2 25 L3 25 Z" fill={C.flame} /></svg>
    <span style={{ color: C.text, fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>CTA Director</span>
    <span style={{ color: C.faint, fontSize: 11, fontWeight: 600, border: `1px solid ${C.line}`, padding: "2px 7px", borderRadius: 999, marginLeft: 4 }}>AI</span>
  </div>);
}
function StepNav({ step }) {
  return (<nav className="flex items-center" style={{ gap: 26 }}>{["Upload", "Direct"].map((s, i) => {
    const active = step === i + 1, done = step > i + 1;
    return (<div key={s} className="flex items-center" style={{ gap: 9 }}>
      <span className="inline-flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: 999, fontSize: 12, fontWeight: 600, color: active || done ? "#fff" : C.faint, background: active || done ? C.flame : "transparent", border: `1px solid ${active || done ? C.flame : C.lineSoft}` }}>{done ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
      <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? C.text : C.mute }}>{s}</span>
    </div>);
  })}</nav>);
}
function Primary({ children, onClick, disabled, full, hero }) {
  const [hover, setHover] = useState(false);
  const lift = hero && hover && !disabled;
  return (<button onClick={onClick} disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="inline-flex items-center justify-center" style={{ gap: 8, padding: "13px 24px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600, color: "#fff", width: full ? "100%" : "auto", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, background: `linear-gradient(180deg, ${C.flame}, ${C.flameDeep})`, transform: lift ? "translateY(-3px)" : "none", boxShadow: disabled ? "none" : (hero ? (lift ? "0 22px 52px -12px rgba(238,94,44,0.95), 0 0 34px -6px rgba(238,94,44,0.7)" : "0 12px 32px -12px rgba(238,94,44,0.6)") : "0 10px 30px -12px rgba(238,94,44,0.65)"), transition: hero ? "transform .2s cubic-bezier(.2,.7,.2,1), box-shadow .2s ease" : "none" }}>{children}</button>);
}
function HeroSourceCard({ o, on, onClick }) {
  const [hover, setHover] = useState(false);
  return (<button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ textAlign: "left", padding: 20, borderRadius: 16, cursor: "pointer", background: on ? C.flameSoft : C.panel, border: `1px solid ${on ? C.flame : (hover ? C.flameRing : C.line)}`, transform: hover && !on ? "translateY(-2px)" : "none", boxShadow: on ? "0 12px 34px -16px rgba(238,94,44,0.6)" : (hover ? "0 14px 30px -18px rgba(238,94,44,0.55), 0 0 0 1px rgba(238,94,44,0.18)" : "none"), transition: "transform .2s cubic-bezier(.2,.7,.2,1), box-shadow .2s ease, border-color .2s ease" }}>
    <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: 12 }}><span style={{ color: on ? C.flame : C.mute }}>{o.icon}</span>{on && <Check size={16} color={C.flame} strokeWidth={3} />}</div>
    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{o.t}</div>
    <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.5 }}>{o.d}</div>
  </button>);
}
function Ghost({ children, onClick }) {
  return (<button onClick={onClick} className="inline-flex items-center justify-center" style={{ gap: 7, padding: "9px 15px", borderRadius: 11, fontSize: 13, fontWeight: 600, color: C.mute, cursor: "pointer", background: C.panel2, border: `1px solid ${C.line}` }}>{children}</button>);
}
function Segmented({ options, value, onChange, full }) {
  return (<div className="inline-flex" style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: 3, width: full ? "100%" : "auto" }}>
    {options.map((o) => { const on = o === value; return (<button key={o} onClick={() => onChange(o)} style={{ flex: full ? 1 : "none", padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: on ? "#fff" : C.mute, background: on ? C.flame : "transparent", transition: "all .15s" }}>{o}</button>); })}
  </div>);
}
function Switch({ on, onClick }) {
  return (<button onClick={onClick} style={{ width: 38, height: 22, borderRadius: 999, border: "none", cursor: "pointer", position: "relative", flexShrink: 0, background: on ? C.flame : "rgba(255,255,255,0.12)", transition: "background .2s" }}>
    <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: "#fff", transition: "left .2s" }} />
  </button>);
}
function CopyBtn({ text, label = "Copy", primary }) {
  const [done, setDone] = useState(false);
  return (<button onClick={async () => { try { await navigator.clipboard.writeText(text); } catch (e) {} setDone(true); setTimeout(() => setDone(false), 1400); }} className="inline-flex items-center" style={{ gap: 7, padding: "9px 15px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: primary ? "#fff" : (done ? C.flame : C.mute), border: primary ? "none" : `1px solid ${done ? C.flameRing : C.line}`, background: primary ? `linear-gradient(180deg, ${C.flame}, ${C.flameDeep})` : C.panel2 }}>{done ? <Check size={14} /> : <Copy size={14} />} {done ? "Copied" : label}</button>);
}
const inputStyle = (focus) => ({ width: "100%", boxSizing: "border-box", padding: "10px 13px", borderRadius: 10, resize: "vertical", fontFamily: "inherit", background: C.panel2, border: `1px solid ${focus ? C.flameRing : C.line}`, color: C.text, fontSize: 13.5, outline: "none", boxShadow: focus ? `0 0 0 3px ${C.flameSoft}` : "none", transition: "border-color .15s, box-shadow .15s" });

/* ---------------- screenshot onboarding hint (animated, abstract) ---------------- */
function ScreenshotHint() {
  return (
    <div style={{ borderRadius: 14, background: C.panel, border: `1px solid ${C.line}`, padding: 12, marginBottom: 14 }}>
      <div style={{ position: "relative", height: 132, borderRadius: 10, overflow: "hidden", background: C.panel2, border: `1px solid ${C.line}` }}>
        {/* browser chrome */}
        <div className="flex items-center" style={{ gap: 5, height: 18, padding: "0 8px", background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.18)" }} /><span style={{ width: 5, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.18)" }} /><span style={{ width: 5, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.18)" }} />
          <span style={{ marginLeft: 8, height: 6, flex: 1, maxWidth: 120, borderRadius: 999, background: "rgba(255,255,255,0.07)" }} />
        </div>
        {/* body : product placeholder left, info right */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 18, bottom: 0 }}>
          <div className="flex items-center justify-center" style={{ position: "absolute", left: "5%", top: "14%", width: "38%", height: "72%", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}` }}><Package size={22} color="rgba(255,255,255,0.22)" /></div>
          <div style={{ position: "absolute", left: "50%", right: "5%", top: "18%", display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ height: 7, width: "55%", borderRadius: 999, background: "rgba(255,255,255,0.10)" }} />
            <span style={{ height: 10, width: "80%", borderRadius: 999, background: "rgba(255,255,255,0.13)" }} />
            <span style={{ height: 6, width: "65%", borderRadius: 999, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ height: 6, width: "45%", borderRadius: 999, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ height: 14, width: "55%", borderRadius: 6, background: "rgba(238,94,44,0.30)", marginTop: 4 }} />
          </div>
          {/* selection + flash + cursor */}
          <div className="ssSel" style={{ position: "absolute", borderRadius: 6, border: `1.5px dashed ${C.flame}`, background: "rgba(238,94,44,0.10)", boxShadow: "0 0 0 9999px rgba(9,12,20,0.0)" }} />
          <div className="ssFlash" style={{ position: "absolute", left: "5%", top: "10%", width: "90%", height: "80%", borderRadius: 8, background: "rgba(255,255,255,0.6)" }} />
          <svg className="ssCursor" width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute" }}><path d="M2 1 L2 13 L5.5 9.7 L7.7 14.5 L9.7 13.6 L7.5 8.9 L12 8.7 Z" fill="#fff" stroke="#0a0a0a" strokeWidth="0.8" /></svg>
        </div>
      </div>
      <div className="flex items-center justify-center" style={{ gap: 6, color: C.mute, fontSize: 12, textAlign: "center", marginTop: 10, lineHeight: 1.4 }}><Info size={13} style={{ flexShrink: 0, opacity: 0.6, transition: "opacity .15s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)} onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)} /><span>Take a screenshot of your product page or website and upload it here.</span></div>
    </div>
  );
}

/* ---------------- dropzone ---------------- */
function Dropzone({ label, asset, onFile, onClear }) {
  const ref = useRef(null); const [drag, setDrag] = useState(false);
  if (asset) return (
    <div className="fade flex items-center" style={{ gap: 14, padding: 16, borderRadius: 16, background: C.panel, border: `1px solid ${C.line}` }}>
      <span className="inline-flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 12, background: C.flameSoft, border: `1px solid ${C.flameRing}`, flexShrink: 0 }}><FileImage size={20} color={C.flame} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="flex items-center" style={{ gap: 7 }}><span className="inline-flex items-center justify-center" style={{ width: 17, height: 17, borderRadius: 999, background: C.ok }}><Check size={11} color="#fff" strokeWidth={3} /></span><span style={{ fontSize: 13, fontWeight: 600, color: C.ok }}>Uploaded</span></div>
        <div style={{ color: C.mute, fontSize: 12.5, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.name}</div>
      </div>
      <button onClick={onClear} className="inline-flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 9, background: C.panel2, border: `1px solid ${C.line}`, color: C.mute, cursor: "pointer", flexShrink: 0 }}><X size={14} /></button>
    </div>
  );
  return (
    <div ref={ref} onClick={() => ref.current.querySelector("input").click()} onDragEnter={(e) => { e.preventDefault(); setDrag(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { if (e.currentTarget === e.target) setDrag(false); }} onDrop={(e) => { e.preventDefault(); setDrag(false); const fl = e.dataTransfer.files?.[0]; if (fl && fl.type.startsWith("image/")) onFile(fl); }}
      className="flex flex-col items-center justify-center text-center" style={{ minHeight: 180, padding: 22, borderRadius: 18, cursor: "pointer", background: drag ? C.flameSoft : C.panel, border: `2px dashed ${drag ? C.flame : C.dash}`, transform: drag ? "scale(1.01)" : "none", transition: "all .15s" }}>
      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <span className="inline-flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 999, background: C.flameSoft, border: `1px solid ${C.flameRing}`, marginBottom: 14 }}><Upload size={20} color={C.flame} /></span>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{drag ? "Drop to upload" : `Drag & drop your ${label.toLowerCase()}`}</div>
      <div style={{ color: C.mute, fontSize: 12.5, marginTop: 4 }}>or click to browse</div>
    </div>
  );
}

/* ---------------- style card ---------------- */
function StyleCard({ s, on, brand, onClick }) {
  const [hover, setHover] = useState(false);
  const theme = styleTheme(s.key, brand);
  const chips = s.ai ? (brand || []).filter(Boolean).slice(0, 5) : (s.palette || []);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ textAlign: "left", padding: 12, borderRadius: 12, cursor: "pointer", position: "relative", background: on ? C.flameSoft : C.panel2, border: `1px solid ${on ? C.flame : C.line}`, transform: hover ? "scale(1.02)" : "none", boxShadow: on ? `inset 0 0 0 1px ${C.flameRing}, 0 14px 30px -16px rgba(238,94,44,0.55)` : (hover ? "0 14px 28px -16px rgba(238,94,44,0.5)" : "none"), transition: "all .2s" }}>
      <div style={{ height: 30, borderRadius: 8, marginBottom: 9, background: mix(theme.screen, theme.accent, theme.light ? 0.06 : 0.14), border: `1px solid ${C.lineSoft}`, position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", left: 7, top: 7, fontSize: 10, fontWeight: 800, color: theme.ink }}>Aa</span>
        <span style={{ position: "absolute", right: 7, bottom: 6, width: 22, height: 9, borderRadius: 999, background: theme.accent }} />
        {s.ai && <Sparkles size={11} color={theme.accent} style={{ position: "absolute", right: 7, top: 6 }} />}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>{(chips.length ? chips : [theme.accent]).map((c, i) => <span key={i} style={{ width: 12, height: 12, borderRadius: 4, background: c, border: `1px solid ${C.lineSoft}` }} />)}</div>
      <div className="flex items-center" style={{ gap: 5 }}>{s.ai && <Sparkles size={11} color={C.flame} />}<span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{s.name}</span></div>
      <div style={{ fontSize: 10.5, color: C.mute, marginTop: 4, lineHeight: 1.35 }}>{s.desc}</div>
      {on && <span className="inline-flex items-center justify-center pop" style={{ position: "absolute", top: 9, right: 9, width: 17, height: 17, borderRadius: 999, background: C.flame }}><Check size={11} color="#fff" strokeWidth={3} /></span>}
    </button>
  );
}

/* ---------------- inspiration thumbnails ---------------- */
function ThumbBloom() { return (<svg viewBox="0 0 90 120" style={{ width: "100%", height: "100%", display: "block" }}><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bcd8f0" /><stop offset="1" stopColor="#7fb1e1" /></linearGradient></defs><rect width="90" height="120" fill="url(#sky)" /><rect x="36" y="9" width="18" height="4" rx="2" fill="#fff" /><rect x="24" y="20" width="42" height="6" rx="3" fill="#2f7d3e" /><rect x="30" y="29" width="30" height="5" rx="2.5" fill="#2f7d3e" /><rect x="34" y="58" width="22" height="30" rx="5" fill="#fff" /><rect x="34" y="56" width="22" height="8" rx="4" fill="#9fd36a" /><path d="M22 64 q-6 4 -2 9" stroke="#2f7d3e" strokeWidth="2" fill="none" /><path d="M68 64 q6 4 2 9" stroke="#2f7d3e" strokeWidth="2" fill="none" /><rect x="32" y="100" width="26" height="4" rx="2" fill="#2f7d3e" /></svg>); }
function ThumbMRG() { return (<svg viewBox="0 0 90 120" style={{ width: "100%", height: "100%", display: "block" }}><rect width="90" height="120" fill="#7ba0dd" /><rect x="26" y="10" width="38" height="7" rx="2" fill="none" stroke="#fff" strokeWidth="2" /><rect x="46" y="24" width="34" height="11" rx="5.5" fill="#fff" /><rect x="14" y="44" width="22" height="44" rx="5" fill="#e8527e" /><g><rect x="42" y="46" width="36" height="9" rx="3" fill="#fff" /><circle cx="73" cy="50.5" r="2.4" fill="#36c46a" /><rect x="42" y="58" width="36" height="9" rx="3" fill="#fff" /><circle cx="73" cy="62.5" r="2.4" fill="#36c46a" /><rect x="42" y="70" width="36" height="9" rx="3" fill="#fff" /><circle cx="73" cy="74.5" r="2.4" fill="#36c46a" /></g><rect x="14" y="98" width="50" height="8" rx="3" fill="#fff" /><rect x="14" y="108" width="34" height="8" rx="3" fill="#fff" /></svg>); }
function ThumbVeda() { return (<svg viewBox="0 0 90 120" style={{ width: "100%", height: "100%", display: "block" }}><rect width="90" height="120" fill="#ece1d2" /><rect x="38" y="9" width="14" height="4" rx="2" fill="#7a2230" /><rect x="22" y="20" width="46" height="6" rx="2" fill="#2b2b2b" /><rect x="30" y="29" width="30" height="4" rx="2" fill="#9aa17e" /><rect x="38" y="42" width="14" height="42" rx="4" fill="#7a2230" /><rect x="38" y="70" width="14" height="8" fill="#f2ece0" /><rect x="28" y="90" width="34" height="9" rx="4" fill="#7a2230" /><g fill="none" stroke="#7a2230" strokeWidth="1.5"><circle cx="24" cy="110" r="4" /><circle cx="38" cy="110" r="4" /><circle cx="52" cy="110" r="4" /><circle cx="66" cy="110" r="4" /></g></svg>); }
const THUMBS = { bloom: ThumbBloom, mrg: ThumbMRG, veda: ThumbVeda };

function InspoCard({ item, selected, onClick }) {
  const [hover, setHover] = useState(false);
  const Thumb = THUMBS[item.key];
  const recBadge = item.recommended ? <span className="inline-flex items-center" style={{ position: "absolute", top: 7, left: 7, gap: 3, padding: "2px 7px", borderRadius: 999, background: C.flame, color: "#fff", fontSize: 9, fontWeight: 700, zIndex: 2, boxShadow: "0 4px 10px -4px rgba(238,94,44,0.8)" }}><Star size={9} fill="#fff" /> Recommended</span> : null;
  const check = selected ? <span className="inline-flex items-center justify-center pop" style={{ position: "absolute", top: 7, right: 7, width: 19, height: 19, borderRadius: 999, background: C.flame, zIndex: 2 }}><Check size={12} color="#fff" strokeWidth={3} /></span> : null;
  const shell = { position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "9/12", cursor: "pointer", padding: 0, border: `1px solid ${selected ? C.flame : (hover ? C.flameRing : C.line)}`, transform: hover ? "translateY(-4px) scale(1.02)" : "none", boxShadow: selected ? `inset 0 0 0 1px ${C.flameRing}, 0 16px 32px -14px rgba(238,94,44,0.6)` : (hover ? "0 16px 32px -14px rgba(238,94,44,0.6)" : "none"), transition: "all .2s" };
  if (item.key === "auto") return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ ...shell, background: selected ? C.flameSoft : C.panel2 }}>
      <div className="flex flex-col items-center justify-center" style={{ height: "100%", color: selected ? C.flame : C.mute, gap: 6, padding: "0 6px" }}><Wand2 size={22} /><span style={{ fontSize: 11.5, fontWeight: 700, textAlign: "center" }}>{item.name}</span><span style={{ fontSize: 8.5, color: C.faint, textAlign: "center", lineHeight: 1.3 }}>{item.blurb}</span></div>
      {check}
    </button>
  );
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ ...shell, background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, opacity: hover ? 1 : 0.74, transition: "opacity .2s" }}><Thumb /></div>
      <div style={{ position: "absolute", inset: 0, background: hover ? "linear-gradient(to top, rgba(9,12,20,0.92) 0%, rgba(9,12,20,0.1) 55%)" : "rgba(9,12,20,0.18)", transition: "background .2s" }} />
      {/* hero label */}
      <span className="inline-flex items-center" style={{ position: "absolute", left: `${item.heroX}%`, top: "44%", transform: "translate(-50%,-50%)", gap: 3, padding: "2px 7px", borderRadius: 999, background: "rgba(9,12,20,0.7)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 8, fontWeight: 800, letterSpacing: "0.06em", opacity: hover ? 0 : 1, transition: "opacity .2s", zIndex: 1 }}><Package size={9} /> PRODUCT</span>
      {recBadge}
      <div style={{ position: "absolute", left: 8, right: 8, bottom: 8, textAlign: "left", opacity: hover ? 1 : 0, transform: hover ? "translateY(0)" : "translateY(6px)", transition: "all .2s" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{item.name}</div>
        <div style={{ fontSize: 9, color: "#cbd2e0", lineHeight: 1.3, marginTop: 2 }}>{item.blurb}</div>
      </div>
      {!item.recommended && <div style={{ position: "absolute", top: 7, left: 8, fontSize: 10, fontWeight: 700, color: "#fff", opacity: hover ? 0 : 0.95, transition: "opacity .2s", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{item.name}</div>}
      {check}
    </button>
  );
}

/* ---------------- rich layout builder ---------------- */
function Wireframe({ d, theme }) {
  const f = d.flags;
  const lay = resolveLayout(d);
  const ctaTop = { High: 50, Balanced: 60, Low: 70 }[d.ctaPos];
  const btnH = 7;
  const ink = theme.ink, sub = theme.sub, acc = theme.accent, btnText = theme.btnText;
  const bColor = theme.light ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.16)";
  const blockBg = theme.light ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)";
  const prodFill = theme.light ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.02)";
  const headTxt = d.headline || "Headline";
  const cta = d.ctaText || "Shop Now";

  const Frame = ({ children }) => (
    <div style={{ position: "relative", width: "100%", maxWidth: 296, margin: "0 auto", aspectRatio: "9 / 16", borderRadius: 20, overflow: "hidden", background: theme.screen, border: `1px solid ${C.lineSoft}`, transition: "background .3s" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "11%", background: C.safe, borderBottom: `1px dashed ${C.safeLine}` }}><span style={{ position: "absolute", left: 8, top: 6, fontSize: 8, color: C.faint, fontWeight: 700, letterSpacing: "0.04em" }}>TOP SAFE ZONE</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "11%", background: C.safe, borderTop: `1px dashed ${C.safeLine}` }}><span style={{ position: "absolute", left: 8, bottom: 6, fontSize: 8, color: C.faint, fontWeight: 700, letterSpacing: "0.04em" }}>BOTTOM SAFE ZONE</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: `${ctaTop - 1.5}%`, height: `${btnH + 3}%`, background: C.zone, borderTop: `1px dashed ${C.zoneLine}`, borderBottom: `1px dashed ${C.zoneLine}`, transition: "top .3s" }}><span style={{ position: "absolute", right: 8, top: 4, fontSize: 8, color: C.flame, fontWeight: 700 }}>CTA SAFE AREA</span></div>
      {d.inspo === "auto" && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 7, fontWeight: 800, letterSpacing: "0.08em", color: C.flame, background: C.flameSoft, border: `1px solid ${C.flameRing}`, padding: "1px 6px", borderRadius: 999, zIndex: 4 }}>ADAPTIVE</span>}
      {children}
    </div>
  );
  const CTAButton = ({ l = 14, r = 14 }) => (
    <div style={{ position: "absolute", left: `${l}%`, right: `${r}%`, top: `${ctaTop}%`, height: `${btnH}%`, borderRadius: 999, background: acc, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px -6px rgba(0,0,0,0.4)", transition: "top .3s, background .3s, left .3s, right .3s" }}><span style={{ fontSize: 11, fontWeight: 700, color: btnText }}>{cta}</span></div>
  );
  const Headline = ({ top, h, align = "center", big }) => (f.headline ? <div style={{ position: "absolute", left: "8%", right: "8%", top: `${top}%`, height: `${h}%`, display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : "center", overflow: "hidden", transition: "top .3s" }}><span style={{ fontSize: big ? 13 : 11, fontWeight: 800, color: ink, textAlign: align, lineHeight: 1.12 }}>{headTxt}</span></div> : null);
  const Product = ({ l, r, top, h }) => (<div style={{ position: "absolute", left: `${l}%`, right: `${r}%`, top: `${top}%`, height: `${h}%`, borderRadius: 10, border: `1.5px solid ${bColor}`, background: prodFill, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, overflow: "hidden", transition: "all .3s" }}><span style={{ position: "absolute", top: 3, left: 5, fontSize: 6.5, fontWeight: 800, letterSpacing: "0.08em", color: sub, opacity: 0.8 }}>HERO PRODUCT</span><Package size={Math.max(16, Math.min(26, h))} color={sub} /><span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: sub }}>PRODUCT</span></div>);
  const Price = ({ left = "0", center = true }) => (f.price && d.price ? <div style={{ position: "absolute", left: center ? 0 : `${left}%`, right: center ? 0 : "auto", top: `${ctaTop - 5.5}%`, textAlign: center ? "center" : "left", transition: "top .3s" }}><span style={{ fontSize: 11, fontWeight: 700, color: ink }}>{d.price}</span></div> : null);

  /* ---- VEDA: centered, symmetrical, very large product, trust icon row ---- */
  if (lay === "veda") {
    const pTop = f.subheadline ? 28 : 26;
    const icons = [f.reviews && d.reviews ? Star : null, f.guarantee && d.guarantee ? ShieldCheck : null, f.benefits && d.benefits?.length ? Check : null, Package].filter(Boolean).slice(0, 4);
    return (<Frame>
      <Headline top={f.subheadline ? 13 : 15} h={f.subheadline ? 7 : 9} />
      {f.subheadline && <div style={{ position: "absolute", left: "12%", right: "12%", top: "21%", textAlign: "center" }}><span style={{ fontSize: 9, color: sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{d.subheadline}</span></div>}
      <Product l={21} r={21} top={pTop} h={ctaTop - pTop - 6} />
      <Price />
      <CTAButton l={24} r={24} />
      <div style={{ position: "absolute", left: "8%", right: "8%", top: "84%", display: "flex", justifyContent: "center", gap: 16 }}>
        {icons.map((Ic, i) => (<span key={i} className="inline-flex items-center justify-center" style={{ width: 17, height: 17, borderRadius: 999, border: `1px solid ${bColor}`, color: sub }}><Ic size={9} /></span>))}
      </div>
    </Frame>);
  }

  /* ---- BLOOM: floating off-center product, benefit callouts around, CTA after benefits ---- */
  if (lay === "bloom") {
    const benefits = (f.benefits && d.benefits?.length ? d.benefits : ["Benefit", "Benefit", "Benefit"]).slice(0, 4);
    const spots = [{ l: 5, t: 29 }, { r: 5, t: 29 }, { l: 5, t: 45 }, { r: 5, t: 45 }];
    return (<Frame>
      <Headline top={13} h={7} />
      <Product l={31} r={31} top={26} h={26} />
      {benefits.map((b, i) => { const s = spots[i]; if (!s) return null; return (<div key={i} style={{ position: "absolute", top: `${s.t}%`, left: s.l != null ? `${s.l}%` : "auto", right: s.r != null ? `${s.r}%` : "auto", maxWidth: "27%", padding: "3px 6px", borderRadius: 7, background: blockBg, border: `1px solid ${bColor}` }}><span style={{ fontSize: 7.5, color: ink, lineHeight: 1.1, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b}</span></div>); })}
      <span style={{ position: "absolute", left: "31%", right: "31%", top: "23%", textAlign: "center", fontSize: 6.5, fontWeight: 800, letterSpacing: "0.06em", color: sub, opacity: 0.7 }}>BENEFIT CALLOUTS</span>
      <Price />
      <CTAButton l={20} r={20} />
      {((f.reviews && d.reviews) || (f.guarantee && d.guarantee)) && <div style={{ position: "absolute", left: "10%", right: "10%", top: `${ctaTop + btnH + 4}%`, textAlign: "center" }}><span style={{ fontSize: 8.5, color: sub }}>{[f.reviews && d.reviews, f.guarantee && d.guarantee].filter(Boolean).join("  •  ")}</span></div>}
    </Frame>);
  }

  /* ---- MRG: product offset left, floating UI cards right, bold CTA, denser ---- */
  const cards = (f.benefits && d.benefits?.length ? d.benefits : ["Feature", "Routine", "Result"]).slice(0, 3);
  return (<Frame>
    <Headline top={14} h={9} align="left" big />
    <Product l={8} r={54} top={28} h={ctaTop - 28 - 4} />
    <div style={{ position: "absolute", left: "50%", right: "8%", top: "28%", display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 6.5, fontWeight: 800, letterSpacing: "0.06em", color: sub, opacity: 0.7 }}>UI CARDS</span>
      {cards.map((c, i) => (<div key={i} className="flex items-center" style={{ gap: 6, padding: "6px 8px", borderRadius: 7, background: blockBg, border: `1px solid ${bColor}` }}><span style={{ flex: 1, fontSize: 8, color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</span><span style={{ width: 12, height: 7, borderRadius: 999, background: acc, flexShrink: 0 }} /></div>))}
    </div>
    {f.price && d.price && <div style={{ position: "absolute", left: "8%", top: `${ctaTop - 5.5}%` }}><span style={{ fontSize: 11, fontWeight: 700, color: ink }}>{d.price}</span></div>}
    <CTAButton l={12} r={12} />
    {((f.reviews && d.reviews) || (f.guarantee && d.guarantee)) && <div style={{ position: "absolute", left: "10%", right: "10%", top: `${ctaTop + btnH + 4}%`, textAlign: "center" }}><span style={{ fontSize: 8.5, color: sub }}>{[f.reviews && d.reviews, f.guarantee && d.guarantee].filter(Boolean).join("  •  ")}</span></div>}
  </Frame>);
}

/* ---------------- fields ---------------- */
const AI_HINT = "AI Suggest — generated from your uploaded asset. You can edit or regenerate this suggestion.";
function RegenBtn({ loading, onClick }) {
  return (<button onClick={(e) => { e.stopPropagation(); if (!loading) onClick(); }} title="Generate a fresh AI suggestion" className="inline-flex items-center" style={{ gap: 5, padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600, color: C.flame, background: C.flameSoft, border: `1px solid ${C.flameRing}`, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}><Sparkles size={11} className={loading ? "spin" : ""} /> {loading ? "Writing…" : "Regenerate"}</button>);
}
function AiHint() {
  return (<div className="flex items-center" style={{ gap: 5, marginTop: 7, color: C.faint, fontSize: 10.5, lineHeight: 1.4 }}><Sparkles size={10} color={C.flame} style={{ flexShrink: 0 }} /><span>{AI_HINT}</span></div>);
}
function EditInput({ value, onChange, placeholder, multiline }) {
  const [focus, setFocus] = useState(false);
  const Tag = multiline ? "textarea" : "input";
  return (<div style={{ position: "relative" }}>
    <Tag value={value || ""} placeholder={placeholder} rows={multiline ? 3 : undefined} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle(focus), paddingRight: 34 }} />
    <Pencil size={13} color={focus ? C.flame : C.faint} style={{ position: "absolute", right: 12, top: multiline ? 13 : "50%", transform: multiline ? "none" : "translateY(-50%)", pointerEvents: "none", transition: "color .15s" }} />
  </div>);
}
function FieldRow({ label, value, onChange, placeholder, onRegen, regenLoading, hint }) {
  return (<div style={{ marginBottom: 16 }}>
    <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ color: C.faint, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
      {onRegen && <RegenBtn loading={regenLoading} onClick={onRegen} />}
    </div>
    <EditInput value={value} onChange={onChange} placeholder={placeholder} />
    {hint && <AiHint />}
  </div>);
}
function ToggleRow({ label, on, onToggle, value, onChange, placeholder, multiline, onRegen, regenLoading, hint }) {
  return (<div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.line}` }}>
    <div className="flex items-center" style={{ justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: on ? C.text : C.faint }}>{label}</span>
      <div className="flex items-center" style={{ gap: 9 }}>{on && onRegen && <RegenBtn loading={regenLoading} onClick={onRegen} />}<Switch on={on} onClick={onToggle} /></div>
    </div>
    {on && <div className="fade" style={{ marginTop: 9 }}><EditInput value={value} onChange={onChange} placeholder={placeholder} multiline={multiline} />{hint && <AiHint />}</div>}
  </div>);
}

/* ============================================================ main */
const FACTS = [
  "Sharks are older than trees.",
  "Bananas are berries, but strawberries aren't.",
  "Octopuses have three hearts.",
  "Honey never spoils.",
  "A group of flamingos is called a flamboyance.",
  "Kangaroos can't walk backwards.",
  "A day on Venus is longer than its year.",
  "Butterflies taste with their feet.",
  "The fingerprints of koalas are remarkably similar to human fingerprints.",
  "Sea otters hold hands while sleeping to avoid drifting apart.",
  "Wombats produce cube-shaped poop.",
  "A snail can sleep for up to three years.",
  "Hot water can freeze faster than cold water under the right conditions.",
  "There are more stars in the universe than grains of sand on Earth.",
  "The Eiffel Tower can grow more than 15 cm taller in summer.",
  "A bolt of lightning is about five times hotter than the surface of the sun.",
  "Cows have best friends and get stressed when separated.",
  "The shortest war in history lasted about 38 minutes.",
  "Polar bears have black skin under their white fur.",
  "An octopus has nine brains.",
  "Bubble wrap was originally invented as wallpaper.",
  "Some turtles can breathe through their butts.",
  "The unicorn is Scotland's national animal.",
  "A single cloud can weigh more than a million pounds.",
  "Humans share about 60% of their DNA with bananas.",
  "The dot over a lowercase i or j is called a tittle.",
  "A group of crows is called a murder.",
  "Venus is the only planet that spins clockwise.",
  "Honeybees can recognize human faces.",
  "The inventor of the frisbee was turned into a frisbee after he died.",
  "Scotland has 421 words for snow.",
  "A jiffy is an actual unit of time: 1/100th of a second.",
  "Pineapples take about two years to grow.",
  "The heart of a blue whale is the size of a small car.",
  "Tigers have striped skin, not just striped fur.",
  "Hawaiian pizza was invented in Canada.",
  "It's impossible to hum while holding your nose.",
  "A group of pugs is called a grumble.",
  "Astronauts grow up to 2 inches taller in space.",
  "The Great Wall of China isn't visible from space with the naked eye.",
  "Slugs have around 27,000 teeth.",
  "The wood frog can survive being frozen solid and thaw back to life.",
  "A shrimp's heart is in its head.",
  "Bananas are slightly radioactive.",
  "The first oranges weren't orange; they were green.",
  "Goats have rectangular pupils.",
  "Lobsters taste with their legs.",
  "A flea can jump up to 150 times its own height.",
  "The longest hiccuping spree lasted 68 years.",
  "Penguins propose to their mates with a pebble.",
];
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* Client-side copy engine — powers Regenerate everywhere (incl. Render) when no AI backend responds.
   Rotates curated, on-brand templates by visual-style tone + product/category. */
function titleCase(s) { return (s || "").replace(/\b\w/g, (c) => c.toUpperCase()); }
function localCopy(field, ctx, n) {
  const { product, category, style } = ctx;
  const cat = (category || product || "your product").toLowerCase();
  const Cat = titleCase(category || product || "Your Product");
  const t = ["aisuggest", "apple", "luxury", "organic", "ugc", "bold"].includes(style) ? style : "aisuggest";
  const pick = (arr) => arr[(((n || 0) % arr.length) + arr.length) % arr.length];
  if (field === "headline") {
    const sets = {
      luxury: [`${Cat}, Perfected.`, `The Art of ${Cat}.`, `Indulgence, Refined.`, `Crafted to Impress.`, `Effortless Luxury.`],
      organic: [`Pure ${Cat}, Naturally.`, `Rooted in Real Results.`, `Clean. Gentle. Effective.`, `Nature, Bottled.`, `Feel the Difference.`],
      bold: [`${Cat}. Zero Compromise.`, `Results You Can See.`, `Stop Settling. Start Winning.`, `The Upgrade You Need.`, `Built to Outperform.`],
      ugc: [`Honestly? Game-Changing.`, `Wish I Found This Sooner.`, `This Actually Works.`, `Your New Daily Obsession.`, `You Need to Try This.`],
      apple: [`${Cat}. Simplified.`, `Beautifully Effective.`, `Less, But Better.`, `Designed Around You.`, `It Simply Works.`],
      aisuggest: [`${Cat}, Elevated.`, `Visibly Better, Daily.`, `Your Best Look Yet.`, `Made to Stand Out.`, `Premium, Made Simple.`],
    };
    return pick(sets[t]);
  }
  if (field === "subheadline") {
    const sets = {
      luxury: [`A refined ${cat} crafted for those who expect more.`, `Timeless quality, designed to elevate every day.`, `Understated luxury you can feel from the first use.`],
      organic: [`Clean, naturally-derived ${cat} for visible everyday results.`, `Gentle on you, powered by nature.`, `Real ingredients, real results — nothing you can't pronounce.`],
      bold: [`The ${cat} that finally delivers what it promises.`, `High performance, no compromises, real results.`, `Stop guessing. Start seeing the difference.`],
      ugc: [`The ${cat} everyone keeps asking me about.`, `Easy to use, and you'll see why it's worth it.`, `Added it to my routine and never looked back.`],
      apple: [`Premium ${cat}, designed to fit effortlessly into your day.`, `Thoughtfully made for visible, lasting results.`, `Everything you want, nothing you don't.`],
      aisuggest: [`Premium ${cat} designed for visible, everyday results.`, `Made to look great and actually work.`, `The simple upgrade your routine was missing.`],
    };
    return pick(sets[t]);
  }
  if (field === "ctaText") return pick(["Shop Now", "Get Yours", "Start Today", "Try It Now", "Add to Cart", "Discover More", "Shop the Drop"]);
  if (field === "guarantee") return pick(["30-day money-back guarantee", "Risk-free 30-day trial", "Love it or your money back", "Free returns, always", "100% satisfaction guaranteed"]);
  if (field === "benefits") {
    const sets = {
      organic: [["Clean ingredients", "Gentle daily use", "Visible results"], ["Naturally derived", "Dermatologist tested", "Cruelty free"]],
      luxury: [["Premium formula", "Fast absorbing", "Elegant finish"], ["Clinically backed", "Luxe texture", "Visible glow"]],
      bold: [["Works fast", "Proven results", "No fillers"], ["See it in days", "Maximum strength", "Zero compromise"]],
      ugc: [["Easy to use", "Feels amazing", "Actually works"], ["Daily favorite", "Travel friendly", "Loved by thousands"]],
      apple: [["Simple routine", "Visible results", "Feels premium"], ["Clean design", "Effortless use", "Made to last"]],
      aisuggest: [["Premium quality", "Visible results", "Loved by customers"], ["Fast acting", "Easy to use", "Trusted formula"]],
    };
    return pick(sets[t]);
  }
  return "";
}

export default function CTADirector() {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState("website");
  const [main, setMain] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [pct, setPct] = useState(0);
  const [fact, setFact] = useState("");
  const [draft, setDraft] = useState(null);
  const [applied, setApplied] = useState(null);
  const [angle, setAngle] = useState(0);
  const [justApplied, setJustApplied] = useState(false);
  const [regenField, setRegenField] = useState(null);
  const prefs = useRef({ style: "aisuggest", inspo: "veda" });
  const detectedColors = useRef([]);
  const factDeck = useRef([]);
  const factIdx = useRef(0);

  const sf = (k) => (v) => setDraft((p) => ({ ...p, [k]: v }));
  const tf = (k) => () => setDraft((p) => ({ ...p, flags: { ...p.flags, [k]: !p.flags[k] } }));
  const setBenefits = (v) => setDraft((p) => ({ ...p, benefits: v.split(",").map((s) => s.trim()).filter(Boolean) }));
  const setStyle = (key) => setDraft((p) => {
    const pal = key === "aisuggest" ? (detectedColors.current.length ? detectedColors.current : p.brandColors) : ((STYLES.find((s) => s.key === key) || {}).palette || p.brandColors);
    return { ...p, style: key, brandColors: pal };
  });
  const dirty = draft && applied && JSON.stringify(draft) !== JSON.stringify(applied);
  const apply = () => { setApplied(clone(draft)); setJustApplied(true); setTimeout(() => setJustApplied(false), 1300); };
  useEffect(() => { if (draft) prefs.current = { style: draft.style, inspo: draft.inspo }; }, [draft?.style, draft?.inspo]);

  const liveTheme = useMemo(() => (draft ? styleTheme(draft.style, draft.brandColors) : STYLES[0].theme), [draft?.style, draft?.brandColors]);

  const [scrolled, setScrolled] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY || window.pageYOffset || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const heroGlow = step === 1 ? Math.min(1, scrolled / 380) : 0;

  const regenCount = useRef({});
  const regenerate = async (field) => {
    if (!main || regenField) return;
    const ask = {
      headline: "one fresh, punchy, premium headline (max 6 words, benefit-led)",
      subheadline: "one fresh supporting subheadline (max 12 words)",
      ctaText: "one fresh CTA button label (max 3 words, action-led)",
      benefits: "exactly 3 fresh short product benefits as a comma-separated list (each max 4 words)",
      guarantee: "one fresh short guarantee or trust line (max 8 words)",
    }[field];
    if (!ask) return;
    setRegenField(field);
    const ref = source === "website" ? "website screenshot" : "product image";
    const styleName = (STYLES.find((s) => s.key === draft.style) || {}).name || "premium";
    const inspoName = (INSPO.find((i) => i.key === draft.inspo) || {}).name || "";
    let out = "";
    // 1) Try the AI backend (works in the Claude artifact environment).
    const text = `You are an elite DTC conversion copywriter. Look closely at this ${ref} for the product "${draft.product || "(see image)"}"${draft.category ? ` (category: ${draft.category})` : ""}. The chosen visual style is "${styleName}"${inspoName ? ` and the layout is "${inspoName}"` : ""}. Write ${ask} — an OPTIMIZED marketing alternative, not a copy of the on-page text, matched to that style and tone. Relevant to this exact product category and positioning, premium and conversion-focused, realistic. Never invent unrealistic claims, prices, or unrelated copy. Return ONLY the text itself — no quotes, labels or preamble.`;
    try { out = (await callClaude({ image: main, text, maxTokens: 120 })).replace(/^["'\s]+|["'\s]+$/g, "").split("\n")[0].trim(); } catch (e) {}
    // 2) Fallback to the client-side engine (works everywhere, incl. Render).
    if (!out) {
      const n = (regenCount.current[field] = (regenCount.current[field] || 0) + 1);
      const res = localCopy(field, { product: draft.product, category: draft.category, style: draft.style }, n);
      out = Array.isArray(res) ? res.join(", ") : res;
    }
    if (out) {
      if (field === "benefits") setDraft((p) => ({ ...p, benefits: out.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4), flags: { ...p.flags, benefits: true } }));
      else setDraft((p) => ({ ...p, [field]: out, flags: { ...p.flags, [field]: true } }));
    }
    setRegenField(null);
  };

  const analyze = async () => {
    const ref = source === "website" ? "website screenshot" : "product image";
    const text = `You are an elite DTC creative director and conversion copywriter. Analyze this ${ref} as the primary source of truth, then act like a world-class copywriter.
Return ONLY minified JSON, no markdown.
"detected" = the EXACT values literally visible on screen (real product name, product category in 1-3 words, headline, CTA label, price, review rating/count, guarantee, benefits). Do not translate, paraphrase or invent; use "" or [] if a value is not actually visible — but ALWAYS infer the category from the product even if not written.
"suggested" = premium, conversion-focused marketing copy you write yourself, based on the product category, brand style, page copy, visual identity and ecommerce best practices. Do NOT just copy the detected text — improve it. ALWAYS fill every suggested field even if the detected text is missing: infer strong copy from the product category, branding and product name. Keep it realistic and on-brand; never invent fake claims, prices or numbers.
{"detected":{"product":"","category":"","brandColors":["#hex","#hex","#hex","#hex"],"headline":"","subheadline":"","price":"","ctaText":"","reviews":"","benefits":[],"guarantee":""},"suggested":{"headline":"max 6 words, punchy benefit-led","subheadline":"max 12 words, supportive","ctaText":"max 3 words, action-led","benefits":["3 short benefits, each max 4 words"]}}`;
    let det = null, sug = {};
    try { const t = await callClaude({ image: main, text, maxTokens: 1300 }); const j = parseJSON(t); det = j.detected || j.analysis || {}; sug = j.suggested || {}; } catch (e) {}
    if (!det || !Object.keys(det).length) {
      let colors = []; try { const im = await new Promise((res) => { const x = new Image(); x.onload = () => res(x); x.onerror = () => res(null); x.src = main.dataUrl; }); if (im) colors = sampleColors(im); } catch (e) {}
      det = { product: "", category: "", brandColors: colors, headline: "", subheadline: "", price: "", ctaText: "", reviews: "", benefits: [], guarantee: "" };
    }
    return { det, sug };
  };

  const generate = async () => {
    if (!main) return;
    setStep(2); setPhase("loading"); setDraft(null); setApplied(null); setAngle(0); setPct(0); setStatusMsg(LOAD_MSGS[0]);
    factDeck.current = shuffle(FACTS); factIdx.current = 0; setFact(factDeck.current[0]);
    const t0 = Date.now(); let mi = 0;
    const miv = setInterval(() => { mi = Math.min(mi + 1, LOAD_MSGS.length - 1); setStatusMsg(LOAD_MSGS[mi]); }, 320);
    const piv = setInterval(() => { setPct(Math.min(95, Math.round((Date.now() - t0) / 3200 * 95))); }, 70);
    const fiv = setInterval(() => {
      factIdx.current += 1;
      if (factIdx.current >= factDeck.current.length) {
        const last = factDeck.current[factDeck.current.length - 1];
        let nd = shuffle(FACTS); if (nd[0] === last && nd.length > 1) { [nd[0], nd[1]] = [nd[1], nd[0]]; }
        factDeck.current = nd; factIdx.current = 0;
      }
      setFact(factDeck.current[factIdx.current]);
    }, 4000);
    const { det, sug } = await analyze();
    const elapsed = Date.now() - t0; if (elapsed < 3200) await sleep(3200 - elapsed);
    clearInterval(miv); clearInterval(piv); clearInterval(fiv); setPct(100); await sleep(280);
    const colors = (det.brandColors || []).filter(Boolean);
    const bc = colors.length ? colors : ["#E51929", "#F2EDE8", "#0C1018"];
    detectedColors.current = bc;
    const startStyle = prefs.current.style;
    const startColors = startStyle === "aisuggest" ? bc : ((STYLES.find((s) => s.key === startStyle) || {}).palette || bc);
    // creative fields are pre-filled with the OPTIMIZED suggestion — never left empty (infer from product/category as a last resort)
    const prod = det.product || "";
    const cat = det.category || "";
    const subject = prod || (cat ? cat : "this product");
    const headline = sug.headline || det.headline || (cat ? `${cat[0].toUpperCase() + cat.slice(1)}, perfected.` : (prod ? `Meet ${prod}.` : "Upgrade your daily routine."));
    const subheadline = sug.subheadline || det.subheadline || (cat ? `Premium ${cat} designed for visible, everyday results.` : `Designed to make ${subject} effortless.`);
    const ctaText = sug.ctaText || det.ctaText || "Shop Now";
    const sBenefits = (sug.benefits || []).filter(Boolean);
    let benefits = sBenefits.length ? sBenefits : (det.benefits || []).filter(Boolean);
    if (!benefits.length) benefits = ["Premium quality", "Visible results", "Loved by customers"];
    const d0 = {
      product: prod, category: cat, ctaText,
      headline, subheadline, price: det.price || "",
      reviews: det.reviews || "", guarantee: det.guarantee || "", benefits,
      brandColors: startColors,
      ctaPos: "Balanced", style: startStyle, inspo: prefs.current.inspo,
      flags: {
        headline: true, subheadline: true, benefits: true,
        price: !!det.price, reviews: !!det.reviews, guarantee: !!det.guarantee,
      },
    };
    setDraft(d0); setApplied(clone(d0)); setPhase("done");
  };

  const prompt = useMemo(() => (applied ? buildPrompt(applied, source, angle, applied.inspo, applied.style) : ""), [applied, source, angle]);
  const appliedStyle = STYLES.find((s) => s.key === applied?.style) || STYLES[0];
  const appliedInspo = INSPO.find((i) => i.key === applied?.inspo) || INSPO[0];

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1200px 620px at 50% -12%, ${C.bgGrad}, ${C.bg})`, color: C.text, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <div aria-hidden style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "46vh", pointerEvents: "none", zIndex: 0, opacity: heroGlow * 0.6, background: `radial-gradient(120% 120% at 50% 150%, ${C.flame} 0%, rgba(238,94,44,0.42) 24%, rgba(238,94,44,0) 62%)`, transition: "opacity .5s cubic-bezier(.2,.7,.2,1)" }} />
      <style>{`
        @keyframes fadeUp { from {opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
        @keyframes spin { to { transform: rotate(360deg);} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(238,94,44,0.45);} 50%{box-shadow:0 0 0 7px rgba(238,94,44,0);} }
        @keyframes pop { 0%{transform:scale(.4); opacity:0;} 60%{transform:scale(1.12);} 100%{transform:scale(1); opacity:1;} }
        .fade { animation: fadeUp .4s cubic-bezier(.2,.7,.2,1) both; }
        .spin { animation: spin 1.1s linear infinite; }
        .pulse { animation: pulse 1.6s ease-in-out infinite; border-radius:12px; }
        .pop { animation: pop .4s cubic-bezier(.2,.8,.2,1) both; }
        input::placeholder, textarea::placeholder { color: ${C.faint}; }
        @keyframes ssCursor {
          0% { left:6%; top:14%; opacity:0; } 8% { opacity:1; }
          22% { left:9%; top:24%; } 52% { left:88%; top:86%; }
          66% { left:88%; top:86%; opacity:1; } 84% { opacity:1; } 100% { left:88%; top:86%; opacity:0; }
        }
        @keyframes ssSel {
          0%,22% { left:9%; top:24%; width:0%; height:0%; opacity:0; }
          26% { opacity:1; } 52% { left:9%; top:24%; width:79%; height:62%; opacity:1; }
          66% { left:9%; top:24%; width:79%; height:62%; opacity:1; }
          80% { opacity:0; } 100% { left:9%; top:24%; width:79%; height:62%; opacity:0; }
        }
        @keyframes ssFlash { 0%,60% { opacity:0; } 67% { opacity:0.55; } 76% { opacity:0; } 100% { opacity:0; } }
        .ssCursor { animation: ssCursor 5s ease-in-out infinite; z-index:3; }
        .ssSel { animation: ssSel 5s ease-in-out infinite; }
        .ssFlash { animation: ssFlash 5s ease-in-out infinite; }
        @keyframes heroBloom {
          0%, 100% { text-shadow: 0 0 8px rgba(238,94,44,0.28), 0 0 20px rgba(238,94,44,0.15); }
          50% { text-shadow: 0 0 16px rgba(238,94,44,0.55), 0 0 40px rgba(238,94,44,0.32); }
        }
        .heroGlow { animation: heroBloom 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .heroGlow { animation: none; } }
      `}</style>

      <header className="flex items-center" style={{ position: "relative", zIndex: 1, justifyContent: "space-between", padding: "18px 32px", borderBottom: `1px solid ${C.line}` }}><Logo /><StepNav step={step} /></header>

      <main style={{ position: "relative", zIndex: 1, padding: "52px 32px 40px" }}>
        {step === 1 && (
          <div className="fade mx-auto w-full" style={{ maxWidth: 640 }}>
            <div className="text-center" style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: "#fff", lineHeight: 1.1 }}>The easiest way to create <span className="heroGlow" style={{ color: C.flame }}>beautiful CTAs.</span></h1>
              <p style={{ color: C.mute, fontSize: 15.5, marginTop: 14, lineHeight: 1.6, maxWidth: 540, marginLeft: "auto", marginRight: "auto", opacity: 0.85 }}>Stop wasting time tweaking prompts. Upload once and let AI do the heavy lifting — generate the perfect CTA in seconds.</p>
            </div>
            <div style={{ color: C.faint, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 12 }}>SOURCE TYPE</div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 26 }}>
              {[{ k: "website", icon: <Layers size={20} />, t: "Website Screenshot", d: "Primary source of truth — product, colors, price, reviews and brand style detected automatically." },
                { k: "product", icon: <ImageIcon size={20} />, t: "Product Image", d: "Just the product. The AI detects packaging and brand, then directs the rest." }].map((o) => (
                <HeroSourceCard key={o.k} o={o} on={source === o.k} onClick={() => { setSource(o.k); setMain(null); }} />
              ))}
            </div>
            {source === "website" && !main && <ScreenshotHint />}
            <Dropzone label={source === "website" ? "Website Screenshot" : "Product Image"} asset={main} onFile={async (f) => setMain(await readImage(f))} onClear={() => setMain(null)} />
            <div className="flex" style={{ justifyContent: "center", marginTop: 30 }}><Primary hero onClick={generate} disabled={!main}><Sparkles size={16} /> Analyze & build Flow prompt</Primary></div>
          </div>
        )}

        {step === 2 && phase === "loading" && (
          <div className="fade mx-auto text-center" style={{ maxWidth: 420, paddingTop: 70 }}>
            <div style={{ position: "relative", width: 84, height: 84, margin: "0 auto" }}>
              <div className="spin" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(${C.flame}, rgba(238,94,44,0.05) 70%)`, WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0)", mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="30" height="30" viewBox="0 0 28 28" style={{ animation: "pulse 1.6s ease-in-out infinite" }}><path d="M14 3 L25 25 L17.8 25 L14 16.5 L10.2 25 L3 25 Z" fill={C.flame} /></svg></div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 24 }}>Analyzing your asset</div>
            <div style={{ color: C.mute, fontSize: 14, marginTop: 8, minHeight: 20 }}>{statusMsg}</div>
            <div style={{ height: 6, borderRadius: 999, background: C.panel2, overflow: "hidden", marginTop: 22 }}><div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.flame}, ${C.flameDeep})`, borderRadius: 999, transition: "width .25s ease" }} /></div>
            <div style={{ color: C.faint, fontSize: 12, marginTop: 8 }}>{pct}%</div>
            <div key={fact} className="fade" style={{ marginTop: 26, fontSize: 12.5, color: C.mute, opacity: 0.75, lineHeight: 1.5 }}><span style={{ color: C.flame, fontWeight: 600 }}>💡 Did you know?</span> {fact}</div>
          </div>
        )}

        {step === 2 && phase === "done" && draft && (
          <div className="fade mx-auto w-full" style={{ maxWidth: 1060 }}>
            <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div><h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Tweak what you want, then apply</h1>
                <p style={{ color: C.mute, fontSize: 14, marginTop: 6 }}>Preview updates live. The prompt updates when you hit Apply Changes.</p></div>
              <Ghost onClick={() => setStep(1)}><ArrowLeft size={15} /> New</Ghost>
            </div>

            <div style={{ borderRadius: 16, background: C.panel, border: `1px solid ${C.line}`, padding: 18, marginBottom: 20 }}>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}><Palette size={15} color={C.flame} /><span style={{ fontSize: 13, fontWeight: 600 }}>Visual style</span><span style={{ color: C.faint, fontSize: 11, marginLeft: "auto" }}>AI Suggest adapts to your brand — others keep their own look</span></div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 10 }}>
                {STYLES.map((s) => <StyleCard key={s.key} s={s} on={draft.style === s.key} brand={draft.brandColors} onClick={() => setStyle(s.key)} />)}
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
              <div style={{ borderRadius: 16, background: C.panel, border: `1px solid ${C.line}`, padding: 16, position: "sticky", top: 16 }}>
                <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}><LayoutTemplate size={15} color={C.flame} /><span style={{ fontSize: 13, fontWeight: 600 }}>Layout builder</span><span style={{ color: C.faint, fontSize: 11, marginLeft: "auto" }}>{(STYLES.find((s) => s.key === draft.style) || STYLES[0]).name}</span></div>
                <Wireframe d={draft} theme={liveTheme} />
                <div style={{ marginTop: 16 }}><span style={{ color: C.faint, fontSize: 11, display: "block", marginBottom: 7 }}>CTA POSITION</span><Segmented full options={["High", "Balanced", "Low"]} value={draft.ctaPos} onChange={sf("ctaPos")} /></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 14, fontSize: 10.5, color: C.mute }}>
                  <span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: C.safe, border: `1px solid ${C.safeLine}`, marginRight: 5 }} />Safe zones</span>
                  <span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: C.zone, border: `1px solid ${C.zoneLine}`, marginRight: 5 }} />CTA safe area</span>
                </div>
              </div>

              <div style={{ borderRadius: 16, background: C.panel, border: `1px solid ${C.line}`, padding: 20 }}>
                <div className="flex items-center" style={{ gap: 8, marginBottom: 18 }}><Sparkles size={15} color={C.flame} /><span style={{ fontSize: 13, fontWeight: 600 }}>Detected & AI-written suggestions</span><span style={{ color: C.faint, fontSize: 11, marginLeft: "auto" }}>edit, regenerate or toggle off</span></div>
                <FieldRow label="PRODUCT" value={draft.product} onChange={sf("product")} placeholder="Detected product name" />
                <ToggleRow label="Headline" on={draft.flags.headline} onToggle={tf("headline")} value={draft.headline} onChange={sf("headline")} placeholder="Detected headline" onRegen={() => regenerate("headline")} regenLoading={regenField === "headline"} hint />
                <ToggleRow label="Subheadline" on={draft.flags.subheadline} onToggle={tf("subheadline")} value={draft.subheadline} onChange={sf("subheadline")} placeholder="Detected subheadline" onRegen={() => regenerate("subheadline")} regenLoading={regenField === "subheadline"} hint />
                <FieldRow label="CTA BUTTON TEXT" value={draft.ctaText} onChange={sf("ctaText")} placeholder="e.g. Shop Now" onRegen={() => regenerate("ctaText")} regenLoading={regenField === "ctaText"} hint />
                <ToggleRow label="Price" on={draft.flags.price} onToggle={tf("price")} value={draft.price} onChange={sf("price")} placeholder="Detected price" />
                <ToggleRow label="Reviews" on={draft.flags.reviews} onToggle={tf("reviews")} value={draft.reviews} onChange={sf("reviews")} placeholder="e.g. 4.8 · 40K+ reviews" />
                <ToggleRow label="Guarantee" on={draft.flags.guarantee} onToggle={tf("guarantee")} value={draft.guarantee} onChange={sf("guarantee")} placeholder="e.g. 30-day money-back guarantee" onRegen={() => regenerate("guarantee")} regenLoading={regenField === "guarantee"} hint />
                <ToggleRow label="Benefits" on={draft.flags.benefits} onToggle={tf("benefits")} value={(draft.benefits || []).join(", ")} onChange={setBenefits} placeholder="One per comma — e.g. Hydrates skin, Refines pores" multiline onRegen={() => regenerate("benefits")} regenLoading={regenField === "benefits"} hint />
                <div>
                  <span style={{ color: C.faint, fontSize: 11, fontWeight: 600, display: "block", marginBottom: 9 }}>BRAND COLORS <span style={{ opacity: 0.7, fontWeight: 500 }}>· {draft.style === "aisuggest" ? "detected from your asset" : "set by Visual Style"}</span></span>
                  <div className="flex" style={{ gap: 14 }}>
                    {["Primary", "Secondary", "Accent"].map((lbl, i) => { const hex = (draft.brandColors || [])[i] || "#0c1018"; return (
                      <label key={lbl} className="flex flex-col items-center" style={{ gap: 6 }}><input type="color" value={hex} onChange={(e) => setDraft((p) => { const c = [...(p.brandColors || ["#E51929", "#F2EDE8", "#0C1018"])]; c[i] = e.target.value; return { ...p, brandColors: c }; })} style={{ width: 46, height: 46, padding: 0, border: `1px solid ${C.lineSoft}`, borderRadius: 12, background: "transparent", cursor: "pointer" }} /><span style={{ fontSize: 10, color: C.faint }}>{lbl}</span></label>); })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderRadius: 16, background: C.panel, border: `1px solid ${C.line}`, padding: 18, marginTop: 20 }}>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 6 }}><LayoutTemplate size={15} color={C.flame} /><span style={{ fontSize: 13, fontWeight: 600 }}>Layout inspiration</span><span style={{ color: C.faint, fontSize: 11, marginLeft: "auto" }}>composition only · never copied</span></div>
              <p style={{ color: C.faint, fontSize: 12, margin: "0 0 14px", lineHeight: 1.5 }}>References guide spacing, hierarchy and CTA placement only. Your uploaded product stays the source of truth.</p>
              <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {INSPO.map((it) => <InspoCard key={it.key} item={it} selected={draft.inspo === it.key} onClick={() => sf("inspo")(it.key)} />)}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              {dirty ? <div className="pulse"><Primary full onClick={apply}><Check size={17} /> Apply Changes & update Flow prompt</Primary></div>
                : justApplied ? <div className="flex items-center justify-center fade" style={{ gap: 8, padding: "14px", borderRadius: 12, background: C.okSoft, border: `1px solid rgba(63,174,110,0.35)`, color: C.ok, fontSize: 14, fontWeight: 600 }}><span className="pop inline-flex items-center justify-center" style={{ width: 19, height: 19, borderRadius: 999, background: C.ok }}><Check size={12} color="#fff" strokeWidth={3} /></span> Applied — preview & prompt are in sync</div>
                  : <div className="flex items-center justify-center" style={{ gap: 7, padding: "13px", color: C.faint, fontSize: 13 }}><Check size={14} /> Everything is in sync with the Flow prompt</div>}
            </div>

            <div style={{ position: "sticky", top: 0, zIndex: 5, marginTop: 22, borderRadius: 12, background: C.warn, border: `1px solid ${C.warnLine}`, padding: "11px 15px", color: "#f0a584", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 9, backdropFilter: "blur(6px)" }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} /> Don't forget to attach your {source === "website" ? "Website Screenshot" : "Product Image"} as a Flow reference before generating.
            </div>

            <div style={{ marginTop: 12, borderRadius: 16, background: C.panel, border: `1px solid ${C.line}`, overflow: "hidden" }}>
              <div className="flex items-center" style={{ justifyContent: "space-between", padding: "13px 16px", borderBottom: `1px solid ${C.line}`, gap: 12, flexWrap: "wrap" }}>
                <div className="flex items-center" style={{ gap: 9 }}><Sparkles size={15} color={C.flame} /><span style={{ fontSize: 14, fontWeight: 600 }}>Your Flow prompt</span><span style={{ color: C.faint, fontSize: 12 }}>{appliedStyle.name} · {appliedInspo.name} · {ANGLES[angle % ANGLES.length].name}</span></div>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <CopyBtn text={prompt} label="Copy Prompt" primary />
                  <button onClick={() => setAngle((a) => a + 1)} className="inline-flex items-center" style={{ gap: 7, padding: "9px 15px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.mute, background: C.panel2, border: `1px solid ${C.line}`, cursor: "pointer" }}><RefreshCw size={14} /> New angle</button>
                </div>
              </div>
              {dirty && <div style={{ padding: "8px 16px", background: C.flameSoft, color: "#f0a584", fontSize: 12, borderBottom: `1px solid ${C.flameRing}` }}>You have unsaved edits — hit Apply Changes to refresh this prompt.</div>}
              <pre style={{ margin: 0, padding: 18, color: C.text, fontSize: 12.5, lineHeight: 1.62, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", maxHeight: 400, overflow: "auto" }}>{prompt}</pre>
            </div>

            <RulesPanel />
          </div>
        )}
      </main>

      <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "26px 0 40px", fontSize: 11, color: C.mute, opacity: 0.45, letterSpacing: "0.02em" }}>by Dima</footer>
    </div>
  );
}

function RulesPanel() {
  return (<div style={{ marginTop: 18, borderRadius: 16, background: C.panel, border: `1px solid ${C.line}`, padding: 18 }}>
    <div className="flex items-center" style={{ gap: 9, marginBottom: 14 }}><ShieldCheck size={16} color={C.flame} /><span style={{ fontSize: 14, fontWeight: 600 }}>Automatic CTA rules</span><span className="inline-flex items-center" style={{ gap: 5, marginLeft: "auto", color: C.faint, fontSize: 12 }}><Lock size={12} /> Always enforced</span></div>
    <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 28px" }}>
      {CTA_RULES.map((r, i) => (<div key={i} className="flex" style={{ gap: 9, alignItems: "flex-start" }}>
        <span className="inline-flex items-center justify-center" style={{ flexShrink: 0, width: 18, height: 18, marginTop: 1, borderRadius: 5, fontSize: 11, fontWeight: 600, color: C.flame, background: C.flameSoft, border: `1px solid ${C.flameRing}` }}>{i + 1}</span>
        <span style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.5 }}>{r}</span>
      </div>))}
    </div>
  </div>);
}

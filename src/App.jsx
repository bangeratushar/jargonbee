import React, { useState, useEffect, useRef, useCallback } from "react";

/* =================================================================
   JargonBee — Corporate Vocabulary Proficiency Assessment
   v4 · "JargonBee.exe" — 1996 desktop edition
   Word is SPOKEN (pron override), REDACTED on screen.
   Result is shareable as a JargonBee.exe-window PNG.
================================================================= */

// Set this once you deploy, e.g. "jargonbee.xyz" — it gets printed on the share image.
const SHARE_URL = "jargonbee.vercel.app";

// OPTIONAL but recommended for launch — GUARANTEED pronunciation on every device.
// Generate one audio clip per word (see generate_audio.py), host the folder, and set this.
// When set, the game plays {AUDIO_BASE}/{word}.mp3 (e.g. optimize.mp3, low-hanging-fruit.mp3)
// instead of the visitor's built-in voice — so everyone hears the same correct pronunciation.
const AUDIO_BASE = "/audio";
const slugify = (w) => w.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-+|-+$/g, "");
const audioUrl = (w) => (AUDIO_BASE ? `${AUDIO_BASE}/${slugify(w)}.mp3` : "");

/* RANKS_START */
const RANKS = [
  { title: "Unpaid Intern",          quip: "They gave you a lanyard." },
  { title: "Middle Manager",         quip: "You now own a meeting nobody wanted." },
  { title: "Director of Synergy",    quip: "A corner of the open-plan office is yours." },
  { title: "VP of Vibes",            quip: "You have a direct report and zero direction." },
  { title: "Chief Buzzword Officer", quip: "You speak only in slides now." },
];
const WIN_RANK = { title: "Thought Leader", quip: "You have transcended meaning entirely." };
/* RANKS_END */

/* WORDS_START */
/* pron = optional override; currently UNUSED — the real word is spoken via the chosen voice */
const WORDS = [
  // ---- TIER 0 — Unpaid Intern ----
  { w: "pivot", tier: 0, note: "one word", s: "We're not failing, we're choosing to {w} toward a more promising vertical.", r: "A dignified word for 'the first idea didn't work.'" },
  { w: "synergy", tier: 0, note: "one word", s: "Let's unlock {w} across the org and circle back on the value.", r: "The sound two teams make taking credit for each other's work." },
  { w: "agile", tier: 0, note: "one word", s: "We're being {w} about the deadline we already blew past.", r: "A twelve-page manifesto about doing less paperwork." },
  { w: "scalable", tier: 0, note: "one word", s: "Is the coffee machine {w}? Everything here must be {w}.", r: "Works for two users. In theory, works for two million." },
  { w: "bandwidth", tier: 0, note: "one word", s: "I don't have the {w} to discuss {w} right now.", r: "Pretending you're a router so you can skip the task." },
  { w: "proactive", tier: 0, note: "one word", s: "Let's be {w} about the reactive thing we should've done last quarter.", r: "Reactive, but earlier and considerably louder." },
  { w: "optimize", tier: 0, note: "one word — UK 'optimise' also accepted", pron: "op tih mize", s: "We'll {w} the workflow by adding a dashboard nobody opens.", r: "Making it slightly worse, but on purpose, with a chart." },
  { w: "onboarding", tier: 0, note: "one word", s: "Your {w} is three weeks of links you will never open.", r: "A welcome, expressed entirely as homework." },
  { w: "mindset", tier: 0, note: "one word", s: "We need a growth {w}, ideally before the next round of layoffs.", r: "A personality trait you can put on a performance review." },
  { w: "workflow", tier: 0, note: "one word", s: "The new {w} has eleven steps, all of them a meeting.", r: "The long way round, now with a diagram." },
  { w: "rollout", tier: 0, note: "one word", s: "The {w} went smoothly, apart from everything that happened during it.", r: "A launch, but with more apologies." },
  { w: "headcount", tier: 0, note: "one word", s: "We're growing {w} to manage the people we hired to grow {w}.", r: "People, expressed as a budget line." },
  { w: "touchpoint", tier: 0, note: "one word", s: "That email was a meaningful {w} in the customer's lonely journey.", r: "Any time you bothered someone and called it a strategy." },
  { w: "upskill", tier: 0, note: "one word", s: "We'll {w} the team with a webinar at 5pm on a Friday.", r: "Learning, assigned as a chore." },
  { w: "takeaway", tier: 0, note: "one word", s: "The main {w} from the meeting was that we'll need another meeting.", r: "The one thing you remember from ninety minutes you'll never get back." },
  { w: "ballpark", tier: 0, note: "one word", s: "Give me a {w} figure and I'll treat it as a binding contract.", r: "A wild guess wearing a tie." },
  { w: "buzzword", tier: 0, note: "one word", s: "Let's avoid {w} bingo, said no deck in history.", r: "You're spelling one right now." },
  { w: "runway", tier: 0, note: "one word", s: "We have eight months of {w} and a four-month plan.", r: "How long until the panic becomes official." },
  { w: "blocker", tier: 0, note: "one word", s: "My only {w} is the twelve other things I'm choosing not to mention.", r: "A reason, pre-loaded for the standup." },
  { w: "sprint", tier: 0, note: "one word", s: "This two-week {w} is the same marathon we've been running all year.", r: "A deadline that arrives every fortnight, forever." },

  // ---- TIER 1 — Middle Manager ----
  { w: "leverage", tier: 1, note: "one word", s: "We'll {w} our learnings to {w} the {w} we already have.", r: "'Use,' wearing a blazer." },
  { w: "holistic", tier: 1, note: "one word — one l", s: "Let's take a {w} view of why nobody read the {w} deck.", r: "'I haven't read the details, but I have a feeling.'" },
  { w: "granular", tier: 1, note: "one word", s: "Can we get {w} on the high-level summary of the {w} details?", r: "Zooming in until everyone forgets the point." },
  { w: "cadence", tier: 1, note: "one word", s: "Let's set a weekly {w} to discuss our {w}.", r: "A meeting that recurs because nobody cancelled it." },
  { w: "streamline", tier: 1, note: "one word", s: "We {w} the process by adding three more approval steps.", r: "Add steps. Call it fewer." },
  { w: "deliverable", tier: 1, note: "one word", s: "The key {w} is a deck about things we'll deliver later.", r: "Something you promised before you knew what it was." },
  { w: "actionable", tier: 1, note: "one word", s: "Are these insights {w}, or merely insightful?", r: "An idea that arrives with homework attached." },
  { w: "bottleneck", tier: 1, note: "one word — double t", s: "The {w} is the meeting we hold to discuss the {w}.", r: "The slow part, now everybody's favourite excuse." },
  { w: "benchmark", tier: 1, note: "one word", s: "Let's {w} against a competitor we don't understand.", r: "Comparing yourself to someone, badly, on purpose." },
  { w: "stakeholder", tier: 1, note: "one word", s: "Every {w} agreed, which is how we knew the plan was doomed.", r: "Anyone who can say no but won't say why." },
  { w: "throughput", tier: 1, note: "one word", s: "Our {w} doubled, mostly in the number of status updates.", r: "How much work survives the meetings about it." },
  { w: "ecosystem", tier: 1, note: "one word", s: "We're building a vibrant {w} of partners who never call back.", r: "A pile of logos arranged into a slide." },
  { w: "iterate", tier: 1, note: "one word", s: "Let's {w} on this until it quietly becomes someone else's problem.", r: "Doing it again and calling it progress." },
  { w: "framework", tier: 1, note: "one word", s: "I built a {w} to explain why we need another {w}.", r: "A grid you draw so opinions look like science." },
  { w: "momentum", tier: 1, note: "one word", s: "We have real {w}, defined as nobody having quit this week.", r: "The feeling right before everyone notices nothing shipped." },
  { w: "disruptive", tier: 1, note: "one word", s: "Our idea is wildly {w}, which is why it's exactly like the last six.", r: "Annoying, but venture-backed." },
  { w: "frictionless", tier: 1, note: "one word", s: "The signup is {w}, except for the eleven required fields.", r: "Easy, claimed loudly by someone who never tried it." },
  { w: "calibrate", tier: 1, note: "one word", s: "Let's {w} expectations down to roughly nothing.", r: "To adjust a number until it stops being upsetting." },

  // ---- TIER 2 — Director of Synergy ----
  { w: "paradigm", tier: 2, note: "one word — silent g", pron: "pair uh dime", s: "This is a {w} shift that shifts the very {w} of shifting.", r: "A word people reach for when 'change' feels too small." },
  { w: "rapport", tier: 2, note: "one word — silent t", pron: "ra pore", s: "We built strong {w} over four reschedules and one no-show.", r: "Small talk with a quarterly target." },
  { w: "nuanced", tier: 2, note: "one word", pron: "noo ahnst", s: "It's a {w} position, by which I mean I haven't decided.", r: "'I would like credit for both sides, please.'" },
  { w: "bespoke", tier: 2, note: "one word", s: "We offer a {w} solution, identical to everyone else's {w} solution.", r: "Regular, but more expensive." },
  { w: "ideate", tier: 2, note: "one word", pron: "eye dee ate", s: "Let's {w} in the {w} session about how to {w} better.", r: "Thinking, but with a whiteboard and a budget." },
  { w: "circle back", tier: 2, note: "two words", s: "Let's {w} on the thing we already {w} on twice.", r: "A solemn promise to forget this conversation." },
  { w: "gravitas", tier: 2, note: "one word", pron: "grav ih tahss", s: "The candidate has real {w}, which is why he said nothing for an hour.", r: "Looking serious, billed at a premium." },
  { w: "aggregate", tier: 2, note: "one word — double g", s: "Let's {w} the data until it agrees with the slide.", r: "Adding things up until the answer is convenient." },
  { w: "facilitate", tier: 2, note: "one word", s: "I'll {w} the workshop, which means stand near a flip chart.", r: "To watch a meeting happen and take credit for it." },
  { w: "agnostic", tier: 2, note: "one word", s: "We're platform-{w}, channel-{w}, and frankly outcome-{w}.", r: "'I don't care, but professionally.'" },
  { w: "ubiquitous", tier: 2, note: "one word", pron: "yoo bik wih tuss", s: "Our brand will be {w}, starting with this one LinkedIn post.", r: "Everywhere, according to someone who's been to four cities." },
  { w: "cohort", tier: 2, note: "one word", s: "This {w} of users behaves exactly like the last {w} we ignored.", r: "A group of people flattened into a chart line." },
  { w: "escalate", tier: 2, note: "one word", s: "I'll {w} this to the person who will {w} it back to me.", r: "To pass a problem upward until it loops back down." },
  { w: "synergistic", tier: 2, note: "one word", s: "The merger is deeply {w}, mainly for the lawyers.", r: "Two bad ideas, holding hands." },
  { w: "granularity", tier: 2, note: "one word", s: "At this level of {w}, we have lost all contact with the point.", r: "Detail, multiplied until meaning escapes." },
  { w: "robust", tier: 2, note: "one word", s: "The system is {w}, said the engineer, not making eye contact.", r: "It hasn't fallen over yet, knock on wood." },

  // ---- TIER 3 — VP of Vibes ----
  { w: "consensus", tier: 3, note: "one word — one s in the middle", s: "We reached {w} that we need another meeting to reach {w}.", r: "The moment everyone is too tired to disagree." },
  { w: "liaise", tier: 3, note: "one word", pron: "lee ayz", s: "I'll {w} with the team to {w} with the other team.", r: "To email someone and call it strategy." },
  { w: "hierarchy", tier: 3, note: "one word", pron: "hy er ar kee", s: "We flattened the {w}, then ranked who flattened the {w}.", r: "The org chart's way of saying who you may not email." },
  { w: "accommodate", tier: 3, note: "one word — double c, double m", s: "We'll {w} your feedback by confirming we received your feedback.", r: "'Noted,' in a longer font." },
  { w: "due diligence", tier: 3, note: "two words", s: "After extensive {w}, we went entirely with our gut.", r: "Reading the thing you'd already decided to ignore." },
  { w: "low-hanging fruit", tier: 3, note: "two words, hyphenated", s: "Let's grab the {w} before anyone asks what the fruit is.", r: "The work nobody wanted to admit was easy." },
  { w: "reconcile", tier: 3, note: "one word", s: "We need to {w} two spreadsheets that have never once agreed.", r: "To force two numbers to apologise to each other." },
  { w: "discrepancy", tier: 3, note: "one word", pron: "diss krep un see", s: "There's a small {w} between the forecast and reality.", r: "The gap between the slide and the truth." },
  { w: "fiduciary", tier: 3, note: "one word", pron: "fih doo shee air ee", s: "As a {w} duty, we must protect the bonus pool at all costs.", r: "A legal reason to take it very seriously now." },
  { w: "procurement", tier: 3, note: "one word", s: "{w} approved the budget in only fourteen short weeks.", r: "The department where requests go to retire." },
  { w: "contingency", tier: 3, note: "one word", s: "Our {w} plan is to act surprised and form a committee.", r: "The backup plan you wrote so you could ignore it." },
  { w: "prerogative", tier: 3, note: "one word", pron: "pruh rog uh tiv", s: "It's the chief's {w} to change the strategy at 11pm.", r: "A right that only ever flows downhill." },
  { w: "parameter", tier: 3, note: "one word", pron: "puh ram uh ter", s: "That request is outside the {w} we invented this morning.", r: "An invisible fence, drawn after you've crossed it." },
  { w: "competency", tier: 3, note: "one word", s: "Spelling is a core {w} we no longer assess.", r: "A skill, reduced to a checkbox on a form." },
  { w: "sustainable", tier: 3, note: "one word", s: "The pace is totally {w}, said no one on the team, ever.", r: "Able to continue, allegedly, just not by you." },
  { w: "recalibrate", tier: 3, note: "one word", s: "Let's {w} the goals to match what already accidentally happened.", r: "To move the target until the arrow is a bullseye." },

  // ---- TIER 4 — Chief Buzzword Officer ----
  { w: "bureaucracy", tier: 4, note: "one word — the classic killer", pron: "byoo rok ruh see", s: "We formed a committee to reduce {w}.", r: "A form, requesting a form, to remove a form." },
  { w: "questionnaire", tier: 4, note: "one word — double n, ends -aire", pron: "kwes chun air", s: "Please complete this {w} about why you ignored the last {w}.", r: "A survey wearing a beret." },
  { w: "entrepreneurial", tier: 4, note: "one word", pron: "ahn truh pruh nur ee ul", s: "We want someone {w} who'll take bold risks within these 47 guidelines.", r: "Please do three jobs for the price of one." },
  { w: "supersede", tier: 4, note: "one word — ends -sede, not -cede", pron: "soo per seed", s: "We must {w} the old memo with this newer, equally ignored one.", r: "The only word that makes 'replace' sound humble." },
  { w: "liaison", tier: 4, note: "one word", pron: "lee ay zahn", s: "As your {w}, I will forward emails between people who could just meet.", r: "A human CC field." },
  { w: "conscientious", tier: 4, note: "one word", pron: "kon shee en shuss", s: "We need a {w} self-starter who also never questions anything.", r: "Careful, in a way that's hard to spell on purpose." },
  { w: "occurrence", tier: 4, note: "one word — double c, double r", pron: "uh kur unce", s: "This outage is a rare {w} we have now seen four times this week.", r: "A thing happening, described as if it shouldn't." },
  { w: "maintenance", tier: 4, note: "one word", pron: "main tuh nunce", s: "The {w} window is any moment the site decides to break.", r: "The reason it's down, always scheduled in hindsight." },
  { w: "privilege", tier: 4, note: "one word — no d", pron: "priv uh lij", s: "It's a real {w} to be on this unpaid 9pm call.", r: "A perk, redefined as an obligation you should thank them for." },
  { w: "acquisition", tier: 4, note: "one word", pron: "ak wih zish un", s: "The {w} was a perfect fit, culturally and on the press release.", r: "Buying a company to inherit its problems." },
  { w: "amortization", tier: 4, note: "one word — UK 'amortisation' also accepted", pron: "uh mor tih zay shun", s: "After {w}, the numbers finally looked the way finance wanted.", r: "Spreading a cost out until it stops hurting on paper." },
  { w: "disintermediation", tier: 4, note: "one word — the final boss", pron: "dis in ter mee dee ay shun", s: "Our whole thesis is {w}, a word we cannot say out loud.", r: "Cutting out the middleman, in fourteen extra syllables." },
  { w: "operationalize", tier: 4, note: "one word — UK 'operationalise' also accepted", pron: "op er ay shun uh lize", s: "We need to {w} the vision before someone asks what it means.", r: "To turn a noun into a verb and a verb into a meeting." },
  { w: "idiosyncratic", tier: 4, note: "one word", pron: "id ee oh sin krat ik", s: "His leadership style is {w}, which HR has flagged twice.", r: "Weird, but at a salary that makes it 'a style.'" },
  { w: "indispensable", tier: 4, note: "one word", pron: "in dih spen suh bul", s: "You're {w} to this team, said the email about the reorg.", r: "Essential, right up until the spreadsheet says otherwise." },
  { w: "entrepreneurship", tier: 4, note: "one word", pron: "ahn truh pruh nur ship", s: "We celebrate {w} by asking salaried staff to act like founders.", r: "Risk-taking, with someone else's risk." },
];
/* WORDS_END */

const TIMER_START = 20;
const MAX_LIVES = 3;

const norm = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
const canon = (s) => norm(s).replace(/ise\b/g, "ize").replace(/isation\b/g, "ization").replace(/yse\b/g, "yze");

// Rank speech voices so we default to the clearest English voice available on the device.
function rankVoice(v) {
  const n = (v.name || "").toLowerCase(), l = (v.lang || "").toLowerCase();
  let s = 0;
  if (l.startsWith("en")) s += 10;
  if (l === "en-us" || l === "en_us") s += 3; else if (l === "en-gb" || l === "en_gb") s += 2;
  if (/natural|neural|online/.test(n)) s += 6;
  if (/google/.test(n)) s += 5;
  if (/samantha|aria|jenny|guy|daniel|sonia|libby|emma|ava|allison|serena/.test(n)) s += 4;
  if (/microsoft/.test(n)) s += 2;
  if (/espeak|festival|pico|compact|e-speak|robot/.test(n)) s -= 8;
  return s;
}

function buildSequence() {
  const byTier = RANKS.map((_, t) => WORDS.filter((x) => x.tier === t));
  return byTier.flatMap((group) => {
    const a = [...group];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  });
}

function verdict(n, won) {
  if (won) return "You spelled every last one. The org chart has no more rungs.";
  if (n <= 2) return "You've been entered into a Performance Improvement Plan.";
  if (n <= 6) return "Adequate. You'll go far in middle management.";
  if (n <= 12) return "Genuinely impressive. HR is getting nervous.";
  if (n <= 20) return "You speak fluent corporate. We're a little frightened.";
  return "At this point, you ARE the deck.";
}

export default function JargonBee() {
  const [screen, setScreen] = useState("start");
  const [seq, setSeq] = useState([]);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [spelled, setSpelled] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answer, setAnswer] = useState("");
  const [time, setTime] = useState(TIMER_START);
  const [showNote, setShowNote] = useState(false);
  const [showSentence, setShowSentence] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [fb, setFb] = useState(null);
  const [won, setWon] = useState(false);
  const [killer, setKiller] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [speechOK, setSpeechOK] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [visitor] = useState(() => 40000 + Math.floor(Math.random() * 59999));

  const voiceRef = useRef(null);
  const inputRef = useRef(null);
  const tickRef = useRef(null);
  const acRef = useRef(null);
  const lastFirstRef = useRef(null);

  const current = seq[idx];
  const rankIdx = current ? current.tier : 0;
  // Speak the REAL word — modern voices pronounce these correctly; the picker handles voice quality.
  const speakOf = (x) => (x ? x.w : "");

  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=VT323&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href; document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setSpeechOK(false); return; }
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      if (!all.length) return;
      const en = all.filter((v) => /^en/i.test(v.lang)).sort((a, b) => rankVoice(b) - rankVoice(a));
      const list = en.length ? en : all;
      setVoices(list);
      setVoiceName((cur) => {
        const keep = cur && list.some((v) => v.name === cur);
        const name = keep ? cur : (list[0] && list[0].name) || "";
        voiceRef.current = list.find((v) => v.name === name) || list[0] || null;
        return name;
      });
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  useEffect(() => {
    if (!voiceName || typeof window === "undefined" || !window.speechSynthesis) return;
    const v = window.speechSynthesis.getVoices().find((x) => x.name === voiceName);
    if (v) voiceRef.current = v;
  }, [voiceName]);

  const say = useCallback((text, rate = 0.9) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = rate; u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const speakWord = useCallback(() => {
    if (!current) return;
    const url = audioUrl(current.w);
    if (url) {
      try {
        const a = new Audio(url);
        setSpeaking(true);
        a.onended = () => setSpeaking(false);
        a.onerror = () => { setSpeaking(false); say(current.w, 0.82); };
        a.play().catch(() => say(current.w, 0.82));
        return;
      } catch (e) { /* fall through to TTS */ }
    }
    say(current.w, 0.82);
  }, [current, say]);

  const tone = useCallback((kind) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!acRef.current) acRef.current = new Ctx();
      const ac = acRef.current;
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      const t = ac.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      if (kind === "correct") {
        o.type = "square";
        o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(990, t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.start(t); o.stop(t + 0.22);
      } else {
        o.type = "sawtooth";
        o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.2);
        g.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        o.start(t); o.stop(t + 0.3);
      }
    } catch (e) { /* no-op */ }
  }, []);

  useEffect(() => {
    if (screen !== "play" || menuOpen) return;
    tickRef.current = setInterval(() => {
      setTime((t) => { if (t <= 1) { clearInterval(tickRef.current); handleTimeout(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, idx, menuOpen]);

  useEffect(() => {
    if (screen === "play" && current && !menuOpen) {
      const t = setTimeout(() => { speakWord(); inputRef.current && inputRef.current.focus(); }, 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, idx]);

  function start() {
    let s = buildSequence();
    if (lastFirstRef.current && s.length > 1) {
      let guard = 0;
      while (s[0].w === lastFirstRef.current && guard < 12) { s = buildSequence(); guard++; }
      if (s[0].w === lastFirstRef.current) {
        const j = s.findIndex((x, i) => i > 0 && x.tier === 0 && x.w !== lastFirstRef.current);
        if (j > 0) { const tmp = s[0]; s[0] = s[j]; s[j] = tmp; }
      }
    }
    lastFirstRef.current = s[0].w;
    setSeq(s); setIdx(0); setLives(MAX_LIVES);
    setSpelled(0); setStreak(0); setBestStreak(0);
    setWon(false); setKiller(""); setMenuOpen(false); setShareMsg(""); resetRound();
    setScreen("play");
    tone("correct"); // primes audio on the click gesture (no spoken word here -> no overlap)
  }

  function resetRound() {
    setAnswer(""); setTime(TIMER_START);
    setShowNote(false); setShowSentence(false); setShowMeaning(false);
  }

  function toFeedback(kind) {
    clearInterval(tickRef.current);
    window.speechSynthesis && window.speechSynthesis.cancel();
    setSpeaking(false);
    const nx = seq[idx + 1];
    const promoted = (kind === "correct" && nx && nx.tier > current.tier) ? RANKS[nx.tier] : null;
    setFb({ kind, word: current.w, given: answer, roast: current.r, promoted });
    setScreen("feedback");
  }

  function submit() {
    if (screen !== "play" || menuOpen || !answer.trim()) return;
    if (canon(answer) === canon(current.w)) {
      const ns = streak + 1;
      setSpelled((x) => x + 1); setStreak(ns); setBestStreak((b) => Math.max(b, ns));
      tone("correct"); toFeedback("correct");
    } else {
      setLives((l) => l - 1); setStreak(0);
      if (lives - 1 <= 0) setKiller(current.w);
      tone("wrong"); toFeedback("wrong");
    }
  }

  function handleTimeout() {
    setLives((l) => l - 1); setStreak(0);
    if (lives - 1 <= 0) setKiller(current.w);
    tone("wrong"); toFeedback("timeout");
  }

  function next() {
    if (lives <= 0) { setWon(false); setScreen("over"); return; }
    if (idx + 1 >= seq.length) { setWon(true); setScreen("over"); return; }
    setIdx((i) => i + 1); resetRound(); setScreen("play");
  }

  function rankReached() {
    if (spelled === 0) return 0;
    const cleared = seq.slice(0, idx + (fb?.kind === "correct" ? 1 : 0)).map((x) => x.tier);
    return Math.max(0, ...cleared, 0);
  }
  const finalRank = () => (won ? WIN_RANK : RANKS[Math.min(rankReached(), RANKS.length - 1)]);

  function shareText() {
    const end = killer ? ` '${killer}' had me escorted out.` : "";
    return (
   `I made it to ${finalRank().title}.\n\n` +
`That means I spelled ${spelled} jargon terms before catastrophically failing at "${killer}".\n\n` +
`${verdict(spelled, won)}\n\n` +
`I'm now a cautionary tale. Prove you're smarter.\n\n` +
`→ Play: https://${SHARE_URL}`
    );
  }

  /* ---------- SHARE IMAGE (draw the JargonBee.exe result window onto a canvas) ---------- */
  function drawResult(canvas) {
    const W = 1080, H = 1080, ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    const sans = "Tahoma, Arial, sans-serif", serif = "Georgia, 'Times New Roman', serif", mono = "'Courier New', monospace";
    const bevel = (x, y, w, h, raised) => {
      ctx.lineWidth = 3;
      ctx.strokeStyle = raised ? "#ffffff" : "#808080";
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
      ctx.strokeStyle = raised ? "#0a0a0a" : "#ffffff";
      ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.stroke();
    };
    const fit = (text, weight, family, max, maxW) => {
      let s = max; ctx.font = `${weight} ${s}px ${family}`;
      while (ctx.measureText(text).width > maxW && s > 20) { s -= 2; ctx.font = `${weight} ${s}px ${family}`; }
      return s;
    };
    const wrap = (text, x, y, maxW, lh) => {
      const words = text.split(" "); let line = "", yy = y;
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
        else line = test;
      }
      if (line) ctx.fillText(line, x, yy);
      return yy;
    };

    // desktop
    ctx.fillStyle = "#008080"; ctx.fillRect(0, 0, W, H);
    // window
    const m = 70, wx = m, wy = m, ww = W - 2 * m, wh = H - 2 * m;
    ctx.fillStyle = "#c0c0c0"; ctx.fillRect(wx, wy, ww, wh);
    bevel(wx, wy, ww, wh, true); bevel(wx + 3, wy + 3, ww - 6, wh - 6, true);
    // title bar
    const tb = 70;
    const grad = ctx.createLinearGradient(wx, 0, wx + ww, 0);
    grad.addColorStop(0, "#000080"); grad.addColorStop(1, "#1084d0");
    ctx.fillStyle = grad; ctx.fillRect(wx + 6, wy + 6, ww - 12, tb);
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.font = `bold 30px ${sans}`;
    ctx.fillText("JargonBee.exe — Assessment Result", wx + 24, wy + 6 + tb / 2);
    // window buttons
    ["_", "□", "✕"].forEach((sym, i) => {
      const bw = 40, bh = 34, bx = wx + ww - 18 - (3 - i) * (bw + 6), by = wy + 6 + (tb - bh) / 2;
      ctx.fillStyle = "#c0c0c0"; ctx.fillRect(bx, by, bw, bh); bevel(bx, by, bw, bh, true);
      ctx.fillStyle = "#000"; ctx.font = `bold 20px ${sans}`; ctx.textAlign = "center";
      ctx.fillText(sym, bx + bw / 2, by + bh / 2 + 1); ctx.textAlign = "left";
    });

    // certificate panel
    const cx = wx + 34, cy = wy + 6 + tb + 28, cw = ww - 68, ch = wh - (6 + tb + 28) - 40;
    ctx.fillStyle = "#fffdf3"; ctx.fillRect(cx, cy, cw, ch);
    ctx.strokeStyle = "#808000"; ctx.lineWidth = 4;
    ctx.strokeRect(cx + 6, cy + 6, cw - 12, ch - 12);
    ctx.strokeRect(cx + 13, cy + 13, cw - 26, ch - 26);

    const midx = cx + cw / 2; const r = finalRank();
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#000";
    let y = cy + 96;
    ctx.font = `64px ${sans}`; ctx.fillText(won ? "🏆" : "📜", midx, y); y += 64;

    ctx.fillStyle = "#808000"; ctx.font = `bold 26px ${sans}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
    ctx.fillText((won ? "ASSESSMENT COMPLETE" : "ASSESSMENT TERMINATED"), midx, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    y += 80;

    ctx.fillStyle = "#000";
    const rs = fit(r.title, "bold", serif, 70, cw - 90);
    ctx.font = `bold ${rs}px ${serif}`; ctx.fillText(r.title, midx, y); y += 50;

    ctx.fillStyle = "#555"; ctx.font = `26px ${sans}`;
    y = wrap(r.quip, midx, y, cw - 120, 34) + 70;

    // numbers
    ctx.fillStyle = "#000"; ctx.font = `bold 64px ${mono}`;
    ctx.fillText(String(spelled), midx - 150, y);
    ctx.fillText(String(bestStreak), midx + 150, y);
    ctx.fillStyle = "#555"; ctx.font = `bold 20px ${sans}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
    ctx.fillText("SPELLED", midx - 150, y + 34);
    ctx.fillText("BEST STREAK", midx + 150, y + 34);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    y += 96;

    ctx.fillStyle = "#000"; ctx.font = `italic 30px ${serif}`;
    y = wrap(verdict(spelled, won), midx, y, cw - 130, 40);
    if (killer && !won) { y += 44; ctx.fillStyle = "#c00000"; ctx.font = `26px ${serif}`; ctx.fillText("Felled by \u201C" + killer + "\u201D.", midx, y); }

    // footer CTA — inside the certificate, well clear of the border
    ctx.fillStyle = "#000080"; ctx.textAlign = "center";
    const cta = SHARE_URL ? ("JargonBee  —  play at " + SHARE_URL) : "JargonBee  —  can you out-jargon me?";
    const cs = fit(cta, "bold", sans, 30, cw - 130);
    ctx.font = `bold ${cs}px ${sans}`;
    ctx.fillText(cta, midx, cy + ch - 48);
    ctx.textAlign = "left";
  }

  async function shareImage() {
    try {
      const c = document.createElement("canvas"); drawResult(c);
      const blob = await new Promise((res) => c.toBlob(res, "image/png"));
      const file = new File([blob], "jargonbee-result.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "JargonBee", text: shareText() });
        setShareMsg("");
      } else {
        downloadImage();
        setShareMsg("Your browser can't post directly — saved the image instead, ready to upload.");
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
      downloadImage();
    }
  }

  function downloadImage() {
    try {
      const c = document.createElement("canvas"); drawResult(c);
      const url = c.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url; a.download = "jargonbee-result.png";
      document.body.appendChild(a); a.click(); a.remove();
      setShareMsg("Saved as jargonbee-result.png — post it anywhere.");
      setTimeout(() => setShareMsg(""), 3500);
    } catch (e) { setShareMsg("Couldn't generate the image in this browser."); }
  }

  function copyText() {
    const text = shareText();
    const ok = () => { setShareMsg("Result text copied."); setTimeout(() => setShareMsg(""), 2500); };
    try {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, ok);
      else ok();
    } catch (e) { ok(); }
  }

  function renderSentence(tmpl) {
    const parts = tmpl.split("{w}");
    return parts.map((p, i) => (
      <React.Fragment key={i}>{p}{i < parts.length - 1 && <span className="redact">█ REDACTED █</span>}</React.Fragment>
    ));
  }

  function onClose() { setMenuOpen(true); }

  const css = `
  .jb98{
    --teal:#008080; --face:#c0c0c0; --hi:#ffffff; --lo:#808080; --dk:#0a0a0a; --soft:#dfdfdf;
    --navy:#000080; --navy2:#1084d0; --link:#0000ee; --vis:#551a8b; --red:#c00000; --grn:#008000;
    font-family:Tahoma,'MS Sans Serif',Geneva,Verdana,sans-serif; color:#000;
    background:var(--teal); min-height:100vh; width:100%; box-sizing:border-box;
    display:flex; flex-direction:column; align-items:center; padding:18px 12px 28px;
  }
  .jb98 *{box-sizing:border-box;}
  .serif{font-family:'Times New Roman',Times,serif;}
  .led{font-family:'VT323',Courier,monospace;}
  .raise{box-shadow:inset -1px -1px 0 var(--dk),inset 1px 1px 0 var(--hi),inset -2px -2px 0 var(--lo),inset 2px 2px 0 var(--soft);}
  .sink{box-shadow:inset -1px -1px 0 var(--hi),inset 1px 1px 0 var(--dk),inset -2px -2px 0 var(--soft),inset 2px 2px 0 var(--lo);}

  .window{width:100%;max-width:720px;background:var(--face);padding:3px;}
  .titlebar{background:linear-gradient(90deg,var(--navy),var(--navy2));color:#fff;display:flex;
    align-items:center;justify-content:space-between;padding:4px 4px 4px 8px;}
  .titlebar .t{display:flex;align-items:center;gap:8px;font-weight:bold;font-size:14px;}
  .titlebtns{display:flex;gap:3px;}
  .tbtn{width:20px;height:18px;background:var(--face);border:none;font-size:11px;font-weight:bold;line-height:1;
    display:flex;align-items:center;justify-content:center;cursor:pointer;color:#000;padding:0;}
  .menubar{display:flex;gap:14px;padding:3px 8px;font-size:13px;}
  .menubar span{cursor:default;}.menubar u{cursor:pointer;}
  .marquee{margin:3px;overflow:hidden;white-space:nowrap;background:#000;color:#0f0;padding:3px 0;font-size:14px;}
  .marquee b{display:inline-block;padding-left:100%;animation:scroll 22s linear infinite;font-weight:normal;}
  @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-100%)}}

  .body{margin:3px;background:var(--face);padding:18px 18px 20px;}

  .wordart{font-family:Impact,'Arial Black',Haettenschweiler,sans-serif;font-style:italic;font-weight:900;
    font-size:56px;line-height:1.05;letter-spacing:1px;transform:skewX(-7deg);margin:6px 0 4px;display:inline-block;
    color:#f2b417;-webkit-text-stroke:2px #000;text-shadow:5px 5px 0 #808080;}
  .tagline{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#000080;font-weight:bold;margin:8px 0 0;}
  .lede{font-size:17px;line-height:1.5;margin:16px 0 0;}
  .lede b{background:#ffff66;}
  .hr{height:0;border:none;border-top:2px groove #fff;margin:18px 0;}
  .construction{display:inline-block;margin:6px 0 0;padding:5px;font-weight:bold;font-size:12px;color:#000;
    background:repeating-linear-gradient(45deg,#ffd400 0 12px,#000 12px 24px);}
  .construction span{background:#ffd400;padding:3px 8px;}

  .btn{font-family:Tahoma,Verdana,sans-serif;background:var(--face);border:none;cursor:pointer;padding:12px 18px;
    font-size:15px;font-weight:bold;color:#000;}
  .btn:active{padding:13px 17px 11px 19px;}
  .btn.big{font-size:22px;padding:16px 26px;width:100%;}
  .btn.big:active{padding:17px 25px 15px 27px;}
  .link{color:var(--link);text-decoration:underline;cursor:pointer;background:none;border:none;font-family:inherit;font-size:14px;padding:0;}
  .fine{font-size:12.5px;color:#222;margin-top:14px;line-height:1.5;}
  .counter{display:inline-flex;align-items:center;gap:8px;margin-top:14px;font-size:13px;}
  .counter .led{background:#000;color:#0f0;padding:2px 8px;font-size:20px;letter-spacing:3px;}
  .voicebar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;font-size:13px;font-weight:bold;}
  .voicebar select{font-family:Tahoma,sans-serif;font-size:13px;font-weight:normal;padding:5px 28px 5px 8px;background:#fff;border:none;flex:1;min-width:150px;max-width:300px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;}

  .hud{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:8px 10px;margin-bottom:12px;}
  .tag{padding:5px 10px;font-size:13px;font-weight:bold;}
  .tag b{color:#000080;}
  .lives{font-family:'Courier New',monospace;font-size:20px;letter-spacing:2px;}
  .lives .on{color:#c00000;}.lives .off{color:#808080;}
  .progress{height:24px;margin-bottom:18px;padding:3px;background:var(--face);}
  .pfill{height:100%;background:repeating-linear-gradient(90deg,#000080 0 14px,transparent 14px 18px);transition:width 1s linear;}
  .pfill.low{background:repeating-linear-gradient(90deg,#c00000 0 14px,transparent 14px 18px);}

  .hear{width:100%;padding:22px;font-size:22px;font-weight:bold;cursor:pointer;background:var(--face);border:none;
    display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;}
  .hear:active{padding:23px 21px 21px 23px;}
  .hear.on{animation:flash .8s steps(2) infinite;}
  @keyframes flash{50%{background:#d8d8d8;}}
  .hint{text-align:center;font-size:13px;color:#222;margin-bottom:16px;}
  .hint .clock{font-family:'Courier New',monospace;font-weight:bold;}

  .qrow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
  .qbtn{font-family:Tahoma,Verdana,sans-serif;background:var(--face);border:none;cursor:pointer;padding:12px;font-size:13.5px;text-align:left;color:#000;}
  .qbtn:active{padding:13px 11px 11px 13px;}

  .reveal{margin:0 0 14px;padding:13px 15px 14px;background:#fff;font-size:15px;line-height:1.55;overflow-wrap:anywhere;}
  .reveal .cap{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#000080;font-weight:bold;margin-bottom:6px;font-family:Tahoma,sans-serif;}
  .reveal.serif{font-family:'Times New Roman',serif;font-size:16px;}
  .redact{display:inline-block;background:#000;color:#000;font-family:'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:1px;padding:1px 6px;user-select:none;}
  .redact::selection{background:#000;color:#000;}

  .answer{display:flex;gap:10px;align-items:stretch;}
  .answer input{flex:1;min-width:0;font-family:'Courier New',monospace;font-size:22px;padding:12px;border:none;background:#fff;color:#000;outline:none;}
  .answer .go{background:var(--face);border:none;cursor:pointer;padding:0 20px;font-size:18px;font-weight:bold;}
  .answer .go:active{padding:2px 19px 0 21px;}

  .msg{background:#fff;padding:20px 18px;text-align:center;}
  .msg .icon{font-size:40px;line-height:1;}
  .msg .stamp{font-family:'Courier New',monospace;font-weight:bold;font-size:16px;letter-spacing:2px;margin-top:6px;display:inline-block;padding:4px 12px;}
  .msg .stamp.ok{color:#008000;border:2px solid #008000;}
  .msg .stamp.no{color:#c00000;border:2px solid #c00000;}
  .msg .word{font-family:'Courier New',monospace;font-size:30px;font-weight:bold;margin:14px 0 2px;}
  .msg .given{font-size:13px;color:#444;}.msg .given s{color:#c00000;}
  .msg .roast{font-family:'Times New Roman',serif;font-size:18px;font-style:italic;margin:14px auto 0;max-width:380px;line-height:1.5;}
  .promo{margin:16px auto 0;max-width:400px;background:#000080;color:#fff;padding:10px 14px;font-size:14px;}
  .promo b{color:#ffe07a;}.promo small{display:block;color:#c9d4ff;margin-top:3px;}

  .cert{background:#fffdf3;padding:22px 18px;text-align:center;border:3px double #808000;}
  .cert .seal{font-size:36px;}
  .cert .ribbon{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#808000;font-weight:bold;margin-top:4px;}
  .cert .rank{font-family:'Times New Roman',serif;font-size:30px;font-weight:bold;margin:8px 0 2px;}
  .cert .quip{font-size:13px;color:#555;}
  .cert .nums{display:flex;justify-content:center;gap:30px;margin:18px 0 4px;}
  .cert .nums b{font-family:'Courier New',monospace;font-size:30px;display:block;}
  .cert .nums span{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#555;display:block;margin-top:2px;}
  .cert .vd{font-family:'Times New Roman',serif;font-size:17px;font-style:italic;max-width:360px;margin:14px auto 0;line-height:1.5;}
  .cert .killed{color:#c00000;font-size:13px;margin-top:8px;}

  .sharewrap{margin-top:14px;}
  .sharewrap .lbl{font-size:12.5px;font-weight:bold;color:#000080;margin-bottom:8px;text-align:center;}
  .sharerow{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .overrow{margin-top:10px;}
  .sharemsg{font-size:12.5px;color:#008000;font-weight:bold;text-align:center;margin-top:10px;}
  .moretext{text-align:center;margin-top:10px;}

  .status{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:3px;padding:4px 8px;font-size:12px;}
  .status .cell{padding:3px 8px;}
  .status .resign{background:var(--face);border:none;cursor:pointer;padding:5px 12px;font-size:12px;font-weight:bold;font-family:Tahoma,sans-serif;}
  .status .resign:active{padding:6px 11px 4px 13px;}

  .backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:16px;z-index:50;}
  .dialog{width:100%;max-width:400px;background:var(--face);padding:3px;}
  .dialog .titlebar{font-size:13px;}
  .dialog .dbody{margin:3px;background:var(--face);padding:18px;text-align:center;}
  .dialog .dbody .ico{font-size:32px;}
  .dialog .dbody p{font-size:14.5px;line-height:1.5;margin:10px 0 0;}
  .dialog .dbtns{display:flex;flex-direction:column;gap:8px;margin-top:18px;}
  .dialog .dbtns .btn{width:100%;font-size:14px;padding:11px 14px;}
  .dialog .dbtns small{display:block;font-weight:normal;font-size:11px;color:#333;margin-top:1px;}

  .webfoot{max-width:720px;margin-top:14px;text-align:center;color:#cfe9e9;font-size:12px;line-height:1.7;}
  .webfoot a{color:#bfe;text-decoration:underline;cursor:pointer;}
  .webfoot .ring{color:#fff;}

  @media (max-width:480px){
    .wordart{font-size:40px;} .body{padding:16px;} .qrow{grid-template-columns:1fr;}
    .sharerow{grid-template-columns:1fr;} .lede{font-size:16px;}
  }
  `;

  const marqueeOn = screen === "start" || screen === "over";

  return (
    <div className="jb98">
      <style>{css}</style>

      <div className="window raise">
        <div className="titlebar">
          <div className="t"><span>🐝</span> JargonBee.exe — Corporate Vocabulary Assessment</div>
          <div className="titlebtns">
            <button className="tbtn raise" title="minimize">_</button>
            <button className="tbtn raise" title="maximize">□</button>
            <button className="tbtn raise" title="close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="menubar">
          <span><u>F</u>ile</span><span><u>E</u>dit</span>
          <span onClick={() => screen === "play" && setMenuOpen(true)}><u>C</u>areer</span>
          <span><u>H</u>elp</span>
        </div>

        {marqueeOn && (
          <div className="marquee">
            <b>★ W E L C O M E ★ JargonBee is the web's #1 Corporate Vocabulary Proficiency Assessment ★ 86 certified buzzwords ★ please sign the guestbook ★ best viewed in Netscape Navigator 4.0 at 800×600 ★ no refunds ★&nbsp;&nbsp;&nbsp;</b>
          </div>
        )}

        <div className="body">

          {screen === "start" && (
            <div>
              <div className="wordart">JargonBee</div>
              <div className="tagline">Corporate Vocabulary Proficiency Assessment</div>
              <p className="lede serif">You use these words every day. <b>Let's see you spell one.</b></p>
              <p className="lede serif">
                A buzzword is read aloud — you never see it. Type it before the clock runs out.
                Three misses and security walks you to the lobby. Survive, and you'll climb from
                Unpaid Intern all the way to Chief Buzzword Officer.
              </p>
              <hr className="hr" />
              <button className="btn big raise" onClick={start}>▶ &nbsp;BEGIN THE ASSESSMENT</button>
              {speechOK && voices.length > 0 && (
                <div className="voicebar">
                  <span>🔊 Reader voice:</span>
                  <select className="sink" value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
                    {voices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                  </select>
                  <button className="link" onClick={() => say("ubiquitous", 0.8)}>▶ test</button>
                </div>
              )}
              <p className="fine">If a word sounds off, switch the reader voice above — pronunciation quality varies a lot by device.</p>
              <div><div className="construction"><span>🚧 YOUR CAREER IS UNDER CONSTRUCTION 🚧</span></div></div>
              <p className="fine">
                Autocorrect is disabled in the answer box — you're on your own.
                {!speechOK && " (No speech support in this browser, so the word is shown instead.)"}
              </p>
              <div className="counter"><span>You are employee&nbsp;#</span><span className="led">{String(visitor).padStart(6, "0")}</span></div>
            </div>
          )}

          {screen === "play" && current && (
            <div>
              <div className="hud">
                <span className="tag sink"><b>RANK:</b> {RANKS[rankIdx].title}</span>
                <span className="tag sink"><b>SPELLED:</b> {spelled}</span>
                <span className="tag sink">
                  <span className="lives">
                    {Array.from({ length: MAX_LIVES }).map((_, i) => (<span key={i} className={i < lives ? "on" : "off"}>♥</span>))}
                  </span>
                </span>
              </div>

              <div className="progress sink">
                <div className={"pfill" + (time <= 5 ? " low" : "")} style={{ width: `${(time / TIMER_START) * 100}%` }} />
              </div>

              <button className={"hear raise" + (speaking ? " on" : "")} onClick={speakWord}>🔊 HEAR THE WORD</button>
              <div className="hint">Tap to replay · <span className="clock">{time}s</span> remaining</div>

              <div className="qrow">
                <button className="qbtn raise" onClick={() => { setShowSentence(true); say(current.s.split("{w}").join(speakOf(current)), 0.96); }}>💬 Use it in a sentence</button>
                <button className="qbtn raise" onClick={() => setShowMeaning(true)}>📖 What does it even mean?</button>
                <button className="qbtn raise" onClick={speakWord}>🔁 Say it again</button>
                <button className="qbtn raise" onClick={() => setShowNote(true)}>#️⃣ One word or two?</button>
              </div>

              {showSentence && <div className="reveal sink"><span className="cap">In a sentence</span>{renderSentence(current.s)}</div>}
              {showMeaning && <div className="reveal sink serif"><span className="cap">What it really means</span>{current.r}</div>}
              {showNote && (
                <div className="reveal sink"><span className="cap">Format</span>{current.note}
                  {!speechOK && <><br /><b>The word is:</b> {current.w}</>}
                </div>
              )}

              <div className="answer">
                <input ref={inputRef} value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="sink" placeholder="spell it…"
                  autoCorrect="off" autoCapitalize="off" autoComplete="off" spellCheck={false} />
                <button className="go raise" onClick={submit}>↵</button>
              </div>
            </div>
          )}

          {screen === "feedback" && fb && (
            <div className="msg sink">
              <div className="icon">{fb.kind === "correct" ? "✅" : fb.kind === "timeout" ? "⏰" : "❌"}</div>
              <div className={"stamp " + (fb.kind === "correct" ? "ok" : "no")}>
                {fb.kind === "correct" ? "APPROVED" : fb.kind === "timeout" ? "TIME'S UP" : "REJECTED"}
              </div>
              <div className="word">{fb.word}</div>
              {fb.kind === "wrong" && <div className="given">you typed <s>{fb.given}</s></div>}
              {fb.kind === "timeout" && <div className="given">no answer submitted</div>}
              <div className="roast">“{fb.roast}”</div>
              {fb.promoted && (<div className="promo raise">▲ Promoted to <b>{fb.promoted.title}</b><small>{fb.promoted.quip}</small></div>)}
              <div style={{ marginTop: 20 }}>
                <button className="btn big raise" onClick={next}>
                  {lives <= 0 ? "SEE YOUR RESULTS ►" : idx + 1 >= seq.length ? "COLLECT YOUR TITLE ►" : "NEXT WORD ►"}
                </button>
              </div>
            </div>
          )}

          {screen === "over" && (
            <div>
              <div className="cert">
                <div className="seal">{won ? "🏆" : "📜"}</div>
                <div className="ribbon">{won ? "Assessment complete" : "Assessment terminated"}</div>
                <div className="rank">{finalRank().title}</div>
                <div className="quip">{finalRank().quip}</div>
                <div className="nums">
                  <div><b>{spelled}</b><span>Spelled</span></div>
                  <div><b>{bestStreak}</b><span>Best streak</span></div>
                </div>
                <p className="vd">{verdict(spelled, won)}</p>
                {killer && !won && <p className="killed">Felled by “{killer}”.</p>}
              </div>

              <div className="sharewrap">
                <div className="lbl">📸 Save or share your result as a JargonBee.exe window</div>
                <div className="sharerow">
                  <button className="btn raise" onClick={shareImage}>📤 SHARE IMAGE</button>
                  <button className="btn raise" onClick={downloadImage}>📥 SAVE AS PNG</button>
                </div>
                <div className="overrow">
                  <button className="btn big raise" onClick={start}>↻ TAKE IT AGAIN</button>
                </div>
                {shareMsg && <div className="sharemsg">{shareMsg}</div>}
                <div className="moretext"><button className="link" onClick={copyText}>or copy the result as text</button></div>
              </div>
              <p className="fine" style={{ textAlign: "center" }}>This credential is non-transferable and means absolutely nothing.</p>
            </div>
          )}
        </div>

        <div className="status">
          <span className="cell sink">{screen === "play" ? "Assessment in progress…" : screen === "over" ? "Session ended." : "Ready."}</span>
          {screen === "play"
            ? <button className="resign" onClick={() => setMenuOpen(true)}>✖ Resign</button>
            : <span className="cell sink led" style={{ fontSize: 15 }}>v4.0 · 1996</span>}
        </div>
      </div>

      <div className="webfoot">
        <span className="ring">‹ <a onClick={(e) => e.preventDefault()}>prev</a> · <a onClick={(e) => e.preventDefault()}>random</a> · <a onClick={(e) => e.preventDefault()}>next</a> ›</span>
        <br />© 1996–2026 JargonBee Industries · vibe-coded by <a href="https://www.linkedin.com/in/tusharbangera/" target="_blank" rel="noopener noreferrer">Tushar</a> in <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">Claude</a> · <a onClick={(e) => { e.preventDefault(); setGuestOpen(true); }}>✉ sign the guestbook</a>
      </div>

      {menuOpen && (
        <div className="backdrop" onClick={() => setMenuOpen(false)}>
          <div className="dialog raise" onClick={(e) => e.stopPropagation()}>
            <div className="titlebar">
              <div className="t"><span>⚠️</span> {screen === "play" ? "Resignation.exe" : "Access Denied"}</div>
              <div className="titlebtns"><button className="tbtn raise" onClick={() => setMenuOpen(false)}>✕</button></div>
            </div>
            <div className="dbody">
              {screen === "play" ? (
                <>
                  <div className="ico">🚪</div>
                  <p>Leaving so soon? Your stapler will be devastated.</p>
                  <div className="dbtns">
                    <button className="btn raise" onClick={() => setMenuOpen(false)}>↩ Back to work<small>keep your current run going</small></button>
                    <button className="btn raise" onClick={start}>⟳ Request a transfer<small>restart from Unpaid Intern</small></button>
                    <button className="btn raise" onClick={() => { setMenuOpen(false); setScreen("start"); }}>🚪 Tender your resignation<small>quit to the front desk</small></button>
                  </div>
                </>
              ) : (
                <>
                  <div className="ico">🔒</div>
                  <p>There is no closing the assessment. Corporate is forever.</p>
                  <div className="dbtns"><button className="btn raise" onClick={() => setMenuOpen(false)}>OK, fine</button></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {guestOpen && (
        <div className="backdrop" onClick={() => setGuestOpen(false)}>
          <div className="dialog raise" onClick={(e) => e.stopPropagation()}>
            <div className="titlebar">
              <div className="t"><span>✉️</span> guestbook.txt — Notepad</div>
              <div className="titlebtns"><button className="tbtn raise" onClick={() => setGuestOpen(false)}>✕</button></div>
            </div>
            <div className="dbody">
              <div className="ico">📖</div>
              <p>The guestbook has been full since 1999.</p>
              <p style={{ fontSize: 13, color: "#444" }}>But you can still make JargonBee famous — share your result, or send it to the colleague who says "synergy" the most.</p>
              <div className="dbtns"><button className="btn raise" onClick={() => setGuestOpen(false)}>Aw, OK</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"""
JargonBee — audio generator
=============================
Browser voices (like "Microsoft Hazel") mispronounce words and differ on every
device, so the only way to GUARANTEE correct, identical pronunciation for every
visitor is to ship a pre-recorded clip per word and play those instead.

This makes 86 mp3 files with Google's TTS (the same engine Google Translate uses
to read words aloud — it pronounces these correctly, including 'optimize',
'ideate', 'liaison', etc.).

USAGE
-----
1) pip install gtts
2) python generate_audio.py
3) Upload the resulting ./audio folder with your site (e.g. Vercel /public/audio)
4) In JargonBee.jsx set:  const AUDIO_BASE = "/audio";
   The game will now play /audio/optimize.mp3, /audio/low-hanging-fruit.mp3, etc.
   and ignore the device's built-in voice entirely.

Accent: tld="com" = US English, tld="co.uk" = British. Change one line below.
For an even higher-quality voice, swap gTTS for Amazon Polly / Google Cloud TTS /
ElevenLabs — the filename scheme (slug + ".mp3") is all the game needs.
"""

import os
import re

try:
    from gtts import gTTS
except ImportError:
    raise SystemExit("Run:  pip install gtts")

WORDS = [
    # Tier 0
    "pivot", "synergy", "agile", "scalable", "bandwidth", "proactive", "optimize",
    "onboarding", "mindset", "workflow", "rollout", "headcount", "touchpoint",
    "upskill", "takeaway", "ballpark", "buzzword", "runway", "blocker", "sprint",
    # Tier 1
    "leverage", "holistic", "granular", "cadence", "streamline", "deliverable",
    "actionable", "bottleneck", "benchmark", "stakeholder", "throughput",
    "ecosystem", "iterate", "framework", "momentum", "disruptive", "frictionless",
    "calibrate",
    # Tier 2
    "paradigm", "rapport", "nuanced", "bespoke", "ideate", "circle back",
    "gravitas", "aggregate", "facilitate", "agnostic", "ubiquitous", "cohort",
    "escalate", "synergistic", "granularity", "robust",
    # Tier 3
    "consensus", "liaise", "hierarchy", "accommodate", "due diligence",
    "low-hanging fruit", "reconcile", "discrepancy", "fiduciary", "procurement",
    "contingency", "prerogative", "parameter", "competency", "sustainable",
    "recalibrate",
    # Tier 4
    "bureaucracy", "questionnaire", "entrepreneurial", "supersede", "liaison",
    "conscientious", "occurrence", "maintenance", "privilege", "acquisition",
    "amortization", "disintermediation", "operationalize", "idiosyncratic",
    "indispensable", "entrepreneurship",
]

TLD = "com"  # "com" = US accent, "co.uk" = British accent
OUT = "audio"


def slug(w):
    return re.sub(r"-+$", "", re.sub(r"^-+", "", re.sub(r"[^a-z]+", "-", w.lower())))


def main():
    os.makedirs(OUT, exist_ok=True)
    assert len(WORDS) == len(set(WORDS)), "duplicate word in list"
    for i, w in enumerate(WORDS, 1):
        path = os.path.join(OUT, slug(w) + ".mp3")
        gTTS(text=w, lang="en", tld=TLD).save(path)
        print(f"[{i:02d}/{len(WORDS)}] {w:<20} -> {path}")
    print(f"\nDone. {len(WORDS)} clips in ./{OUT}/")
    print('Now set  const AUDIO_BASE = "/audio";  in JargonBee.jsx')


if __name__ == "__main__":
    main()

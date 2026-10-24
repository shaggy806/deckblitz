import { defineCard } from "../define.js";

// EDHREC rank 8417. Megamorph (rule 702.37b): the +1/+1 counter only when it's
// turned up for its megamorph cost; the trigger however it's turned face up.
const UP_TEXT = "When this creature is turned face up, counter target instant or sorcery spell.";

export default defineCard({
  name: "Stratus Dancer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  morph: { keyword: "megamorph", cost: "{1}{U}" },
  text: `Flying\nMegamorph {1}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});

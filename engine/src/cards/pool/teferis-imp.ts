import { defineCard } from "../define.js";

// A phase-out trigger looks back in time (rule 603.10b): the Imp, phased out
// by then, still sees itself go. Its controller is who had it as it went.
const OUT_TEXT = "Whenever this creature phases out, discard a card.";
const IN_TEXT = "Whenever this creature phases in, draw a card.";

export default defineCard({
  name: "Teferi's Imp",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "phasing"],
  text: `Flying\nPhasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)\n${OUT_TEXT}\n${IN_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "phases-out", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "you", amount: 1 },
      resolve: null,
      text: OUT_TEXT,
    },
    {
      trigger: { on: "event", event: "phases-in", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: IN_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 14564.
//
// Phasing is the keyword (the untap step's phasing, rule 502.1); the upkeep
// trigger phases out every land its controller controls as it resolves
// (Teferi's Protection's `phase-out` by filter), and they phase in at that
// player's next untap step (rule 702.26b).

const TRIGGER_TEXT = "At the beginning of your upkeep, all lands you control phase out.";

export default defineCard({
  name: "Taniwha",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 7,
  toughness: 7,
  keywords: ["trample", "phasing"],
  text: `Trample\nPhasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)\n${TRIGGER_TEXT} (They phase in before you untap during your next untap step.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "phase-out", filter: { type: "land", controlledBy: "you" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

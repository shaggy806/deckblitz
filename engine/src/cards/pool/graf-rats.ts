import { defineCard } from "../define.js";

// A meld card (rule 712.4): it and Midnight Scavengers meld into Chittering
// Host. The trigger's "if" is an intervening if (rule 603.4), asked as it
// triggers and again as it resolves; the `meld` effect makes the same test
// before it exiles anything.
const MELD_TEXT =
  "At the beginning of combat on your turn, if you both own and control this creature and a creature named Midnight Scavengers, exile them, then meld them into Chittering Host.";

export default defineCard({
  name: "Graf Rats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 1,
  text: MELD_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "meld-ready", partner: { name: "Midnight Scavengers", type: "creature" } },
      targets: [],
      effect: { kind: "meld", partner: { name: "Midnight Scavengers", type: "creature" }, into: "Chittering Host" },
      resolve: null,
      text: MELD_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). EDHREC rank 27525. "Activate only if you've
// discarded a card this turn": the turn history's `discarded` list.

const TEXT = "{1}, {T}, Pay 1 life: Draw a card. Activate only if you've discarded a card this turn.";

export default defineCard({
  name: "Gilt-Blade Prowler",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, payLife: 1 },
      condition: { kind: "turn-history", what: "discarded" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

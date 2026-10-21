import { defineCard } from "../define.js";

// EDHREC rank 14798. Ikoria: Lair of Behemoths.
//
// The cycle trigger goes on the stack above the cycling ability, so it
// resolves before the draw (the rulings), and is separate from it: cycling is
// fine with no creature to target.
const TRIGGER_TEXT = "When you cycle this card, put a flying counter on target creature you control.";

export default defineCard({
  name: "Avian Oddity",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  cycling: { cost: "{2}{U}" },
  text: `Flying\nCycling {2}{U} ({2}{U}, Discard this card: Draw a card.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

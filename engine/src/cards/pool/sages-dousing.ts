import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] If you control a Wizard, you draw a card regardless of whether the targeted spell
//     was countered or {3} was paid.

export default defineCard({
  name: "Sage's Dousing",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["kindred", "instant"],
  subtypes: ["Wizard"],
  text: "Counter target spell unless its controller pays {3}. If you control a Wizard, draw a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});

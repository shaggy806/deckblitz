import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 30568. Undo's shape, with cycling.
//
// Rulings:
//   [2008-10-01] Cycling is an activated ability. Effects that interact with activated abilities
//     (such as Stifle or Rings of Brighthearth) will interact with cycling. Effects that interact
//     with spells (such as Remove Soul or Faerie Tauntings) will not.

export default defineCard({
  name: "Essence Fracture",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  cycling: { cost: "{2}{U}" },
  text: "Return two target creatures to their owners' hands.\nCycling {2}{U} ({2}{U}, Discard this card: Draw a card.)",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});

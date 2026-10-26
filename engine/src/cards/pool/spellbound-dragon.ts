import { defineCard } from "../define.js";

// EDHREC rank 21052.
//
// Rulings:
//   [2009-05-01] You'll discard a card even if some other effect replaces the draw.
const ATTACK_TEXT =
  "Whenever this creature attacks, draw a card, then discard a card. This creature gets +X/+0 until end of turn, where X is the discarded card's mana value.";

export default defineCard({
  name: "Spellbound Dragon",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "modify-pt",
            target: "source",
            power: { thisWay: "discarded", sumOf: "mana-value" },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

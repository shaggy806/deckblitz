import { defineCard } from "../define.js";

// EDHREC rank 12222.
//
// Rulings:
//   [2024-06-07] The number of cards you discard is equal to Horrid Shadowspinner's power at the
//     time you chose to draw cards, even if another effect changed the number of cards you drew or
//     in the unusual case where Horrid Shadowspinner's power has changed since you chose to draw
//     cards.
//
// Hordewing Skaab's shape: "if you do" is saying yes to the draw, and the
// discard is the creature's power again — not the cards drawn (a replaced draw
// still discards that many), read as it last existed if it has left.
const ATTACK_TEXT =
  "Whenever this creature attacks, you may draw cards equal to its power. If you do, discard that many cards.";

export default defineCard({
  name: "Horrid Shadowspinner",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw cards equal to Horrid Shadowspinner's power, then discard that many?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { powerOf: "source" } },
            { kind: "discard", target: "you", amount: { powerOf: "source" } },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

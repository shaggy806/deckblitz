import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 6838.
//
// Rulings:
//   [2024-07-05] If you have no cards in hand as Jackdaw's first ability resolves, you may still
//     choose to discard your hand.
//
// "If you do" is the `may`'s `then`: saying yes is doing it, an empty hand
// included (the ruling). The artifacts are counted as the draw happens.
const TEXT =
  "Whenever Jackdaw deals combat damage to a player, you may discard your hand. If you do, draw a card for each artifact you control.";

export default defineCard({
  name: "Jackdaw",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${TEXT}\nCrew 3`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw a card for each artifact you control?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: { countOf: { type: "artifact", controlledBy: "you" } } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [crew(3)],
});

import { defineCard } from "../define.js";

// EDHREC rank 7651.
//
// Rulings:
//   [2019-08-23] You draw three cards while resolving the triggered ability, even if you discarded
//     zero cards.
//   [2019-08-23] If any of the cards you discard have madness, you'll choose whether to cast them
//     after you've drawn three cards.

const ATTACKS = "Whenever this creature attacks, discard your hand, then draw three cards.";

export default defineCard({
  name: "Anje's Ravager",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Berserker"],
  power: 3,
  toughness: 3,
  madness: { cost: "{1}{R}" },
  text: `This creature attacks each combat if able.\n${ATTACKS}\nMadness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 3 },
        ],
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});

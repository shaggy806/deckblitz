import { defineCard } from "../define.js";

// EDHREC rank 16759. A results table (rule 706.3a); "Search the Room" is an ability word.
const TEXT =
  "Search the Room — {5}{U}: Roll a d20.\n1—9 | Draw a card.\n10—20 | Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Arcane Investigator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}{U}", tap: false },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "draw", amount: 1 } },
          {
            min: 10,
            max: 20,
            effect: {
              kind: "look-and-choose",
              zone: "library",
              count: 3,
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "bottom-any-order",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

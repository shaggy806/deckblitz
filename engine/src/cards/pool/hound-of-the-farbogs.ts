import { defineCard } from "../define.js";

// EDHREC rank 28995.
//
// Rulings:
//   [2016-04-08] Menace only matters as blockers are chosen. Causing Hound of the Farbogs to gain
//     menace after blockers are chosen won't cause it to become unblocked.

const TEXT =
  "Delirium — This creature has menace as long as there are four or more card types among cards in your graveyard. (A creature with menace can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Hound of the Farbogs",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Dog"],
  power: 5,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantKeywords: ["menace"],
      text: TEXT,
    },
  ],
});

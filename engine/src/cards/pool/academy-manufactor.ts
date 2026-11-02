import { defineCard } from "../define.js";

// Per token, over every such token in the event: two Treasures make two of
// each, and a second Manufactor makes each of the three of each from one.
const TEXT = "If you would create a Clue, Food, or Treasure token, instead create one of each.";

export default defineCard({
  name: "Academy Manufactor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        oneOfEach: ["Clue Token", "Food Token", "Treasure Token"],
        ofTokens: { subtypesAnyOf: ["Clue", "Food", "Treasure"] },
      },
      text: TEXT,
    },
  ],
});

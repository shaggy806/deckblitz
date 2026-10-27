import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 21937. Chromatic Sphere's shape: not a mana
// ability (rule 605.1a: the draw moves a card from a library — the older
// ruling calling it one predates that rule), so it uses the stack.

const TEXT = "{2}, {T}, Sacrifice this artifact: Add {U}{B}. Draw a card.";

export default defineCard({
  name: "Darkwater Egg",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (Activate only as an instant.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: { all: ["U", "B"] }, amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

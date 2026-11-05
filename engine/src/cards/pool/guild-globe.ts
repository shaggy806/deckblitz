import { defineCard } from "../define.js";

// EDHREC rank 13328.

export default defineCard({
  name: "Guild Globe",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, draw a card.\n{2}, {T}, Sacrifice this artifact: Add two mana of different colors.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"], different: 1 }, amount: 2 },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Add two mana of different colors.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this artifact enters, draw a card.",
    },
  ],
});

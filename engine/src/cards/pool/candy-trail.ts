import { defineCard } from "../define.js";

// EDHREC rank 6844.
const ETB_TEXT = "When this artifact enters, scry 2.";
const SAC_TEXT = "{2}, {T}, Sacrifice this artifact: You gain 3 life and draw a card.";

export default defineCard({
  name: "Candy Trail",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food", "Clue"],
  text: `${ETB_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

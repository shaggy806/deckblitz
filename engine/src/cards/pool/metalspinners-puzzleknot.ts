import { defineCard } from "../define.js";

export default defineCard({
  name: "Metalspinner's Puzzleknot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, you draw a card and you lose 1 life.\n{2}{B}, Sacrifice this artifact: You draw a card and you lose 1 life.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "{2}{B}, Sacrifice this artifact: You draw a card and you lose 1 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "When this artifact enters, you draw a card and you lose 1 life.",
    },
  ],
});

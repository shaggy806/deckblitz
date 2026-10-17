import { defineCard } from "../define.js";

// EDHREC rank 10742.

export default defineCard({
  name: "Quarrel's End",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard a card.\nDraw two cards and create a 1/1 white Human Soldier creature token.",
  additionalCost: { discard: 1 },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "create-token", token: "Human Soldier Token", count: 1 },
    ],
  },
});

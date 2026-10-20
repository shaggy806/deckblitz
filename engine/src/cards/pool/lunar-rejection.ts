import { defineCard } from "../define.js";

// EDHREC rank 30048.

export default defineCard({
  name: "Lunar Rejection",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cleave {3}{U} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nReturn target [Wolf or Werewolf] creature to its owner's hand.\nDraw a card.",
  targets: [
    { kind: "permanent", filter: { type: "creature", anyOf: [{ subtype: "Wolf" }, { subtype: "Werewolf" }] } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
  cleave: {
    cost: "{3}{U}",
    targets: ["creature"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0 },
        { kind: "draw", amount: 1 },
      ],
    },
  },
});

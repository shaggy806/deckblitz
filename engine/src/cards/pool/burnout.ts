import { defineCard } from "../define.js";

// EDHREC rank 12453. Alliances.
//
// Any instant spell is a legal target; its colour is checked only as Burnout
// resolves, and the delayed draw happens either way (the ruling).

export default defineCard({
  name: "Burnout",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Counter target instant spell if it's blue.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "spell", filter: { type: "instant" } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { colors: ["U"] } },
        then: { kind: "counter", target: 0 },
      },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});

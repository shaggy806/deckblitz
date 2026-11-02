import { defineCard } from "../define.js";

export default defineCard({
  name: "Leadership Vacuum",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target player returns each commander they control from the battlefield to the command zone.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-permanent",
        filter: { isCommander: true, controlledBy: "you" },
        controlledByTarget: 0,
        as: 1,
        effect: { kind: "put-in-command-zone", target: 1 },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Coming In Hot",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +1/+0 and gains first strike until end of turn. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      { kind: "scry", amount: 1 },
    ],
  },
});

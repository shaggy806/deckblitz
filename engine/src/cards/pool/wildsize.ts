import { defineCard } from "../define.js";

export default defineCard({
  name: "Wildsize",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains trample until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

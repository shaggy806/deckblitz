import { defineCard } from "../define.js";

export default defineCard({
  name: "Samut's Sprint",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +2/+1 and gains haste until end of turn. Scry 1.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      { kind: "scry", amount: 1 },
    ],
  },
});

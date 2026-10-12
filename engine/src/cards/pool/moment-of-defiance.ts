import { defineCard } from "../define.js";

export default defineCard({
  name: "Moment of Defiance",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +2/+1 and gains lifelink until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

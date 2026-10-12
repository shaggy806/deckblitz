import { defineCard } from "../define.js";

export default defineCard({
  name: "Desperate Lunge",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains flying until end of turn. You gain 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      { kind: "gain-life", amount: 2 },
    ],
  },
});

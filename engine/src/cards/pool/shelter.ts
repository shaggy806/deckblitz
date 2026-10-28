import { defineCard } from "../define.js";

// EDHREC rank 3306.

export default defineCard({
  name: "Shelter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gains protection from the color of your choice until end of turn.\nDraw a card.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

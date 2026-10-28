import { defineCard } from "../define.js";

// EDHREC rank 24037.

export default defineCard({
  name: "Tel-Jilad Defiance",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gains protection from artifacts until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-protection",
        target: 0,
        from: { types: ["artifact"] },
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

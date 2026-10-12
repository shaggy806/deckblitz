import { defineCard } from "../define.js";

export default defineCard({
  name: "Refresh",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Regenerate target creature.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "regenerate", target: 0 }, { kind: "draw", amount: 1 }],
  },
});

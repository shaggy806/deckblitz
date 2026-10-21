import { defineCard } from "../define.js";

// EDHREC rank 20993. Tapped first, then destroyed if it's an artifact; the
// draw happens whenever the target is still legal, tapped or destroyed or
// neither (the ruling).

export default defineCard({
  name: "Topple the Statue",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap target permanent. If it's an artifact, destroy it.\nDraw a card.",
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "artifact" } },
        then: { kind: "destroy", target: 0 },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

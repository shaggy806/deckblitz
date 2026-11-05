import { defineCard } from "../define.js";

// EDHREC rank 23248.

export default defineCard({
  name: "Spiritualize",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Until end of turn, whenever target creature deals damage, you gain that much life.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "deals-damage", who: "self" }, watching: 0 },
        effect: { kind: "gain-life", amount: { triggerValue: true } },
        text: "Whenever target creature deals damage, you gain that much life.",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

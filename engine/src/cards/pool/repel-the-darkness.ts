import { defineCard } from "../define.js";

export default defineCard({
  name: "Repel the Darkness",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap up to two target creatures.\nDraw a card.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});

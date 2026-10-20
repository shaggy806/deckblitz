import { defineCard } from "../define.js";

export default defineCard({
  name: "Snow Day",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.\nDraw two cards, then discard a card.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "tap", target: 1, doesntUntapNext: true },
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
});

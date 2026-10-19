import { defineCard } from "../define.js";

export default defineCard({
  name: "Stall for Time",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\n" +
    "Tap up to two target creatures. If this spell was kicked, put a stun counter on each of those creatures. (If a permanent with a stun counter would become untapped, remove one from it instead.)\n" +
    "Draw a card.",
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
  kicker: {
    cost: "{1}{U}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "tap", target: 0 },
        { kind: "tap", target: 1 },
        { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
        { kind: "draw", amount: 1 },
      ],
    },
  },
});

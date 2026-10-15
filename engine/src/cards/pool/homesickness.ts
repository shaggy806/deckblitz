import { defineCard } from "../define.js";

// EDHREC rank 20771. Two different creatures, or one, or none.
const TEXT =
  "Target player draws two cards. Tap up to two target creatures. Put a stun counter on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Homesickness",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [
    "player",
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 1 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "tap", target: 1 },
      { kind: "tap", target: 2 },
      { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
      { kind: "add-counter", target: 2, counter: "stun", amount: 1 },
    ],
  },
});

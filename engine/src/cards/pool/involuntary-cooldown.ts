import { defineCard } from "../define.js";

// EDHREC rank 18768. The Brothers' War.

export default defineCard({
  name: "Involuntary Cooldown",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap up to two target artifacts and/or creatures. Put two stun counters on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: [
    { kind: "optional", of: "artifact-or-creature" },
    { kind: "optional", of: { kind: "other", of: "artifact-or-creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 2 },
      { kind: "add-counter", target: 1, counter: "stun", amount: 2 },
    ],
  },
});

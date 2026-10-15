import { defineCard } from "../define.js";

// EDHREC rank 26297.
//
// Two optional slots, each its own instruction: a slot left empty (or gone
// illegal) skips only its own part.

export default defineCard({
  name: "Stunning Shot",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on up to one target creature you control. Tap up to one target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: [
    { kind: "optional", of: "creature-you-control" },
    { kind: "optional", of: "creature-an-opponent-controls" },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "tap", target: 1 },
      { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
    ],
  },
});

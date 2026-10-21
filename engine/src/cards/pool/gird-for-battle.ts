import { defineCard } from "../define.js";

// EDHREC rank 18697. Guilds of Ravnica. Unbounded Potential's two distinct
// optional slots (the ruling: not the same creature twice).

export default defineCard({
  name: "Gird for Battle",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on each of up to two target creatures.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});

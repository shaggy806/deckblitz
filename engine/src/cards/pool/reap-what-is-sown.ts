import { defineCard } from "../define.js";

// EDHREC rank 23529. Three different creatures at most, one counter each (its ruling).

export default defineCard({
  name: "Reap What Is Sown",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on each of up to three target creatures.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 2, counter: "+1/+1", amount: 1 },
    ],
  },
});

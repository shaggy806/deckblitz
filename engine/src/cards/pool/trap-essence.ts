import { defineCard } from "../define.js";

// EDHREC rank 16105. The creature slot is optional (the ruling).

export default defineCard({
  name: "Trap Essence",
  manaCost: "{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["instant"],
  text: "Counter target creature spell. Put two +1/+1 counters on up to one target creature.",
  targets: ["creature-spell", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 2 },
    ],
  },
});

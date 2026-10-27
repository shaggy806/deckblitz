import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 30569. Common Bond's two slots, the second "another
// target creature" (Blood Feud's `other`).

export default defineCard({
  name: "Stand Together",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put two +1/+1 counters on target creature and two +1/+1 counters on another target creature.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 2 },
    ],
  },
});

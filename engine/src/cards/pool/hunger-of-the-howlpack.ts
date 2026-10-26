import { defineCard } from "../define.js";

// EDHREC rank 18304.

export default defineCard({
  name: "Hunger of the Howlpack",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature.\nMorbid — Put three +1/+1 counters on that creature instead if a creature died this turn.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "creature-died-this-turn" },
    then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
    else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
  },
});

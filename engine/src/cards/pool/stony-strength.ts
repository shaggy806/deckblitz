import { defineCard } from "../define.js";

export default defineCard({
  name: "Stony Strength",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature you control. Untap that creature.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "untap", target: 0 },
    ],
  },
});

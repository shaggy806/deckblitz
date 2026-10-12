import { defineCard } from "../define.js";

export default defineCard({
  name: "Have a Bite",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature. You gain 1 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "gain-life", amount: 1 },
    ],
  },
  prepareSpellOnly: true,
});

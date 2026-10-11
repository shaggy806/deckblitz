import { defineCard } from "../define.js";

// Vigorbloom Vanguard's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Vanguard makes in exile (722.3c).
export default defineCard({
  name: "Seed Suture",
  manaCost: "{G/W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Put a +1/+1 counter on target creature. You gain 1 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "gain-life", amount: 1 },
    ],
  },
});

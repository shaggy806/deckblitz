import { defineCard } from "../define.js";

export default defineCard({
  name: "Heroic Stanza",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature.",
  targets: ["creature"],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
  prepareSpellOnly: true,
});

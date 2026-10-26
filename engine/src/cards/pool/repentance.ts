import { defineCard } from "../define.js";

// EDHREC rank 15426.

export default defineCard({
  name: "Repentance",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target creature deals damage to itself equal to its power.",
  targets: ["creature"],
  effect: { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
});

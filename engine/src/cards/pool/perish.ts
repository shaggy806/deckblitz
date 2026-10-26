import { defineCard } from "../define.js";

// EDHREC rank 23050.

export default defineCard({
  name: "Perish",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all green creatures. They can't be regenerated.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", colors: ["G"] }, cantBeRegenerated: true },
});

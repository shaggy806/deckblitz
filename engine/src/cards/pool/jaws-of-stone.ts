import { defineCard } from "../define.js";

// EDHREC rank 24631.

export default defineCard({
  name: "Jaws of Stone",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Jaws of Stone deals X damage divided as you choose among any number of targets, where X is the number of Mountains you control as you cast this spell.",
  targets: [{ kind: "any-number", of: "any-target" }],
  divided: { total: { countOf: { subtype: "Mountain", controlledBy: "you" } }, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});

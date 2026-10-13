import { defineCard } from "../define.js";

// EDHREC rank 6984.
//
// Exactly X targets, X announced before they're chosen (rule 601.2b–c) —
// Curse of the Swine's group — destroyed together.
export default defineCard({
  name: "By Force",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy X target artifacts.",
  targets: [{ kind: "any-number", of: "artifact", min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
});

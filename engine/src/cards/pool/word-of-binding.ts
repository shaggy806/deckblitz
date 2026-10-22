import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 26494. Winter Blast's shape: exactly X targets.

export default defineCard({
  name: "Word of Binding",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Tap X target creatures.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
});

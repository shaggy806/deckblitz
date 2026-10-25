import { defineCard } from "../define.js";

// EDHREC rank 7458.
//
// Exactly six different targets, or it can't be cast; the ones still legal
// as it resolves are destroyed together (the ruling).
export default defineCard({
  name: "Hex",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy six target creatures.",
  targets: [{ kind: "any-number", of: "creature", min: 6, max: 6 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "destroy", target: 0 },
    simultaneous: true,
  },
});

import { defineCard } from "../define.js";

// Rulings:
//   You can cast Revealing Wind even if there are no face-down creatures attacking or blocking. The
//     damage-prevention effect will still apply.

export default defineCard({
  name: "Revealing Wind",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn. You may look at each face-down creature that's attacking or blocking.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-all-combat-damage" },
      { kind: "look-at-face-down", filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] } },
    ],
  },
});

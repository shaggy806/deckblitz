import { defineCard } from "../define.js";

// EDHREC rank 21829.
//
// Rulings:
//   [2017-02-09] Chandra's Revolution can target a land that's already tapped. That land won't
//     untap during its controller's next untap step.

export default defineCard({
  name: "Chandra's Revolution",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Chandra's Revolution deals 4 damage to target creature. Tap target land. That land doesn't untap during its controller's next untap step.",
  targets: ["creature", "land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "tap", target: 1, doesntUntapNext: true },
    ],
  },
});

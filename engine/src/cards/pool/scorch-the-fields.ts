import { defineCard } from "../define.js";

// EDHREC rank 30445.
//
// Rulings:
//   [2011-01-22] If the targeted land is an illegal target when Scorch the Fields tries to
//     resolve, it won't resolve and none of its effects will happen. No damage will be dealt to
//     any Human.
//   [2011-01-22] Scorch the Fields doesn't target any Humans. You can cast Scorch the Fields even
//     if there aren't any Humans on the battlefield.

export default defineCard({
  name: "Scorch the Fields",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land. Scorch the Fields deals 1 damage to each Human creature.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage-all", filter: { type: "creature", subtype: "Human" }, amount: 1 },
    ],
  },
});

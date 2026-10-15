import { defineCard } from "../define.js";

// EDHREC rank 19206.
//
// "The amount of mana spent to cast this spell" is Memory Deluge's
// `manaSpentOf: "source"` — {X} included, and the flashback cost when it was
// cast that way.
//
// Rulings:
//   [2026-03-20] If the target creature is an illegal target as Molten Note tries to resolve, it
//     won't resolve and none of its effects will happen. You won't untap any creatures.

export default defineCard({
  name: "Molten Note",
  manaCost: "{X}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  flashback: { cost: "{6}{R}{W}" },
  text: "Molten Note deals damage to target creature equal to the amount of mana spent to cast this spell. Untap all creatures you control.\nFlashback {6}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: { manaSpentOf: "source" } },
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
    ],
  },
});

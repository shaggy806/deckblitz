import { defineCard } from "../define.js";

// EDHREC rank 23157. Shadowmoor.
//
// Rulings:
//   [2016-06-08] This spell cares about what mana was spent to pay its total cost, not just what
//     mana was spent to pay the hybrid mana symbol in its cost.
//   [2016-06-08] This spell checks on resolution to see if any mana of the appropriate colors were
//     spent to pay its cost. It doesn’t matter how much mana of that color was spent; the effect
//     isn’t multiplied.
//   [2016-06-08] If this spell is copied, the copy will not have had any colors of mana paid for
//     it, no matter what colors were spent on the original spell.
//
// Unnerving Assault's shape: each half gated on the colour spent on the spell, read as it
// resolves. The two halves hit disjoint creatures, dealt as one event.

export default defineCard({
  name: "Firespout",
  manaCost: "{2}{R/G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Firespout deals 3 damage to each creature without flying if {R} was spent to cast this spell and 3 damage to each creature with flying if {G} was spent to cast this spell. (Do both if {R}{G} was spent.)",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { R: 1 } } },
        then: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 3 },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } },
        then: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 3 },
      },
    ],
  },
});

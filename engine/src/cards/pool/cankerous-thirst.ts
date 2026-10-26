import { defineCard } from "../define.js";

// EDHREC rank 29490. Two target slots with no relation between them, so both
// may be the same creature (the ruling); each half checks the mana spent on
// the spell as it resolves (Mythos of Nethroi's `source` condition) and is
// then optional.
//
// Rulings:
//   [2008-08-01] The spell checks on resolution to see if any mana of the stated colors was spent
//     to pay its cost. It cares about what mana was spent to pay its total cost.
//   [2008-08-01] If the spell is copied, the copy will never have had mana of the stated color
//     paid for it.
//   [2008-08-01] As you cast Cankerous Thirst, you must target a creature for the first effect
//     and you must target a creature for the second effect. Both targets may be the same. As
//     Cankerous Thirst resolves, you decide whether to apply either effect.

export default defineCard({
  name: "Cankerous Thirst",
  manaCost: "{3}{B/G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "If {B} was spent to cast this spell, you may have target creature get -3/-3 until end of turn. If {G} was spent to cast this spell, you may have target creature get +3/+3 until end of turn. (Do both if {B}{G} was spent.)",
  targets: ["creature", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { B: 1 } } },
        then: {
          kind: "may",
          prompt: "Have the first target creature get -3/-3 until end of turn?",
          effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
        },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } },
        then: {
          kind: "may",
          prompt: "Have the second target creature get +3/+3 until end of turn?",
          effect: { kind: "modify-pt", target: 1, power: 3, toughness: 3, duration: "end-of-turn" },
        },
      },
    ],
  },
});

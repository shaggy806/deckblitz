import { defineCard } from "../define.js";

// EDHREC rank 25404.
//
// Rulings:
//   [2008-08-01] The spell checks on resolution to see if any mana of the stated colors was spent
//     to pay its cost. If so, it doesn't matter how much mana of that color was spent.
//   [2008-08-01] If the spell is copied, the copy will never have had mana of the stated color
//     paid for it.
//   [2008-08-01] Invert the Skies affects only creatures on the battlefield at the time it
//     resolves.
//
// Both halves read the spell's own spent mana as it resolves (Mythos of
// Illuna's shape); each mass effect locks its set as it resolves (rule 611.2c).

export default defineCard({
  name: "Invert the Skies",
  manaCost: "{3}{G/U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Creatures your opponents control lose flying until end of turn if {G} was spent to cast this spell, and creatures you control gain flying until end of turn if {U} was spent to cast this spell. (Do both if {G}{U} was spent.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } },
        then: {
          kind: "lose-keywords",
          filter: { type: "creature", controlledBy: "opponent" },
          keywords: ["flying"],
          duration: "end-of-turn",
        },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { U: 1 } } },
        then: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "flying",
          duration: "end-of-turn",
        },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 26766. Ravnica: City of Guilds.
//
// Rulings:
//   [2005-10-01] The spell checks on resolution to see if any mana of the stated color was spent
//     to pay its cost. It doesn’t matter how much mana of that color was spent.
//   [2005-10-01] If the spell is copied (such as with Twincast), the copy will never have had mana
//     of the stated color paid for it, no matter what colors were spent on the original spell.

export default defineCard({
  name: "Dryad's Caress",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain 1 life for each creature on the battlefield. If {W} was spent to cast this spell, untap all creatures you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { countOf: { type: "creature" } } },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { W: 1 } } },
        then: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      },
    ],
  },
});

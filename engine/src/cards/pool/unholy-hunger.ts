import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 24516.
//
// Rulings:
//   [2015-06-22] Spell mastery is checked as the spell resolves; the spell itself is still on the
//     stack.
export default defineCard({
  name: "Unholy Hunger",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, you gain 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: { kind: "gain-life", amount: 2 },
      },
    ],
  },
});

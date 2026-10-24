import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 14619.
//
// Rulings:
//   [2015-06-22] If the creature becomes an illegal target, Ravaging Blaze won't resolve and none
//     of its effects will happen.
//   [2015-06-22] Ravaging Blaze targets only the creature, not any player.
//   [2015-06-22] Spell mastery is checked as the spell resolves; the spell itself is still on the
//     stack.
//
// Detonate's "that creature's controller" (untargeted, read as the creature
// last existed), gated on spell mastery as it resolves.
export default defineCard({
  name: "Ravaging Blaze",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Ravaging Blaze deals X damage to target creature.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, Ravaging Blaze also deals X damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: { kind: "damage", amount: "x", toControllerOfTarget: 0 },
      },
    ],
  },
});

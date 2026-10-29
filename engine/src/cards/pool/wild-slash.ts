import { defineCard } from "../define.js";

// EDHREC rank 16432.
//
// Rulings:
//   Wild Slash's ferocious ability applies to all damage that would be dealt that turn,
//   including the damage Wild Slash deals.
//   If you control a creature with power 4 or greater as Wild Slash resolves, the ferocious
//   ability will apply. Damage dealt that turn can't be prevented, even if you no longer
//   control a creature with power 4 or greater as that damage would be dealt.
//
// - Ferocious is checked first, so its rule already covers Wild Slash's own
//   damage.
export default defineCard({
  name: "Wild Slash",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Ferocious — If you control a creature with power 4 or greater, damage can't be prevented this turn.\nWild Slash deals 2 damage to any target.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } },
          atLeast: 1,
        },
        then: { kind: "damage-cant-be-prevented" },
      },
      { kind: "damage", amount: 2, target: 0 },
    ],
  },
});

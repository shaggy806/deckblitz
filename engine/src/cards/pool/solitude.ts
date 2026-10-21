import { defineCard } from "../define.js";

// EDHREC rank 1973.
//
// Rulings:
//   [2021-06-18] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as an evoke cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined by only its mana cost, no matter what
//     the total cost to cast that spell was.
//   [2021-06-18] If you pay the evoke cost, you can have the creature's own triggered ability
//     resolve before the evoke triggered ability. You can cast spells after that ability resolves
//     but before you have to sacrifice the creature.

export default defineCard({
  name: "Solitude",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "lifelink"],
  text: "Flash\nLifelink\nWhen this creature enters, exile up to one other target creature. That creature's controller gains life equal to its power.\nEvoke—Exile a white card from your hand.",
  evoke: { cost: "", exileFromHand: { filter: { colors: ["W"] }, text: "a white card" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "gain-life", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: "When this creature enters, exile up to one other target creature. That creature's controller gains life equal to its power.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 2398.
//
// Rulings:
//   [2021-06-18] If some of the targets are illegal as the triggered ability tries to resolve, the
//     original division of damage still applies, but the damage that would have been dealt to the
//     illegal targets isn't dealt at all.
//   [2021-06-18] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as an evoke cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined by only its mana cost, no matter what
//     the total cost to cast that spell was.
//   [2021-06-18] You divide the damage as you put the triggered ability on the stack, not as it
//     resolves. Each target must be assigned at least 1 damage. You can't choose more than four
//     targets and deal 0 damage to some of them.
//   [2021-06-18] If you pay the evoke cost, you can have the creature's own triggered ability
//     resolve before the evoke triggered ability. You can cast spells after that ability resolves
//     but before you have to sacrifice the creature.

export default defineCard({
  name: "Fury",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 3,
  toughness: 3,
  keywords: ["double-strike"],
  text: "Double strike\nWhen this creature enters, it deals 4 damage divided as you choose among any number of target creatures and/or planeswalkers.\nEvoke—Exile a red card from your hand.",
  evoke: { cost: "", exileFromHand: { filter: { colors: ["R"] }, text: "a red card" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }, max: 4 }],
      divided: { total: 4, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: "When this creature enters, it deals 4 damage divided as you choose among any number of target creatures and/or planeswalkers.",
    },
  ],
});

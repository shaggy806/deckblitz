import { defineCard } from "../define.js";

// EDHREC rank 6482.
//
// Rulings:
//   [2021-06-18] If you pay the evoke cost, you can have the creature's own triggered ability
//     resolve before the evoke triggered ability. You can cast spells after that ability resolves
//     but before you have to sacrifice the creature.
//   [2021-06-18] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as an evoke cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined by only its mana cost, no matter what
//     the total cost to cast that spell was.

export default defineCard({
  name: "Grief",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace\nWhen this creature enters, target opponent reveals their hand. You choose a nonland card from it. That player discards that card.\nEvoke—Exile a black card from your hand.",
  evoke: { cost: "", exileFromHand: { filter: { colors: ["B"] }, text: "a black card" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      resolve: null,
      text: "When this creature enters, target opponent reveals their hand. You choose a nonland card from it. That player discards that card.",
    },
  ],
});

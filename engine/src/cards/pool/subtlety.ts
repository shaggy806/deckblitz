import { defineCard } from "../define.js";

// EDHREC rank 4246.
//
// Rulings:
//   [2021-06-18] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as an evoke cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined by only its mana cost, no matter what
//     the total cost to cast that spell was.
//   [2021-06-18] The owner of the spell is the one who chooses whether it goes on the top or
//     bottom of their library. All players will know this information.
//   [2021-06-18] Subtlety's triggered ability targets a spell on the stack. It can't target
//     creatures or planeswalkers on the battlefield.
//   [2021-06-18] A spell that's put into its owner's library doesn't resolve, but it isn't
//     countered. This will work on spells that say they can't be countered.
//   [2021-06-18] If you pay the evoke cost, you can have the creature's own triggered ability
//     resolve before the evoke triggered ability. You can cast spells after that ability resolves
//     but before you have to sacrifice the creature.

export default defineCard({
  name: "Subtlety",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, choose up to one target creature spell or planeswalker spell. Its owner puts it on their choice of the top or bottom of their library.\nEvoke—Exile a blue card from your hand.",
  evoke: { cost: "", exileFromHand: { filter: { colors: ["U"] }, text: "a blue card" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "spell", filter: { typesAnyOf: ["creature", "planeswalker"] } } }],
      effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      resolve: null,
      text: "When this creature enters, choose up to one target creature spell or planeswalker spell. Its owner puts it on their choice of the top or bottom of their library.",
    },
  ],
});

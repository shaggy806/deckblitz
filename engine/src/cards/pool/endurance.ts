import { defineCard } from "../define.js";

// EDHREC rank 1348.
//
// Rulings:
//   [2021-06-18] If you pay the evoke cost, you can have the creature's own triggered ability
//     resolve before the evoke triggered ability. You can cast spells after that ability resolves
//     but before you have to sacrifice the creature.
//   [2021-06-18] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as an evoke cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined by only its mana cost, no matter what
//     the total cost to cast that spell was.

const TRIGGER =
  "When this creature enters, up to one target player puts all the cards from their graveyard on the bottom of their library in a random order.";

export default defineCard({
  name: "Endurance",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 3,
  toughness: 4,
  keywords: ["flash", "reach"],
  evoke: { cost: "", exileFromHand: { filter: { colors: ["G"] }, text: "a green card" } },
  text: `Flash\nReach\n${TRIGGER}\nEvoke—Exile a green card from your hand.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "player" }],
      effect: { kind: "put-on-libraries", what: { graveyardOf: 0 }, position: "bottom-random" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});

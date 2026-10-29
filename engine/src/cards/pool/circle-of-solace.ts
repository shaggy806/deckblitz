import { defineCard } from "../define.js";

// EDHREC rank 27864.

export default defineCard({
  name: "Circle of Solace",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: "As this enchantment enters, choose a creature type.\n{1}{W}: The next time a creature of the chosen type would deal damage to you this turn, prevent that damage.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, by: { filter: { type: "creature", ofChosenType: true } }, amount: "next-time" },
      resolve: null,
      text: "{1}{W}: The next time a creature of the chosen type would deal damage to you this turn, prevent that damage.",
    },
  ],
});

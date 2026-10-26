import { defineCard } from "../define.js";

// EDHREC rank 15593.

export default defineCard({
  name: "Shaman en-Kor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric", "Shaman"],
  power: 1,
  toughness: 2,
  text: "{0}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature you control instead.\n{1}{W}: The next time a source of your choice would deal damage to target creature this turn, that damage is dealt to this creature instead.",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature-you-control"],
      // Rule 614.9: a redirection; combat damage stays combat damage.
      effect: { kind: "prevent-damage", target: "source", amount: 1, redirectTo: 0 },
      resolve: null,
      text: "{0}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature you control instead.",
    },
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "next-time", redirectTo: "source" },
      resolve: null,
      text: "{1}{W}: The next time a source of your choice would deal damage to target creature this turn, that damage is dealt to this creature instead.",
    },
  ],
});

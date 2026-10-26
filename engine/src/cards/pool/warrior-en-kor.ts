import { defineCard } from "../define.js";

// EDHREC rank 15792.

export default defineCard({
  name: "Warrior en-Kor",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Warrior", "Knight"],
  power: 2,
  toughness: 2,
  text: "{0}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature you control instead.",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature-you-control"],
      // Rule 614.9: a redirection; combat damage stays combat damage.
      effect: { kind: "prevent-damage", target: "source", amount: 1, redirectTo: 0 },
      resolve: null,
      text: "{0}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature you control instead.",
    },
  ],
});

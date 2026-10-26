import { defineCard } from "../define.js";

// EDHREC rank 13192.

export default defineCard({
  name: "Nomads en-Kor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Nomad", "Soldier"],
  power: 1,
  toughness: 1,
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

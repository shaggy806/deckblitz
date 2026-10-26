import { defineCard } from "../define.js";

// EDHREC rank 25400.

export default defineCard({
  name: "Lancers en-Kor",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\n{0}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature you control instead.",
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

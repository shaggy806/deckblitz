import { defineCard } from "../define.js";

// EDHREC rank 31426.

export default defineCard({
  name: "Zealous Inquisitor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{1}{W}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature instead.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: "source", amount: 1, redirectTo: 0 },
      resolve: null,
      text: "{1}{W}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature instead.",
    },
  ],
});

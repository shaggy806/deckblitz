import { defineCard } from "../define.js";

// EDHREC rank 32002.

export default defineCard({
  name: "Stonewise Fortifier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{4}{W}: Prevent all damage that would be dealt to this creature by target creature this turn.",
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage-rule", to: { target: "source" }, by: { target: 0 } },
      resolve: null,
      text: "{4}{W}: Prevent all damage that would be dealt to this creature by target creature this turn.",
    },
  ],
});

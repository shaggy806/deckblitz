import { defineCard } from "../define.js";

export default defineCard({
  name: "Heckling Fiends",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 2,
  toughness: 2,
  text: "{2}{R}: Target creature attacks this turn if able.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-attack"] },
      resolve: null,
      text: "{2}{R}: Target creature attacks this turn if able.",
    },
  ],
});

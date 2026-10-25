import { defineCard } from "../define.js";

export default defineCard({
  name: "Rage Nimbus",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 3,
  keywords: ["defender", "flying"],
  text: "Defender, flying\n{1}{R}: Target creature attacks this turn if able.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-attack"] },
      resolve: null,
      text: "{1}{R}: Target creature attacks this turn if able.",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Lambholt Harrier",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: "{3}{R}: Target creature can't block this turn.",
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{3}{R}: Target creature can't block this turn.",
    },
  ],
});

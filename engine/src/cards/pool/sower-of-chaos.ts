import { defineCard } from "../define.js";

export default defineCard({
  name: "Sower of Chaos",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 4,
  toughness: 3,
  text: "{2}{R}: Target creature can't block this turn.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{2}{R}: Target creature can't block this turn.",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Siegebreaker Giant",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 6,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n{3}{R}: Target creature can't block this turn.",
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

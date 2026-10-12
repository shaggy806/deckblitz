import { defineCard } from "../define.js";

export default defineCard({
  name: "Hall Monitor",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\n{1}{R}, {T}: Target creature can't block this turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{1}{R}, {T}: Target creature can't block this turn.",
    },
  ],
});

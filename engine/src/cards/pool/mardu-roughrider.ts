import { defineCard } from "../define.js";

export default defineCard({
  name: "Mardu Roughrider",
  manaCost: "{2}{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 5,
  toughness: 4,
  text: "Whenever this creature attacks, target creature can't block this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "Whenever this creature attacks, target creature can't block this turn.",
    },
  ],
});

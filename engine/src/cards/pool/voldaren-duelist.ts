import { defineCard } from "../define.js";

export default defineCard({
  name: "Voldaren Duelist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nWhen this creature enters, target creature can't block this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "When this creature enters, target creature can't block this turn.",
    },
  ],
});

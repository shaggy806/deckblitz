import { defineCard } from "../define.js";

export default defineCard({
  name: "Fervent Cathar",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
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

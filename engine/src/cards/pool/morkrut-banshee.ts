import { defineCard } from "../define.js";

export default defineCard({
  name: "Morkrut Banshee",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: "Morbid — When this creature enters, if a creature died this turn, target creature gets -4/-4 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
      resolve: null,
      text: "Morbid — When this creature enters, if a creature died this turn, target creature gets -4/-4 until end of turn.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});

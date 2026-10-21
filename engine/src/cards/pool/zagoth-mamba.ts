import { defineCard } from "../define.js";

export default defineCard({
  name: "Zagoth Mamba",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Snake"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature mutates, target creature an opponent controls gets -2/-2 until end of turn.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature mutates, target creature an opponent controls gets -2/-2 until end of turn.",
    },
  ],
});

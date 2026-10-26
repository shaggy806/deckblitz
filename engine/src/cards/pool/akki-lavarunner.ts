import { defineCard } from "../define.js";

export default defineCard({
  name: "Akki Lavarunner",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nWhenever this creature deals damage to an opponent, flip it.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "flip", target: "source" },
      resolve: null,
      text: "Whenever this creature deals damage to an opponent, flip it.",
    },
  ],
  faces: ["Akki Lavarunner", "Tok-Tok, Volcano Born"],
  flip: true,
});

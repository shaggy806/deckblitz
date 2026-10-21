import { defineCard } from "../define.js";

export default defineCard({
  name: "Cerulean Drake",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nProtection from red (This creature can't be blocked, targeted, dealt damage, enchanted, or equipped by anything red.)\nSacrifice this creature: Counter target spell that targets you.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "spell", filter: { targets: { player: "you" } } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Counter target spell that targets you.",
    },
  ],
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

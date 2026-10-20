import { defineCard } from "../define.js";

// EDHREC rank 17864.
export default defineCard({
  name: "Koma's Faithful",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 3,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature dies, each player mills three cards. (They each put the top three cards of their library into their graveyard.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 3 },
      resolve: null,
      text: "When this creature dies, each player mills three cards.",
    },
  ],
});

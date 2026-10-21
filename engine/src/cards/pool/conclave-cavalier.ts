import { defineCard } from "../define.js";

// EDHREC rank 22152. Guilds of Ravnica.

export default defineCard({
  name: "Conclave Cavalier",
  manaCost: "{G}{G}{W}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Centaur", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature dies, create two 2/2 green and white Elf Knight creature tokens with vigilance.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Elf Knight Token", count: 2 },
      resolve: null,
      text: "When this creature dies, create two 2/2 green and white Elf Knight creature tokens with vigilance.",
    },
  ],
});

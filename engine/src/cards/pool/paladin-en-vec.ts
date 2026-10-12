import { defineCard } from "../define.js";

export default defineCard({
  name: "Paladin en-Vec",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike, protection from black and from red (This creature deals combat damage before creatures without first strike. It can't be blocked, targeted, dealt damage, or enchanted by anything black or red.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B", "R"] },
      text: "Protection from black and from red",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Gruul Spellbreaker",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["riot", "trample"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)\nTrample\nDuring your turn, you and this creature have hexproof.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["hexproof"],
      playerHexproof: true,
      text: "During your turn, you and this creature have hexproof.",
    },
  ],
});

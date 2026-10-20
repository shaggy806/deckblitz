import { defineCard } from "../define.js";

// EDHREC rank 17770. Zendikar Rising.

export default defineCard({
  name: "Kor Blademaster",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike\nEquipped Warriors you control have double strike.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", subtype: "Warrior", controlledBy: "you", equipped: true },
      },
      grantKeywords: ["double-strike"],
      text: "Equipped Warriors you control have double strike.",
    },
  ],
});

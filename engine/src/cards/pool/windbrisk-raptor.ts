import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 14717.
//
// Rulings:
//   A static ability: your creatures have lifelink from being declared attackers until combat
//   ends, they're removed from combat, or Windbrisk Raptor leaves.

export default defineCard({
  name: "Windbrisk Raptor",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 5,
  toughness: 7,
  keywords: ["flying"],
  text: "Flying\nAttacking creatures you control have lifelink.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", attacking: true } },
      grantKeywords: ["lifelink"],
      text: "Attacking creatures you control have lifelink.",
    },
  ],
});

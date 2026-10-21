import { defineCard } from "../define.js";

// EDHREC rank 13707.

export default defineCard({
  name: "Force of Virtue",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: "If it's not your turn, you may exile a white card from your hand rather than pay this spell's mana cost.\nFlash\nCreatures you control get +1/+1.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["W"] }, text: "a white card" }, condition: { kind: "not", of: { kind: "your-turn" } } },
  static: [
    { affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: "Creatures you control get +1/+1." },
  ],
});

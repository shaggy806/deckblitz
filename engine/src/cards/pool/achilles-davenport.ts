import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.

const ANTHEM_TEXT = "Other Assassins you control get +1/+1.";

export default defineCard({
  name: "Achilles Davenport",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Freerunning {U}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nMenace (This creature can't be blocked except by two or more creatures.)\n${ANTHEM_TEXT}`,
  freerunning: { cost: "{U}{B}" },
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Assassin", controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});

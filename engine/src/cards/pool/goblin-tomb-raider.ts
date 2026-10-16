import { defineCard } from "../define.js";

// EDHREC rank 16437.
//
// Rulings:
//   [2023-11-10] Once Goblin Tomb Raider has been declared as an attacker, causing it to lose
//     haste by removing all of your artifacts won't cause it to stop attacking, even if it entered
//     the battlefield or came under your control that turn.

export default defineCard({
  name: "Goblin Tomb Raider",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Pirate"],
  power: 1,
  toughness: 2,
  text: "As long as you control an artifact, this creature gets +1/+0 and has haste.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [1, 0],
      grantKeywords: ["haste"],
      text: "As long as you control an artifact, this creature gets +1/+0 and has haste.",
    },
  ],
});

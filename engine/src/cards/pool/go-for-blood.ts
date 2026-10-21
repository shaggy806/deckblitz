import { defineCard } from "../define.js";

// EDHREC rank 13801. Ikoria: Lair of Behemoths.
//
// Rulings:
//   - If either target is an illegal target as Go for Blood resolves, no creature will deal or be
//     dealt damage.

export default defineCard({
  name: "Go for Blood",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cycling: { cost: "{1}" },
  text: "Target creature you control fights target creature you don't control. (Each deals damage equal to its power to the other.)\nCycling {1} ({1}, Discard this card: Draw a card.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1 },
});

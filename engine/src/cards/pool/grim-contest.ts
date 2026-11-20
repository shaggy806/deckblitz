import { defineCard } from "../define.js";

// Not a fight: each deals its toughness to the other, at once. With either
// target illegal as it resolves, neither deals or is dealt damage (the
// ruling).
export default defineCard({
  name: "Grim Contest",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text:
    "Choose target creature you control and target creature an opponent controls. " +
    "Each of those creatures deals damage equal to its toughness to the other.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1, byToughness: true },
});

import { defineCard } from "../define.js";

// EDHREC rank 7785.
//
// Rulings:
//   The life payment is part of the cost to cast Hatred, so it is lost if this spell is
//     countered.
//
// Toxic Deluge's `payLifeX`: X is chosen as it's cast and paid in life.

export default defineCard({
  name: "Hatred",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, pay X life.\nTarget creature gets +X/+0 until end of turn.",
  targets: ["creature"],
  additionalCost: { payLifeX: true },
  effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
});

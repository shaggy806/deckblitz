import { defineCard } from "../define.js";

// "Was dealt damage this turn" reads the turn's damage history, not marked
// damage, so a creature regenerated since still qualifies (the ruling).

export default defineCard({
  name: "Fatal Blow",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature that was dealt damage this turn. It can't be regenerated.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});

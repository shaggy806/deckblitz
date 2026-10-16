import { defineCard } from "../define.js";

// EDHREC rank 14412. Joust Through's damage-then-life, the life gated on a Bat
// as it resolves; a target gone illegal stops the whole spell (the ruling).
export default defineCard({
  name: "Sonar Strike",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Sonar Strike deals 4 damage to target attacking, blocking, or tapped creature. You gain 3 life if you control a Bat.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }, { tapped: true }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Bat" }, atLeast: 1 },
        then: { kind: "gain-life", amount: 3 },
      },
    ],
  },
});

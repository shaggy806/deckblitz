import { defineCard } from "../define.js";

// EDHREC rank 25103. Whether you control a Dragon is read as it resolves (the
// ruling).
export default defineCard({
  name: "Sarkhan's Rage",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Sarkhan's Rage deals 5 damage to any target. If you control no Dragons, Sarkhan's Rage deals 2 damage to you.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Dragon" }, atLeast: 1 } },
        then: { kind: "damage", amount: 2, who: "you" },
      },
    ],
  },
});

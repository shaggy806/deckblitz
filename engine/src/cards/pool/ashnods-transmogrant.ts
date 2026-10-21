import { defineCard } from "../define.js";

// Ruling: it's the ability, not the counter, that makes the creature an
// artifact — it stays one if the counter is removed (a lasting `add-types`).

export default defineCard({
  name: "Ashnod's Transmogrant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{T}, Sacrifice this artifact: Put a +1/+1 counter on target nonartifact creature. That creature becomes an artifact in addition to its other types.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["nonartifact-creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-types", target: 0, addTypes: ["artifact"], duration: "permanent" },
        ],
      },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Put a +1/+1 counter on target nonartifact creature. That creature becomes an artifact in addition to its other types.",
    },
  ],
});

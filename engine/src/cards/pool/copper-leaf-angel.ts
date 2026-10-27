import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 26609.

const TEXT = "{T}, Sacrifice X lands: Put X +1/+1 counters on this creature.";

export default defineCard({
  name: "Copper-Leaf Angel",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "land" }, count: "x" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
      resolve: null,
      text: TEXT,
    },
  ],
});

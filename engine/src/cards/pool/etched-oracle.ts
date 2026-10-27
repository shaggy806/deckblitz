import { defineCard } from "../define.js";

// EDHREC rank 8858.

export default defineCard({
  name: "Etched Oracle",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wizard"],
  power: 0,
  toughness: 0,
  text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)\n{1}, Remove four +1/+1 counters from this creature: Target player draws three cards.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 4 } },
      targets: ["player"],
      effect: { kind: "draw", amount: 3, target: 0 },
      resolve: null,
      text: "{1}, Remove four +1/+1 counters from this creature: Target player draws three cards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
    },
  ],
});

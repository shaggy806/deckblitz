import { defineCard } from "../define.js";

// EDHREC rank 27547.

export default defineCard({
  name: "Heliophial",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)\n{2}, Sacrifice this artifact: It deals damage equal to the number of charge counters on it to any target.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: "{2}, Sacrifice this artifact: It deals damage equal to the number of charge counters on it to any target.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
    },
  ],
});

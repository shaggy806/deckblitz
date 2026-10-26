import { defineCard } from "../define.js";

export default defineCard({
  name: "Magma Mine",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{4}: Put a pressure counter on this artifact.\n{T}, Sacrifice this artifact: It deals damage equal to the number of pressure counters on it to any target.",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "pressure", amount: 1 },
      resolve: null,
      text: "{4}: Put a pressure counter on this artifact.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["any-target"],
      // Read off the sacrificed artifact as it last existed (rule 608.2h).
      effect: { kind: "damage", target: 0, amount: { countersOn: "source", counter: "pressure" } },
      resolve: null,
      text: "{T}, Sacrifice this artifact: It deals damage equal to the number of pressure counters on it to any target.",
    },
  ],
});

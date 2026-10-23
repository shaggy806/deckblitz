import { defineCard } from "../define.js";

export default defineCard({
  name: "Titan Forge",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}: Put a charge counter on this artifact.\n{T}, Remove three charge counters from this artifact: Create a 9/9 colorless Golem artifact creature token.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{3}, {T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 3 } },
      targets: [],
      effect: { kind: "create-token", token: "9/9 Golem Token", count: 1 },
      resolve: null,
      text: "{T}, Remove three charge counters from this artifact: Create a 9/9 colorless Golem artifact creature token.",
    },
  ],
});

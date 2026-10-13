import { defineCard } from "../define.js";

// EDHREC rank 7052.
// The charge counters are counted as the second ability resolves.
export default defineCard({
  name: "Otherworld Atlas",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "{T}: Put a charge counter on this artifact.\n{T}: Each player draws a card for each charge counter on this artifact.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "charge" }, who: "each-player" },
      resolve: null,
      text: "{T}: Each player draws a card for each charge counter on this artifact.",
    },
  ],
});

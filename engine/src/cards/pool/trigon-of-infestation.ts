import { defineCard } from "../define.js";

// EDHREC rank 23512.

export default defineCard({
  name: "Trigon of Infestation",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with three charge counters on it.\n{G}{G}, {T}: Put a charge counter on this artifact.\n{2}, {T}, Remove a charge counter from this artifact: Create a 1/1 green Phyrexian Insect creature token with infect.",
  activated: [
    {
      cost: { mana: "{G}{G}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{G}{G}, {T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Insect Token", count: 1 },
      resolve: null,
      text: "{2}, {T}, Remove a charge counter from this artifact: Create a 1/1 green Phyrexian Insect creature token with infect.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 3 } },
      text: "This artifact enters with three charge counters on it.",
    },
  ],
});

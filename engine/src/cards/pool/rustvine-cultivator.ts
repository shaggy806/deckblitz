import { defineCard } from "../define.js";

// EDHREC rank 16315.

export default defineCard({
  name: "Rustvine Cultivator",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Druid"],
  power: 1,
  toughness: 2,
  text: "{T}: Put an oil counter on this creature.\n{T}, Remove an oil counter from this creature: Untap target land.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: "{T}: Put an oil counter on this creature.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "oil", count: 1 } },
      targets: ["land"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{T}, Remove an oil counter from this creature: Untap target land.",
    },
  ],
});

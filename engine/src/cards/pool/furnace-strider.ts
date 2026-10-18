import { defineCard } from "../define.js";

// EDHREC rank 22952.

export default defineCard({
  name: "Furnace Strider",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 4,
  toughness: 5,
  text: "This creature enters with two oil counters on it.\nRemove an oil counter from this creature: Target creature you control gains haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "Remove an oil counter from this creature: Target creature you control gains haste until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: "This creature enters with two oil counters on it.",
    },
  ],
});

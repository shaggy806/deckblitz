import { defineCard } from "../define.js";

// Ice Age. Enters with X ice counters (Astral Cornucopia's replacement);
// removing one is a mana ability with no {T}.

export default defineCard({
  name: "Iceberg",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "This enchantment enters with X ice counters on it.\n{3}: Put an ice counter on this enchantment.\nRemove an ice counter from this enchantment: Add {C}.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "ice", amount: 1 },
      resolve: null,
      text: "{3}: Put an ice counter on this enchantment.",
    },
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "ice", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "Remove an ice counter from this enchantment: Add {C}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "ice", amount: "x" } },
      text: "This enchantment enters with X ice counters on it.",
    },
  ],
});

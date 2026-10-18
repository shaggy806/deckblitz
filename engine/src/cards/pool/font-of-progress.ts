import { defineCard } from "../define.js";

// EDHREC rank 22260.

export default defineCard({
  name: "Font of Progress",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  text: "This artifact enters with two oil counters on it.\n{3}, {T}: Target player mills X cards, where X is the number of oil counters on this artifact.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { countersOn: "source", counter: "oil" } },
      resolve: null,
      text: "{3}, {T}: Target player mills X cards, where X is the number of oil counters on this artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: "This artifact enters with two oil counters on it.",
    },
  ],
});

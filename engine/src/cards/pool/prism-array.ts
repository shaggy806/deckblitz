import { defineCard } from "../define.js";

// EDHREC rank 28871. Converge: Crystalline Crawler's enters-with counters,
// crystal ones.

const CONVERGE_TEXT =
  "Converge — This enchantment enters with a crystal counter on it for each color of mana spent to cast it.";

export default defineCard({
  name: "Prism Array",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${CONVERGE_TEXT}\nRemove a crystal counter from this enchantment: Tap target creature.\n{W}{U}{B}{R}{G}: Scry 3.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "crystal", amount: { colorsSpentOf: "source" } } },
      text: CONVERGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "crystal", count: 1 } },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Remove a crystal counter from this enchantment: Tap target creature.",
    },
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "scry", amount: 3 },
      resolve: null,
      text: "{W}{U}{B}{R}{G}: Scry 3.",
    },
  ],
});

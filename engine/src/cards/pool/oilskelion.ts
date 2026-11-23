import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Oil Sunburst" is its reminder text: an
// oil counter for each colour of mana spent to cast it (Chamber Sentry's
// count), so none when it wasn't cast.

const SUNBURST_TEXT =
  "Oil Sunburst (This enters the battlefield with an oil counter on it for each color of mana spent to cast it.)";
const PING_TEXT = "Remove an oil counter from Oilskelion: Oilskelion deals 1 damage to any target.";

export default defineCard({
  name: "Oilskelion",
  manaCost: "{5}",
  colors: [],
  types: ["creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: `${SUNBURST_TEXT}\n${PING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "oil", amount: { manaSpentOf: "source", count: "colors" } },
      },
      text: SUNBURST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});

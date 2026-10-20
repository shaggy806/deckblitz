import { defineCard } from "../define.js";

// Converge. The mana value isn't a targeting condition — it's checked as the
// spell resolves (the first ruling), Quag Feast's `conditional` shape; a copy
// had no colors spent on it (the last ruling).
const TEXT =
  "Converge — Exile target nonland permanent if its mana value is less than or equal to the number of colors of mana spent to cast this spell.";

export default defineCard({
  name: "Prismatic Ending",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { notTypes: ["land"] } }],
  effect: {
    kind: "conditional",
    condition: {
      kind: "target",
      index: 0,
      filter: { manaValue: { op: "lte", n: { amount: { colorsSpentOf: "source" } } } },
    },
    then: { kind: "exile", target: 0 },
  },
});

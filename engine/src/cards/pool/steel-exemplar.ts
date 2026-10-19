import { defineCard } from "../define.js";

// The Brothers' War. An "enters with" replacement (rule 614.1c) read as it
// enters: two +1/+1 counters while fewer than two colors of mana were spent to
// cast it (converge's count, `colorsSpentOf`), none otherwise. A creature
// that wasn't cast had no mana spent on it, so it gets them. The amount is
// 2 - 2 * max(0, colors - 1), never below 0: 2 for 0 or 1 colors, 0 for two
// or more.
const ENTERS_TEXT =
  "This creature enters with two +1/+1 counters on it unless two or more colors of mana were spent to cast it.";

export default defineCard({
  name: "Steel Exemplar",
  manaCost: "{5}",
  types: ["artifact", "creature"],
  subtypes: ["Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { difference: [2, { product: [{ difference: [{ colorsSpentOf: "source" }, 1] }, 2] }] },
        },
      },
      text: ENTERS_TEXT,
    },
  ],
});

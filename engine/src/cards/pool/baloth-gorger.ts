import { defineCard } from "../define.js";

// EDHREC rank 23203.

const ENTER_TEXT = "If this creature was kicked, it enters with three +1/+1 counters on it.";

export default defineCard({
  name: "Baloth Gorger",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  kicker: { cost: "{4}" },
  text: `Kicker {4} (You may pay an additional {4} as you cast this spell.)\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 3, else: 0 } },
      },
      text: ENTER_TEXT,
    },
  ],
});

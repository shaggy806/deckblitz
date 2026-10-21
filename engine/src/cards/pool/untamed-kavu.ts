import { defineCard } from "../define.js";

// EDHREC rank 20585. Dominaria.

const TEXT = "If this creature was kicked, it enters with three +1/+1 counters on it.";

export default defineCard({
  name: "Untamed Kavu",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance", "trample"],
  kicker: { cost: "{3}" },
  text: `Kicker {3} (You may pay an additional {3} as you cast this spell.)\nVigilance, trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 3, else: 0 } },
      },
      text: TEXT,
    },
  ],
});

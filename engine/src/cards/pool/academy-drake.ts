import { defineCard } from "../define.js";

export default defineCard({
  name: "Academy Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{4}" },
  text: "Kicker {4} (You may pay an additional {4} as you cast this spell.)\nFlying\nIf this creature was kicked, it enters with two +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: "If this creature was kicked, it enters with two +1/+1 counters on it.",
    },
  ],
});

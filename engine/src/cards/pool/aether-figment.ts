import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 18374. Academy Drake's kicked-counters shape.

export default defineCard({
  name: "Aether Figment",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 1,
  kicker: { cost: "{3}" },
  text: "Kicker {3} (You may pay an additional {3} as you cast this spell.)\nIf this creature was kicked, it enters with two +1/+1 counters on it.\nThis creature can't be blocked.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: "If this creature was kicked, it enters with two +1/+1 counters on it.",
    },
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});

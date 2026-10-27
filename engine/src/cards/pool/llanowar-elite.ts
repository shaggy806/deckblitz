import { defineCard } from "../define.js";

// EDHREC rank 25059.
export default defineCard({
  name: "Llanowar Elite",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  kicker: { cost: "{8}" },
  text: "Kicker {8} (You may pay an additional {8} as you cast this spell.)\nTrample\nIf this creature was kicked, it enters with five +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 5, else: 0 } },
      },
      text: "If this creature was kicked, it enters with five +1/+1 counters on it.",
    },
  ],
});

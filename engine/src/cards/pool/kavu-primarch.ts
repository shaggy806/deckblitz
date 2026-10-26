import { defineCard } from "../define.js";

// EDHREC rank 23697.

const KICKED_TEXT = "If this creature was kicked, it enters with four +1/+1 counters on it.";

export default defineCard({
  name: "Kavu Primarch",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 3,
  kicker: { cost: "{4}" },
  convoke: true,
  text: `Kicker {4} (You may pay an additional {4} as you cast this spell.)\nConvoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${KICKED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 4, else: 0 } },
      },
      text: KICKED_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 26925. Dominaria.

const TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it.";

export default defineCard({
  name: "Stronghold Confessor",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  kicker: { cost: "{3}" },
  text: `Kicker {3} (You may pay an additional {3} as you cast this spell.)\nMenace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Devoid is its empty `colors` (rule 702.114a).
//
// "Enters … with haste" is haste for as long as it stays: a static gated on
// the permanent having entered kicked (as Benalish Lancer's first strike).

const TEXT = "If this creature was kicked, it enters with two +1/+1 counters and a trample counter on it and with haste.";

export default defineCard({
  name: "Voidpouncer",
  manaCost: "{1}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 3,
  toughness: 1,
  kicker: { cost: "{2}{C}" },
  text: `Devoid (This card has no color.)\nKicker {2}{C} (You may pay an additional {2}{C} as you cast this spell.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "trample", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-kicked" },
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});

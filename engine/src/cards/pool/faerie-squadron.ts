import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28163.
//
// Rulings:
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//
// Kavu Titan's shape: the counters a kicked-gated entry replacement, "enters
// … with flying" flying for as long as it stays, gated on its having entered
// kicked.
const TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it and with flying.";

export default defineCard({
  name: "Faerie Squadron",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  kicker: { cost: "{3}{U}" },
  text: `Kicker {3}{U} (You may pay an additional {3}{U} as you cast this spell.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: TEXT,
    },
    { affects: { scope: "self" }, condition: { kind: "self-kicked" }, grantKeywords: ["flying"], text: TEXT },
  ],
});

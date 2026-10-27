import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30422.
//
// Rulings:
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//
// Kavu Titan's shape, with fear.
const TEXT =
  "If this creature was kicked, it enters with two +1/+1 counters on it and with fear. (It can't be blocked except by artifact creatures and/or black creatures.)";

export default defineCard({
  name: "Duskwalker",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 1,
  toughness: 1,
  kicker: { cost: "{3}{B}" },
  text: `Kicker {3}{B} (You may pay an additional {3}{B} as you cast this spell.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: TEXT,
    },
    { affects: { scope: "self" }, condition: { kind: "self-kicked" }, grantKeywords: ["fear"], text: TEXT },
  ],
});

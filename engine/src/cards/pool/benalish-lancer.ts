import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30386.
//
// Rulings:
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.

const TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it and with first strike.";

// "Enters … with first strike" is first strike for as long as it stays: a
// static gated on the permanent having entered kicked (as Pouncing Wurm's haste).
export default defineCard({
  name: "Benalish Lancer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}{W}" },
  text: `Kicker {2}{W} (You may pay an additional {2}{W} as you cast this spell.)\n${TEXT}`,
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
      condition: { kind: "self-kicked" },
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});

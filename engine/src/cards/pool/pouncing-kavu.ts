import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28725.
//
// Rulings:
//   [2004-10-04] If the Pouncing Kavu is kicked, it enters with haste and will keep this ability
//     until it leaves the battlefield.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.

const TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it and with haste.";

// "Enters … with haste" is haste for as long as it stays (the ruling): a
// static gated on the permanent having entered kicked (as Pouncing Wurm).
export default defineCard({
  name: "Pouncing Kavu",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  kicker: { cost: "{2}{R}" },
  text: `Kicker {2}{R} (You may pay an additional {2}{R} as you cast this spell.)\nFirst strike\n${TEXT}`,
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
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 25111.
//
// Rulings:
//   [2004-10-04] If the Kavu Titan was kicked, it enters with trample and will keep this ability
//     until it leaves the battlefield.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.

const TEXT = "If this creature was kicked, it enters with three +1/+1 counters on it and with trample.";

// Pouncing Wurm's shape: "enters … with trample" is trample for as long as it
// stays (the ruling), a static gated on its having entered kicked.
export default defineCard({
  name: "Kavu Titan",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}{G}" },
  text: `Kicker {2}{G} (You may pay an additional {2}{G} as you cast this spell.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 3, else: 0 } },
      },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-kicked" },
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});

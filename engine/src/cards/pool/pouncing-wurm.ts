import { defineCard } from "../define.js";

// EDHREC rank 23346.
//
// Rulings:
//   [2007-02-01] If the Pouncing Wurm is kicked, Pouncing Wurm has haste permanently.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.

const TEXT = "If this creature was kicked, it enters with three +1/+1 counters on it and with haste.";

// "Enters … with haste" is haste for as long as it stays (the 2007 ruling):
// a static gated on the permanent having entered kicked.
export default defineCard({
  name: "Pouncing Wurm",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 3,
  toughness: 3,
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
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});

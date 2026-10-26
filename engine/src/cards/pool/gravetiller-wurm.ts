import { defineCard } from "../define.js";

// EDHREC rank 22521. Blacksnag Buzzard's morbid entry replacement, four counters.

const MORBID = "Morbid — This creature enters with four +1/+1 counters on it if a creature died this turn.";

export default defineCard({
  name: "Gravetiller Wurm",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${MORBID}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "creature-died-this-turn" }, then: 4, else: 0 } },
      },
      text: MORBID,
    },
  ],
});

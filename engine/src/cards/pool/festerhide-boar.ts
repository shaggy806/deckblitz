import { defineCard } from "../define.js";

// EDHREC rank 25658. Gravetiller Wurm's morbid entry replacement, two counters.

const MORBID = "Morbid — This creature enters with two +1/+1 counters on it if a creature died this turn.";

export default defineCard({
  name: "Festerhide Boar",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${MORBID}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "creature-died-this-turn" }, then: 2, else: 0 } },
      },
      text: MORBID,
    },
  ],
});

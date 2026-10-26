import { defineCard } from "../define.js";

// EDHREC rank 25797.
const MORBID = "Morbid — This creature enters with two +1/+1 counters on it if a creature died this turn.";

export default defineCard({
  name: "Somberwald Spider",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${MORBID}`,
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

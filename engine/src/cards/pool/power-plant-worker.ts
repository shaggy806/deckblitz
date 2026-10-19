import { defineCard } from "../define.js";

// The Brothers' War. The Workers are checked as the ability resolves (the
// ruling): at least one creature named Mine Worker and at least one named
// Tower Worker under your control means two +1/+1 counters instead of +2/+2.
const PUMP_TEXT =
  "{3}: This creature gets +2/+2 until end of turn. If you control creatures named Mine Worker and " +
  "Tower Worker, put two +1/+1 counters on this creature instead. Activate only once each turn.";

export default defineCard({
  name: "Power Plant Worker",
  manaCost: "{5}",
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 4,
  toughness: 4,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "controls", filter: { type: "creature", name: "Mine Worker" }, atLeast: 1 },
            { kind: "controls", filter: { type: "creature", name: "Tower Worker" }, atLeast: 1 },
          ],
        },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        else: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      },
      resolve: null,
      text: PUMP_TEXT,
      oncePerTurn: true,
    },
  ],
});

import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2).
//
// Modular 2 spelled out as the other Arcbound cards' is (rule 702.43a). "A
// spell other than your first spell each turn" is part of the trigger
// condition (Geralf, the Fleshwright's shape): two or more spells cast this
// turn, this one included — which counts the spells cast before the Tracker
// arrived (the first ruling).
const CAST_TEXT =
  "Whenever you cast a spell other than your first spell each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Arcbound Tracker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Dog"],
  power: 0,
  toughness: 0,
  keywords: ["menace"],
  text: `Menace\nModular 2 (This creature enters with two +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "may",
        prompt: "Put this creature's +1/+1 counters on target artifact creature?",
        effect: {
          kind: "add-counter",
          target: 0,
          counter: "+1/+1",
          amount: { countersOn: "source", counter: "+1/+1" },
        },
      },
      resolve: null,
      text: "Modular 2",
    },
    {
      trigger: { on: "cast-spell", who: "you" },
      whileCondition: { kind: "turn-stat", stat: "spells-cast", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "Modular 2",
    },
  ],
});

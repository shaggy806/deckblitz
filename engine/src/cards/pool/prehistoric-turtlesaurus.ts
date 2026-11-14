import { defineCard } from "../define.js";

// EDHREC rank 26748. Winged Words' reduction, Starport Security's condition.
export default defineCard({
  name: "Prehistoric Turtlesaurus",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle", "Dinosaur"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance"],
  text: "This spell costs {1} less to cast if you control a creature with a +1/+1 counter on it.\nVigilance (Attacking doesn't cause this creature to tap.)",
  selfCostReduction: {
    condition: {
      kind: "controls",
      filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      atLeast: 1,
    },
    reduceGeneric: 1,
  },
});

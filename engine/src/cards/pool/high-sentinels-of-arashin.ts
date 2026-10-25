import { defineCard } from "../define.js";

// EDHREC rank 15856.
//
// +1/+1 per other creature with a +1/+1 counter, however many counters it
// has (the ruling). The activated ability may target this creature itself.

const PER_COUNT = "This creature gets +1/+1 for each other creature you control with a +1/+1 counter on it.";
const COUNTER = "{3}{W}: Put a +1/+1 counter on target creature.";

export default defineCard({
  name: "High Sentinels of Arashin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PER_COUNT}\n${COUNTER}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        pt: [1, 1],
        excludeSelf: true,
      },
      text: PER_COUNT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER,
    },
  ],
});

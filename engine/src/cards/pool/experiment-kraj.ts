import { defineCard } from "../define.js";

// Every other creature with a +1/+1 counter, with all the activated abilities
// it has — granted ones too. Two Krajs (or Kraj and Marvin) reading each
// other apply in timestamp order (rule 613.8b).
const GRANT_TEXT = "Experiment Kraj has all activated abilities of each other creature with a +1/+1 counter on it.";
const COUNTER_TEXT = "{T}: Put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Experiment Kraj",
  manaCost: "{2}{G}{G}{U}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze", "Mutant"],
  power: 4,
  toughness: 6,
  text: `${GRANT_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: {
        zone: "battlefield",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});

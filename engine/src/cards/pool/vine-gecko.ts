import { defineCard } from "../define.js";

// EDHREC rank 20144. "The first kicked spell you cast each turn" is a cost
// modification reaching a kicked cast (`when.kicked`, rule 702.33d: kicking
// is announced before the total cost is worked out, 601.2b before 601.2f)
// that no earlier kicked spell of this turn has used up (`firstEachTurn`).
// The {1} comes off the total, kicker cost included.

const REDUCE_TEXT = "The first kicked spell you cast each turn costs {1} less to cast.";
const CAST_TEXT = "Whenever you cast a kicked spell, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Vine Gecko",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Lizard"],
  power: 2,
  toughness: 2,
  text: `${REDUCE_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 1, when: { caster: "you", kicked: true, firstEachTurn: true } },
      text: REDUCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

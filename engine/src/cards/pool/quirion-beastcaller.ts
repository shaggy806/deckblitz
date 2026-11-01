import { defineCard } from "../define.js";

const CAST_TEXT = "Whenever you cast a creature spell, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  "When this creature dies, distribute X +1/+1 counters among any number of target creatures you control, where X is the number of +1/+1 counters on this creature.";

// X is read as the dies trigger is put on the stack, when the division is
// announced (rules 603.3d, 601.2d) — the counters it died with (608.2h).
export default defineCard({
  name: "Quirion Beastcaller",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${CAST_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "any-number", of: "creature-you-control" }],
      divided: { total: { countersOn: "source", counter: "+1/+1" }, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

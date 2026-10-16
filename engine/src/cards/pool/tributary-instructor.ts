import { defineCard } from "../define.js";

// EDHREC rank 8516.
//
// Rulings:
//   [2023-11-10] If the target creature's power is no longer less than the attacking creature's
//     power as the ability resolves, mentor doesn't add a +1/+1 counter. For example, if two 3/3
//     creatures with mentor attack and both mentor triggers target the same 2/2 creature, the
//     first to resolve puts a +1/+1 counter on it and the second does nothing.
//   [2023-11-10] If the creature with mentor leaves the battlefield with mentor on the stack, use
//     its power as that creature last existed on the battlefield to determine whether the target
//     creature has less power.
//   [2023-11-10] Mentor compares the power of the creature with mentor with that of the target
//     creature at two different times: once as the triggered ability is put onto the stack, and
//     once as the triggered ability resolves. If you wish to raise a creature's power so its
//     mentor ability can target a bigger creature, the last chance you have to do so is during the
//     beginning of combat step.

// Mentor is Legion Warboss's shape (rule 702.134a): the target's power is
// compared with this creature's as the trigger goes on the stack and again as
// it resolves, as it last existed if it has left. The dies trigger is
// Meltstrider Eulogist's, read as the creature last existed.
const MENTOR_TEXT =
  "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)";
const DIES_TEXT = "Whenever a creature you control with a +1/+1 counter on it dies, draw a card.";

export default defineCard({
  name: "Tributary Instructor",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 4,
  toughness: 4,
  text: `${MENTOR_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", attacking: true, power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: MENTOR_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 21478.
//
// Rulings:
//   [2012-05-01] You don't have to sacrifice another creature, even if you control one. You may
//     choose to exile Demonlord of Ashmouth.
//   [2012-05-01] Demonlord of Ashmouth's "enters" ability will trigger no matter how it entered,
//     including because of its undying ability.
//
// Apocalypse Demon's "unless you sacrifice another creature" (an optional
// sacrifice its controller may decline — the first ruling), with exiling the
// source as the otherwise; Butcher Ghoul's undying.

export default defineCard({
  name: "Demonlord of Ashmouth",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, exile it unless you sacrifice another creature.\nUndying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        otherwise: { kind: "exile", target: "source" },
      },
      resolve: null,
      text: "When this creature enters, exile it unless you sacrifice another creature.",
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
    },
  ],
});

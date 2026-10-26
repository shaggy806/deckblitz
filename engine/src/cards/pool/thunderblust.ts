import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 14193.
//
// Persist is Glen Elendra Archmage's trigger; the trample is Baloth Pup's
// self-counters static, on -1/-1 counters.

export default defineCard({
  name: "Thunderblust",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nThis creature has trample as long as it has a -1/-1 counter on it.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "gte", n: 1 } },
      grantKeywords: ["trample"],
      text: "This creature has trample as long as it has a -1/-1 counter on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "Persist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
    },
  ],
});

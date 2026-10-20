import { defineCard } from "../define.js";

// EDHREC rank 9636.
//
// "Slurrk or another creature you control" is any creature you control, Slurrk
// included: one dies trigger. "If it had a +1/+1 counter on it" is read off the
// creature as it last existed (Rayblade Trooper's filter) — a past fact, so it
// holds the same at resolution as when it triggered.

const ENTER_TEXT = "Slurrk enters with five +1/+1 counters on it.";
const DIES_TEXT =
  "Whenever Slurrk or another creature you control dies, if it had a +1/+1 counter on it, put a +1/+1 counter on each creature you control that has a +1/+1 counter on it.";
const WITH_COUNTER = { kind: "+1/+1", compare: { op: "gte", n: 1 } } as const;

export default defineCard({
  name: "Slurrk, All-Ingesting",
  manaCost: "{5}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  pairing: { kind: "partner" },
  text: `${ENTER_TEXT}\n${DIES_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", counters: WITH_COUNTER } },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", counters: WITH_COUNTER },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: ENTER_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 10267. Zendikar Rising.
//
// "If it had a +1/+1 counter on it" is read off the dying creature as it last
// existed (Slurrk's filter shape — that can't change before it resolves), and
// one counter however many it had (the ruling). The Hydra's X is the +1/+1
// counters on Grakmaw as it last existed: a state-based check that kills it
// with -1/-1 counters leaves it with both kinds still on (rule 704.5q is done
// only on what stays — the ruling).

const ENTER_TEXT = "Grakmaw enters with three +1/+1 counters on it.";
const COUNTER_TEXT =
  "Whenever another creature you control dies, if it had a +1/+1 counter on it, put a +1/+1 counter on Grakmaw.";
const DIES_TEXT =
  "When Grakmaw dies, create an X/X black and green Hydra creature token, where X is the number of +1/+1 counters on Grakmaw.";

export default defineCard({
  name: "Grakmaw, Skyclave Ravager",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hydra", "Horror"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${COUNTER_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Hydra Token (Black-Green)",
        count: 1,
        basePt: {
          power: { countersOn: "source", counter: "+1/+1" },
          toughness: { countersOn: "source", counter: "+1/+1" },
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Star Trek Commander (TRC). McCoy is a Doctor, so "McCoy or another Doctor
// you control" is any Doctor you control entering, McCoy included.

const ENTERS_TEXT =
  "Whenever McCoy or another Doctor you control enters, put a +1/+1 counter on each creature you control.";
const LIFELINK_TEXT = "Creatures you control with counters on them have lifelink.";

export default defineCard({
  name: "McCoy, Not a Bricklayer",
  manaCost: "{3}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 0,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${LIFELINK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Doctor" } },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["lifelink"],
      text: LIFELINK_TEXT,
    },
  ],
});

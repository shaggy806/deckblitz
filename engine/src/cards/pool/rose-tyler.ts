import { defineCard } from "../define.js";

const BAD_WOLF_TEXT =
  "Bad Wolf — Whenever Rose Tyler attacks, put a time counter on it for each suspended card you own and each other permanent you control with a time counter on it.";

export default defineCard({
  name: "Rose Tyler",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `Rose Tyler gets +1/+1 for each time counter on it.\n${BAD_WOLF_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { countersOnSource: "time", pt: [1, 1] },
      text: "Rose Tyler gets +1/+1 for each time counter on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "time",
        amount: {
          sum: [
            { suspendedCardsYouOwn: true },
            {
              countOf: { controlledBy: "you", counters: { kind: "time", compare: { op: "gte", n: 1 } } },
              excludeSelf: true,
            },
          ],
        },
      },
      resolve: null,
      text: BAD_WOLF_TEXT,
    },
  ],
});

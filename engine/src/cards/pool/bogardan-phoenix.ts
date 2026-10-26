import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 27522.
//
// Rulings:
//   [2006-02-01] Errata streamlined the trigger and got rid of the replacement effect. In both
//     cases, it will go to the graveyard. In one it will then come back onto the battlefield; in
//     the other it will then be exiled.
//
// One dies trigger, its branch read as it resolves off the creature as it
// last existed (rule 603.10a — `self-counters` reads the last-known
// counters, as Retched Wretch's does). The death counter is put on after it
// returns, as the card says, not as it enters.
const DIES_TEXT =
  "When this creature dies, exile it if it had a death counter on it. Otherwise, return it to the battlefield under your control and put a death counter on it.";

export default defineCard({
  name: "Bogardan Phoenix",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "death", compare: { op: "gte", n: 1 } },
        then: { kind: "exile", target: "trigger-object" },
        else: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
            { kind: "add-counter", target: "trigger-object", counter: "death", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

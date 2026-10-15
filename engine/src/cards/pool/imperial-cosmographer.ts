import { defineCard } from "../define.js";

// EDHREC rank 30245.
//
// "Without dying" is every destination but a graveyard (rule 700.4: dies
// means put into a graveyard from the battlefield) — Taeko, the Patient
// Avalanche's shape. A commander bound for a hand or library that goes to
// the command zone instead (rule 903.9b) left without dying; one that died
// and was then moved there (903.9a) died.

const LEAVE_TEXT =
  "Whenever another creature you control leaves the battlefield without dying, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Imperial Cosmographer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kree", "Scientist"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
        to: ["exile", "hand", "library", "command"],
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});

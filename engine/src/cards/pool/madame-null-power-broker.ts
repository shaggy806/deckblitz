import { defineCard } from "../define.js";

// EDHREC rank 9824.
//
// Rulings:
//   [2026-01-27] Use the creature's power as Madame Null's last ability resolves to determine how
//     much life you may pay. If that creature is no longer on the battlefield, use its power as it
//     last existed on the battlefield. (You probably won't want to pay life in that case, though.)
//
// The power is read as the `may` is answered (the ruling) — as the creature
// last existed if it has left — and the same number of counters goes on; the
// life is a cost of the "may" (Crossway Troublemakers' `costLife`), so it
// can't be paid with too little life (rule 119.4).
const POWER = { powerOf: "trigger-object" } as const;

export default defineCard({
  name: "Madame Null, Power Broker",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Advisor"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhenever another creature you control enters, you may pay life equal to its power. If you do, put that many +1/+1 counters on it.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay life equal to its power to put that many +1/+1 counters on it?",
        costLife: POWER,
        effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: POWER },
      },
      resolve: null,
      text: "Whenever another creature you control enters, you may pay life equal to its power. If you do, put that many +1/+1 counters on it.",
    },
  ],
});

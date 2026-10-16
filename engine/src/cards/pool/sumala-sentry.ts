import { defineCard } from "../define.js";

// EDHREC rank 23590.
//
// Rulings:
//   [2024-02-02] If the permanent that was turned face up is no longer on the battlefield when
//     Sumala Sentry's triggered ability resolves, you'll still put a +1/+1 counter on Sumala
//     Sentry. Similarly, if Sumala Sentry is no longer on the battlefield, you'll still put a
//     +1/+1 counter on the permanent that turned face up.
//
// Only a face-down permanent can be turned face up, so Growing Dread's
// `turned-face-up` trigger is the whole condition; each counter is its own
// step, so one missing doesn't stop the other (the ruling).

const TEXT =
  "Whenever a face-down permanent you control is turned face up, put a +1/+1 counter on it and a +1/+1 counter on this creature.";

export default defineCard({
  name: "Sumala Sentry",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

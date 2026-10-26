import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 26158.
//
// Rulings:
//   Only puts counters on creatures your opponents control, so in the Two-Headed Giant format,
//     won't put counters on your teammate's creatures.

const TEXT = "At the beginning of your upkeep, put a +1/+1 counter on each creature each opponent controls.";

export default defineCard({
  name: "Aku Djinn",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "opponent" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

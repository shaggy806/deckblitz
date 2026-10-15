import { defineCard } from "../define.js";

// EDHREC rank 18734.
//
// Rulings:
//   [2025-07-25] Flight-Deck Coordinator’s ability will check as your end step starts to see if
//     you control two or more tapped creatures. If you don’t, the ability won’t trigger at all.
//     You won’t be able to tap anything during your end step in time to have the ability trigger.
//     If you don’t control two or more tapped creatures when the ability resolves, the ability
//     won’t do anything.
//
// Sami, Ship's Engineer's intervening-if (rule 603.4).

const END_TEXT = "At the beginning of your end step, if you control two or more tapped creatures, you gain 2 life.";

export default defineCard({
  name: "Flight-Deck Coordinator",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: END_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", tapped: true }, atLeast: 2 },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});

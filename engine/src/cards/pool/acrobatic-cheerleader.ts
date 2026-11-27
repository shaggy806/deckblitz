import { defineCard } from "../define.js";

// EDHREC rank 23061. Survival (Cautious Survivor's shape) that "triggers only
// once" — ever, for this object (`triggersOnlyOnce`; rule 400.7: back after a
// zone change, it's a new object that may trigger again).
//
// Rulings:
//   If a creature with a survival ability isn't tapped when your second main
//     phase begins, the ability won't trigger at all.
//   If its survival ability triggers but it's untapped as the ability
//     resolves, the ability does nothing (the intervening if, rule 603.4).
const SURVIVAL =
  "Survival — At the beginning of your second main phase, if this creature is tapped, put a flying counter on it. This ability triggers only once.";

export default defineCard({
  name: "Acrobatic Cheerleader",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 2,
  toughness: 2,
  text: SURVIVAL,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "source", filter: { tapped: true } },
        ],
      },
      triggersOnlyOnce: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "flying", amount: 1 },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});

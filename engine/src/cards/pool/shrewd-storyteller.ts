import { defineCard } from "../define.js";

// EDHREC rank 17841.

const SURVIVAL =
  "Survival — At the beginning of your second main phase, if this creature is tapped, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Shrewd Storyteller",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 3,
  toughness: 3,
  text: SURVIVAL,
  triggered: [
    {
      // Survival (Cynical Loner's shape): the second main phase only, and an
      // intervening-if on this creature being tapped.
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "source", filter: { tapped: true } },
        ],
      },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});

import { defineCard } from "../define.js";

// Ravnica Allegiance. Cornered Crook's shape: the trigger has no target, the
// sacrifice is offered as it resolves, and the reflexive trigger picks its
// target once a creature was sacrificed (the ruling — rule 603.12).
const TEXT =
  "At the beginning of your upkeep, you may sacrifice a creature. When you do, this creature deals 2 damage to target opponent or planeswalker.";

export default defineCard({
  name: "Fireblade Artist",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["opponent-or-planeswalker"],
          effect: { kind: "damage", amount: 2, target: 0 },
          text: "When you do, this creature deals 2 damage to target opponent or planeswalker.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

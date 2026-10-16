import { defineCard } from "../define.js";

// EDHREC rank 15677.
//
// Rulings:
//   [2024-09-20] If a creature's survival ability triggers but that creature is untapped when the
//     ability begins to resolve, that ability won't do anything.
//   [2024-09-20] If a creature's survival ability triggers but the creature leaves the battlefield
//     before the ability resolves, use its tapped or untapped status as it last existed on the
//     battlefield to determine whether or not the ability will do anything.
//   [2024-09-20] Survival abilities (and other abilities that trigger at the beginning of your
//     second main phase) will trigger at the beginning of the second main phase you take in a
//     turn. They won't trigger during your third, fourth, or other additional main phases in a
//     single turn, if effects somehow cause you to have more than two main phases.
//   [2024-09-20] If a creature with a survival ability isn't tapped when your second main phase
//     begins, the ability won't trigger at all. You won't be able to tap it during your second
//     main phase in time to have that ability trigger.
//
// Survival is Cynical Loner's shape. Whether you control a Glimmer creature
// is read as it resolves: a card, or else a Glimmer token.
const SURVIVAL =
  "Survival — At the beginning of your second main phase, if this creature is tapped, draw a card if you control a Glimmer creature. If you don't control a Glimmer creature, create a 1/1 white Glimmer enchantment creature token.";

export default defineCard({
  name: "Glimmer Seeker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 3,
  toughness: 3,
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
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", subtype: "Glimmer" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
        else: { kind: "create-token", token: "Glimmer Token", count: 1 },
      },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 19714.
//
// Rulings:
//   [2024-09-20] If a creature with a survival ability isn't tapped when your second main phase
//     begins, the ability won't trigger at all. You won't be able to tap it during your second
//     main phase in time to have that ability trigger.
//   [2024-09-20] If a creature's survival ability triggers but that creature is untapped when the
//     ability begins to resolve, that ability won't do anything.
//   [2024-09-20] If a creature's survival ability triggers but the creature leaves the battlefield
//     before the ability resolves, use its tapped or untapped status as it last existed on the
//     battlefield to determine whether or not the ability will do anything.
//   [2024-09-20] Survival abilities (and other abilities that trigger at the beginning of your
//     second main phase) will trigger at the beginning of the second main phase you take in a
//     turn. They won't trigger during your third, fourth, or other additional main phases in a
//     single turn, if effects somehow cause you to have more than two main phases.

const SURVIVAL =
  "Survival — At the beginning of your second main phase, if this creature is tapped, you gain 2 life.";

export default defineCard({
  name: "Cautious Survivor",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Survivor"],
  power: 4,
  toughness: 4,
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
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});

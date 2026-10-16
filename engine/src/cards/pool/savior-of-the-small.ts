import { defineCard } from "../define.js";

// EDHREC rank 17289.
//
// Rulings:
//   [2024-09-20] If a creature's survival ability triggers but that creature is untapped when the
//     ability begins to resolve, that ability won't do anything.
//   [2024-09-20] If the mana cost of a card in your graveyard includes {X}, X is 0 for the purpose
//     of determining its mana value.
//   [2024-09-20] Survival abilities (and other abilities that trigger at the beginning of your
//     second main phase) will trigger at the beginning of the second main phase you take in a
//     turn. They won't trigger during your third, fourth, or other additional main phases in a
//     single turn, if effects somehow cause you to have more than two main phases.
//   [2024-09-20] If a creature with a survival ability isn't tapped when your second main phase
//     begins, the ability won't trigger at all. You won't be able to tap it during your second
//     main phase in time to have that ability trigger.
//   [2024-09-20] If a creature's survival ability triggers but the creature leaves the battlefield
//     before the ability resolves, use its tapped or untapped status as it last existed on the
//     battlefield to determine whether or not the ability will do anything.

const SURVIVAL =
  "Survival — At the beginning of your second main phase, if this creature is tapped, return target creature card with mana value 3 or less from your graveyard to your hand.";

export default defineCard({
  name: "Savior of the Small",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Survivor"],
  power: 3,
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
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});

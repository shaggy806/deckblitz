import { defineCard } from "../define.js";

// EDHREC rank 8844.
//
// Rulings:
//   [2024-09-20] If a creature's survival ability triggers but that creature is untapped when the
//     ability begins to resolve, that ability won't do anything.
//   [2024-09-20] If a creature with a survival ability isn't tapped when your second main phase
//     begins, the ability won't trigger at all. You won't be able to tap it during your second
//     main phase in time to have that ability trigger.
//   [2024-09-20] Once Cynical Loner has been blocked by a creature, giving that creature the
//     Glimmer creature type won't cause Cynical Loner to become unblocked.
//   [2024-09-20] Survival abilities (and other abilities that trigger at the beginning of your
//     second main phase) will trigger at the beginning of the second main phase you take in a
//     turn. They won't trigger during your third, fourth, or other additional main phases in a
//     single turn, if effects somehow cause you to have more than two main phases.
//   [2024-09-20] If a creature's survival ability triggers but the creature leaves the battlefield
//     before the ability resolves, use its tapped or untapped status as it last existed on the
//     battlefield to determine whether or not the ability will do anything.

const GLIMMERS = "This creature can't be blocked by Glimmers.";
const SURVIVAL =
  "Survival — At the beginning of your second main phase, if this creature is tapped, you may search your library for a card, put it into your graveyard, then shuffle.";

export default defineCard({
  name: "Cynical Loner",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 3,
  toughness: 1,
  text: `${GLIMMERS}\n${SURVIVAL}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { subtype: "Glimmer" }, text: GLIMMERS }],
  triggered: [
    {
      // Survival (Kona, Rescue Beastie's shape): the second main phase only,
      // and an intervening-if on this creature being tapped.
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
        kind: "may",
        prompt: "Search your library for a card and put it into your graveyard?",
        effect: { kind: "search-library", filter: {}, destination: "graveyard", min: 0, max: 1 },
      },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});

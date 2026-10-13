import { defineCard } from "../define.js";

// EDHREC rank 7887.
//
// Rulings:
//   [2024-09-20] An ability that triggers "whenever you fully unlock a Room" triggers when a door
//     becomes unlocked and the other door of that Room is already unlocked, or when both doors of
//     that Room become unlocked simultaneously.
//   [2024-09-20] If a permanent with an eerie ability enters at the same time as one or more
//     enchantments, its ability will trigger for each of those enchantments.

const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, each opponent loses 1 life.";
const DRAIN = { kind: "lose-life", amount: 1, who: "each-opponent" } as const;

export default defineCard({
  name: "Balemurk Leech",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 2,
  toughness: 2,
  text: EERIE,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: DRAIN,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: [],
      effect: DRAIN,
      resolve: null,
      text: EERIE,
    },
  ],
});

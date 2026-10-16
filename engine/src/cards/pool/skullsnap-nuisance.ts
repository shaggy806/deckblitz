import { defineCard } from "../define.js";

// EDHREC rank 15520.
//
// Rulings:
//   [2024-09-20] An ability that triggers "whenever you fully unlock a Room" triggers when a door
//     becomes unlocked and the other door of that Room is already unlocked, or when both doors of
//     that Room become unlocked simultaneously.
//   [2024-09-20] If a permanent with an eerie ability enters at the same time as one or more
//     enchantments, its ability will trigger for each of those enchantments.
//
// Eerie is one ability with two trigger events (Entity Tracker's shape).
const EERIE = "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, surveil 1.";

export default defineCard({
  name: "Skullsnap Nuisance",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Insect", "Skeleton"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${EERIE} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: EERIE,
    },
  ],
});

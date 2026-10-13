import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 9444. Eerie is one ability with two trigger events, written as
// two entries (`sameAbilityAs`) — Entity Tracker's shape.
//
// Rulings:
//   [2024-09-20] An ability that triggers "whenever you fully unlock a Room" triggers when a door
//     becomes unlocked and the other door of that Room is already unlocked, or when both doors of
//     that Room become unlocked simultaneously.
//   [2024-09-20] If a permanent with an eerie ability enters at the same time as one or more
//     enchantments, its ability will trigger for each of those enchantments.
const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, put a +1/+1 counter on target creature.";

const COUNTER: EffectSpec = { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 };

export default defineCard({
  name: "Optimistic Scavenger",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 1,
  toughness: 1,
  text: EERIE,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: COUNTER,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: ["creature"],
      effect: COUNTER,
      resolve: null,
      text: EERIE,
    },
  ],
});

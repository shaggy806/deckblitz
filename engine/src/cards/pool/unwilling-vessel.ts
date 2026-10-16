import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 17049.
//
// Rulings:
//   [2024-09-20] If a permanent with an eerie ability enters at the same time as one or more
//     enchantments, its ability will trigger for each of those enchantments.
//   [2024-09-20] In the unusual case where Unwilling Vessel has +1/+1 counters on it and then
//     receives an amount of -1/-1 counters that causes it to die, use the total number of counters
//     that were on Unwilling Vessel when it died, including all of the +1/+1 and -1/-1 counters,
//     to determine the value of X.
//   [2024-09-20] An ability that triggers "whenever you fully unlock a Room" triggers when a door
//     becomes unlocked and the other door of that Room is already unlocked, or when both doors of
//     that Room become unlocked simultaneously.

const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, put a possession counter on this creature.";
const DIES =
  "When this creature dies, create an X/X blue Spirit creature token with flying, where X is the number of counters on this creature.";

const POSSESSION: EffectSpec = { kind: "add-counter", target: "source", counter: "possession", amount: 1 };
/** Every counter of every kind it died with (last-known information) — its
 * +1/+1 and -1/-1 counters too (the ruling). */
const X = { countersOn: "source" } as const;

export default defineCard({
  name: "Unwilling Vessel",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${EERIE}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: POSSESSION,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: [],
      effect: POSSESSION,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Spirit Token (Unwilling Vessel)",
        count: 1,
        basePt: { power: X, toughness: X },
      },
      resolve: null,
      text: DIES,
    },
  ],
});

import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 24982. Eerie is one ability with two trigger events, written as
// two entries (`sameAbilityAs`) — Entity Tracker's shape; the effect is
// Krotiq Nestguard's.
//
// Rulings:
//   An ability that triggers "whenever you fully unlock a Room" triggers when a door becomes
//     unlocked and the other door of that Room is already unlocked, or when both doors of that
//     Room become unlocked simultaneously.
//   If a permanent with an eerie ability enters at the same time as one or more enchantments, its
//     ability will trigger for each of those enchantments.
const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, this creature can attack this turn as though it didn't have defender.";

const ATTACK: EffectSpec = { kind: "attack-despite-defender", target: "source" };

export default defineCard({
  name: "Stalked Researcher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${EERIE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: ATTACK,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: [],
      effect: ATTACK,
      resolve: null,
      text: EERIE,
    },
  ],
});

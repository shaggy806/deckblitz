import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22297. Eerie is one ability with two trigger events, written as
// two entries (`sameAbilityAs`) — Entity Tracker's shape.
//
// Rulings:
//   An ability that triggers "whenever you fully unlock a Room" triggers when a door becomes
//     unlocked and the other door of that Room is already unlocked, or when both doors of that
//     Room become unlocked simultaneously.
//   If a permanent with an eerie ability enters at the same time as one or more enchantments, its
//     ability will trigger for each of those enchantments.
const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, this creature gets +1/+1 until end of turn.";

const PUMP: EffectSpec = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" };

export default defineCard({
  name: "Erratic Apparition",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${EERIE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: EERIE,
    },
  ],
});

import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22001. Eerie is one ability with two trigger events, written as
// two entries (`sameAbilityAs`) — Entity Tracker's shape.
//
// Rulings:
//   Multiple instances of lifelink on the same creature are redundant.
//   An ability that triggers "whenever you fully unlock a Room" triggers when a door becomes
//     unlocked and the other door of that Room is already unlocked, or when both doors of that
//     Room become unlocked simultaneously.
//   If a permanent with an eerie ability enters at the same time as one or more enchantments, its
//     ability will trigger for each of those enchantments.
const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, this creature gains lifelink until end of turn.";

const LIFELINK: EffectSpec = { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" };

export default defineCard({
  name: "Cult Healer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 3,
  toughness: 3,
  text: EERIE,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: LIFELINK,
      resolve: null,
      text: EERIE,
    },
    {
      trigger: { on: "door-unlocked", who: "you-control", fully: true },
      sameAbilityAs: 0,
      targets: [],
      effect: LIFELINK,
      resolve: null,
      text: EERIE,
    },
  ],
});

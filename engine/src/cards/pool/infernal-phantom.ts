import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22585. Eerie is one ability with two trigger events, written as
// two entries (`sameAbilityAs`) — Entity Tracker's shape. The dies trigger is
// Juri, Master of the Revue's: its power as it last existed on the battlefield.
//
// Rulings:
//   If a permanent with an eerie ability enters at the same time as one or more enchantments, its
//     ability will trigger for each of those enchantments.
//   An ability that triggers "whenever you fully unlock a Room" triggers when a door becomes
//     unlocked and the other door of that Room is already unlocked, or when both doors of that
//     Room become unlocked simultaneously.
//   Use Infernal Phantom's power as it last existed on the battlefield to determine how much
//     damage it deals due to its last ability.
const EERIE =
  "Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, this creature gets +2/+0 until end of turn.";
const DIES_TEXT = "When this creature dies, it deals damage equal to its power to any target.";

const PUMP: EffectSpec = { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" };

export default defineCard({
  name: "Infernal Phantom",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: `${EERIE}\n${DIES_TEXT}`,
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
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 2666.
//
// Rulings:
//   The damage Questing Beast deals to the target planeswalker as its last ability resolves
//   isn't combat damage.
//   Questing Beast only stops combat damage from being prevented by effects that specifically
//   use the word "prevent."
//   If the opponent dealt damage controls no planeswalkers, Questing Beast's last ability
//   simply does nothing.
const UNBLOCK_TEXT = "Questing Beast can't be blocked by creatures with power 2 or less.";
const UNPREVENT_TEXT = "Combat damage that would be dealt by creatures you control can't be prevented.";
const TRIGGER_TEXT =
  "Whenever Questing Beast deals combat damage to an opponent, it deals that much damage to target planeswalker that player controls.";

export default defineCard({
  name: "Questing Beast",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance", "deathtouch", "haste"],
  text: `Vigilance, deathtouch, haste\n${UNBLOCK_TEXT}\n${UNPREVENT_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    { affects: { scope: "self" }, cantBeBlockedBy: { power: { op: "lte", n: 2 } }, text: UNBLOCK_TEXT },
    {
      affects: { scope: "self" },
      damageCantBePrevented: { by: { type: "creature", controlledBy: "you" }, combat: true },
      text: UNPREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "planeswalker" } }],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

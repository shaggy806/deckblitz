import { defineCard } from "../define.js";

// EDHREC rank 19158.
//
// Rulings:
//   [2025-07-25] Illvoi Infiltrator’s first ability will count any spells you’ve cast this turn,
//     which may include Illvoi Infiltrator itself. It doesn’t matter if the other spells resolved,
//     didn’t resolve, were countered, or are still on the stack.

const UNBLOCKABLE_TEXT = "This creature can't be blocked if you've cast two or more spells this turn.";
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Illvoi Infiltrator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish", "Rogue"],
  power: 1,
  toughness: 3,
  text: `${UNBLOCKABLE_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", atLeast: 2 },
      cantBeBlockedBy: {},
      text: UNBLOCKABLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});

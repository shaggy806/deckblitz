import { defineCard } from "../define.js";

// EDHREC rank 16247.
//
// Rulings:
//   [2025-07-25] Station Monitor's ability resolves before the spell that caused it to trigger.
//     It resolves even if that spell is countered or otherwise leaves the stack without resolving.
//   [2025-07-25] Station Monitor's ability will count any spells you've cast this turn, which may
//     include Station Monitor itself.
//
// Kraum's `nthEachTurn: 2`: the caster's second spell of the turn, counting
// the ones cast before this permanent arrived.

const CAST_TEXT =
  'Whenever you cast your second spell each turn, create a 1/1 colorless Drone artifact creature token with flying and "This token can block only creatures with flying."';

export default defineCard({
  name: "Station Monitor",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Lizard", "Artificer"],
  power: 2,
  toughness: 2,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Drone Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

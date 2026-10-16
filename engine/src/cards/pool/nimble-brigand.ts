import { defineCard } from "../define.js";

// EDHREC rank 16384. Read as blockers are declared: once it's blocked, a
// crime afterwards doesn't unblock it (the ruling).
const EVASION_TEXT = "This creature can't be blocked if you've committed a crime this turn.";
const DRAW_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Nimble Brigand",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 3,
  text: `${EVASION_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "committed-crime-this-turn" },
      cantBeBlockedBy: {},
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

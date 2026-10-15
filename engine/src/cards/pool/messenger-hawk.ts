import { defineCard } from "../define.js";

// EDHREC rank 24290.
//
// Rulings:
//   [2025-10-02] Messenger Hawk's last ability applies even if you drew two or more cards only
//     before Messenger Hawk entered.
//   [2025-10-02] Creating a Clue token this way isn't the same thing as investigating.

const ETB_TEXT = "When this creature enters, create a Clue token.";
const PUMP_TEXT = "This creature gets +2/+0 as long as you've drawn two or more cards this turn.";

export default defineCard({
  name: "Messenger Hawk",
  manaCost: "{2}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT} (It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantPt: [2, 0],
      text: PUMP_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 11308.
// "Less than half their starting life total" is strictly under half, which
// may be a fraction (`atMost: "below-half-starting"`). Both abilities are read
// continuously, so damage dealt at once to Anya and an opponent is judged
// with the new totals before state-based actions (its rulings).
//
// Rulings:
//   If a player's starting life total is odd, half that player's life total will be a fraction,
//     and that's okay. For example, if an opponent's starting life total is 41, half that number
//     is 20 1/2. If that player's life total is 20 or less, Anya will have indestructible.

const BELOW_HALF = { kind: "life-total", who: "that-player", atMost: "below-half-starting" } as const;
const PUMP_TEXT = "Anya gets +3/+3 for each opponent whose life total is less than half their starting life total.";
const INDESTRUCTIBLE_TEXT =
  "As long as an opponent's life total is less than half their starting life total, Anya has indestructible.";

export default defineCard({
  name: "Anya, Merciless Angel",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}\n${INDESTRUCTIBLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { opponents: { where: BELOW_HALF }, pt: [3, 3] },
      text: PUMP_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", who: "opponent", atMost: "below-half-starting" },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
});

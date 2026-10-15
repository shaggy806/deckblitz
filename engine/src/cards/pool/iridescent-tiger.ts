import { defineCard } from "../define.js";

// EDHREC rank 21315.
//
// Rulings:
//   [2025-04-04] Iridescent Tiger’s ability isn’t a mana ability. It uses the stack and can be
//     responded to.
//   [2025-04-04] Iridescent Tiger’s ability triggers if you cast it from any zone. It doesn’t
//     trigger if you put Iridescent Tiger onto the battlefield without casting it.

const ENTER_TEXT = "When this creature enters, if you cast it, add {W}{U}{B}{R}{G}.";

export default defineCard({
  name: "Iridescent Tiger",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // "If you cast it", from any zone (the ruling) — an intervening-if.
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["W", "U", "B", "R", "G"] }, amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

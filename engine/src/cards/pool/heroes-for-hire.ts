import { defineCard } from "../define.js";

// EDHREC rank 19248. Marvel Super Heroes Commander.
//
// Professional Face-Breaker's "Sacrifice a Treasure" impulse ability.
const ENTER_TEXT = "When this enchantment enters, create three Treasure tokens.";
const SAC_TEXT = "Sacrifice a Treasure: Exile the top card of your library. You may play it this turn.";

export default defineCard({
  name: "Heroes for Hire",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} (They're artifacts with "{T}, Sacrifice this token: Add one mana of any color.")\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" } } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

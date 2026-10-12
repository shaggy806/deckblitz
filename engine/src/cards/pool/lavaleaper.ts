import { defineCard } from "../define.js";

// EDHREC rank 7194.
//
// Rulings:
//   [2025-11-17] Lavaleaper's last ability is a mana ability. It doesn't use the stack and can't
//     be responded to.

const MANA_TEXT =
  "Whenever a player taps a basic land for mana, that player adds one mana of any type that land produced.";

export default defineCard({
  name: "Lavaleaper",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: `All creatures have haste.\n${MANA_TEXT}`,
  static: [{ affects: { scope: "all-creatures" }, grantKeywords: ["haste"], text: "All creatures have haste." }],
  triggered: [
    {
      // Mana Flare's triggered mana ability, narrowed to basic lands.
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land", supertype: "basic" } },
      targets: [],
      effect: { kind: "add-mana", mana: "produced", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});

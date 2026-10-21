import { defineCard } from "../define.js";

// EDHREC rank 20454.
// Makes Blood → "Blood Token".
//
// Rulings:
//   Only the controller of Sigarda's Imprisonment may activate its activated ability.
//
// Dreadful Apathy's shape, then the Blood token.

const EXILE =
  '{4}{W}: Exile enchanted creature. Create a Blood token. (It\'s an artifact with "{1}, {T}, Discard a card, Sacrifice this token: Draw a card.")';

export default defineCard({
  name: "Sigarda's Imprisonment",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack or block.\n${EXILE}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "attached" },
          { kind: "create-token", token: "Blood Token", count: 1 },
        ],
      },
      resolve: null,
      text: EXILE,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
  ],
});

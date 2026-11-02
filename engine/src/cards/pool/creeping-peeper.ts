import { defineCard } from "../define.js";

// Rulings:
//   [2024-09-20] Mana produced by Creeping Peeper's activated ability can be used to pay morph or
//     disguise costs when turning a face-down permanent face up or to pay costs associated with
//     turning a manifested or cloaked permanent face up.

const TEXT = "{T}: Add {U}. Spend this mana only to cast an enchantment spell, unlock a door, or turn a permanent face up.";

export default defineCard({
  name: "Creeping Peeper",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Eye"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: {
          spell: { type: "enchantment" },
          purposes: ["unlock-door", "turn-face-up"],
          text: "Spend this mana only to cast an enchantment spell, unlock a door, or turn a permanent face up.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 8698.
//
// Rulings:
//   [2026-01-27] Groundchuck & Dirtbag's last ability is a mana ability. It doesn't use the stack
//     and can't be responded to.
//
// A triggered mana ability (rule 605.1b), as Zendikar Resurgent's and Mirari's
// Wake's: it resolves at once, off the stack, whatever the land made.
const MANA_TEXT = "Whenever you tap a land for mana, add {G}.";

export default defineCard({
  name: "Groundchuck & Dirtbag",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ox", "Mole", "Mutant"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});

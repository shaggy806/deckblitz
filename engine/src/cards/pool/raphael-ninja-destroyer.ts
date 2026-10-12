import { defineCard } from "../define.js";

// EDHREC rank 14474.
//
// Rulings:
//   [2026-01-27] If lethal damage is dealt to Raphael, his enrage ability will still trigger.
//   [2026-01-27] If multiple sources deal damage to Raphael at the same time, most likely because
//     multiple creatures blocked him, his enrage ability will trigger only once.
//
// Enrage is batched: damage from several sources at once fires it once, for
// the total (the second ruling). It isn't a mana ability — it triggers off
// damage, not off a mana ability — so it uses the stack; the mana it adds
// `persists` through the turn's steps and phases (Savage Ventmaw, Photon).
const BLOCK_TEXT = "Raphael must be blocked if able.";
const ENRAGE_TEXT =
  "Enrage — Whenever Raphael is dealt damage, add that much {R}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Raphael, Ninja Destroyer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 4,
  toughness: 4,
  text: `${BLOCK_TEXT}\n${ENRAGE_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-be-blocked-if-able"], text: BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: { triggerValue: true }, persists: true },
      resolve: null,
      text: ENRAGE_TEXT,
    },
  ],
});

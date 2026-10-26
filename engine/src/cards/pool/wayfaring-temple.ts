import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 11291.
//
// Rulings:
//   [2017-03-14] The ability that defines Wayfaring Temple's power and toughness works in all
//     zones, not just the battlefield.
//   [2024-01-12] If you control no creature tokens when you populate, nothing will happen.

const PT_TEXT = "Wayfaring Temple's power and toughness are each equal to the number of creatures you control.";
const POPULATE_TEXT =
  "Whenever this creature deals combat damage to a player, populate. (Create a token that's a copy of a creature token you control.)";

export default defineCard({
  name: "Wayfaring Temple",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${POPULATE_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3) — Burrowguard Mentor's shape.
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "populate" },
      resolve: null,
      text: POPULATE_TEXT,
    },
  ],
});

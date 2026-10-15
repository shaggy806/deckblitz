import { defineCard } from "../define.js";

// EDHREC rank 16351.
//
// Rulings:
//   [2025-06-06] Because damage remains marked on a creature until the damage is removed as the
//     turn ends, nonlethal damage dealt to Gigantoad may become lethal if the number of lands you
//     control drops below seven during that turn.

const PUMP_TEXT = "As long as you control seven or more lands, this creature gets +2/+2.";

export default defineCard({
  name: "Gigantoad",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 4,
  toughness: 4,
  text: PUMP_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7, countsSelf: true },
      grantPt: [2, 2],
      text: PUMP_TEXT,
    },
  ],
});

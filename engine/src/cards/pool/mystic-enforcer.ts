import { defineCard } from "../define.js";

// EDHREC rank 28820.
//
// Rulings:
//   [2022-12-08] Because damage remains marked on a creature until the damage is removed as the
//     turn ends, nonlethal damage dealt to Mystic Enforcer may become lethal if the number of
//     cards in your graveyard falls below seven.

const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +3/+3 and has flying.";

export default defineCard({
  name: "Mystic Enforcer",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Nomad", "Mystic"],
  power: 3,
  toughness: 3,
  text: `Protection from black\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [3, 3],
      grantKeywords: ["flying"],
      text: THRESHOLD_TEXT,
    },
  ],
});

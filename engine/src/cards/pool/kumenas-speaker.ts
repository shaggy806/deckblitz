import { defineCard } from "../define.js";

// EDHREC rank 22328.
//
// Rulings:
//   [2017-09-29] Most nonbasic lands that produce blue mana aren't Islands.
//   [2017-09-29] Kumena's Speaker gets only +1/+1 from its ability, no matter how many Merfolk and
//     Islands you control.

const TEXT = "This creature gets +1/+1 as long as you control another Merfolk or an Island.";

export default defineCard({
  name: "Kumena's Speaker",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { anyOf: [{ subtype: "Merfolk" }, { subtype: "Island" }] },
        atLeast: 1,
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 12401.
//
// Every red creature, anyone's. The mana half is a triggered mana ability
// (rule 605.1b) on any Mountain, whoever controls it — a dual land with the
// Mountain type included, whichever colour it was tapped for (the ruling) —
// and the {R} goes to the player who tapped it, its controller (Mana Flare's
// shape).
const ANTHEM = "Red creatures get +1/+1.";
const MANA = "Whenever a Mountain is tapped for mana, its controller adds an additional {R}.";

export default defineCard({
  name: "Gauntlet of Might",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ANTHEM}\n${MANA}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"] } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { subtype: "Mountain" } },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
});

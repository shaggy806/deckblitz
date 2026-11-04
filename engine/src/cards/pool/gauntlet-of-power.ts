import { defineCard } from "../define.js";

// A triggered mana ability (rule 605.1b). "Its controller" is whoever tapped
// the land; with no color chosen, nothing gets +1/+1 and it never triggers (the
// ruling).

const TAPPED =
  "Whenever a basic land is tapped for mana of the chosen color, its controller adds an additional one mana of that color.";
const STATIC = "Creatures of the chosen color get +1/+1.";

export default defineCard({
  name: "Gauntlet of Power",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose a color.\n${STATIC}\n${TAPPED}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "all-creatures", chosenColorOnly: true },
      grantPt: [1, 1],
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "tapped-for-mana",
        who: "any",
        filter: { type: "land", supertype: "basic" },
        producing: "chosen",
      },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: TAPPED,
    },
  ],
});

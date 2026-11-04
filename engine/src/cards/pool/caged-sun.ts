import { defineCard } from "../define.js";

const STATIC = "Creatures you control of the chosen color get +1/+1.";
const ADD = "Whenever a land's ability causes you to add one or more mana of the chosen color, add an additional one mana of that color.";

// New Phyrexia (NPH). EDHREC rank 945. A triggered mana ability (rule 605.1b, its
// ruling): "a land's ability" is any of them, tapped for or not.
export default defineCard({
  name: "Caged Sun",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose a color.\n${STATIC}\n${ADD}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "creatures-you-control", chosenColorOnly: true },
      grantPt: [1, 1],
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "land" }, producing: "chosen", anyAbility: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: ADD,
    },
  ],
});

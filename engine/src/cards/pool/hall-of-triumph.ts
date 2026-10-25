import { defineCard } from "../define.js";

export default defineCard({
  name: "Hall of Triumph",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "As Hall of Triumph enters, choose a color.\nCreatures you control of the chosen color get +1/+1.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "creatures-you-control", chosenColorOnly: true },
      grantPt: [1, 1],
      text: "Creatures you control of the chosen color get +1/+1.",
    },
  ],
});

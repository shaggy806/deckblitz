import { defineCard } from "../define.js";

// EDHREC rank 29476.
//
// Heraldic Banner's choice; the colour is set in layer 5 (`setsChosenColor`).
//
// Rulings:
//   [2004-10-04] If Alloy Golem phases out, you do not pick a new color when it phases in.

export default defineCard({
  name: "Alloy Golem",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: "As this creature enters, choose a color.\nThis creature is the chosen color. (It's still an artifact.)",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      setsChosenColor: true,
      text: "This creature is the chosen color.",
    },
  ],
});

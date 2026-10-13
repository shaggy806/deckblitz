import { defineCard } from "../define.js";

// EDHREC rank 7164.
//
// The colour is chosen before it moves (rule 614.12 — Black Dragon Gate's
// shape, from all five).

export default defineCard({
  name: "Shimmerdrift Vale",
  colors: [],
  supertypes: ["snow"],
  types: ["land"],
  text: "This land enters tapped.\nAs this land enters, choose a color.\n{T}: Add one mana of the chosen color.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
  ],
});

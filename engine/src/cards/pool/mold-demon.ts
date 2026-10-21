import { defineCard } from "../define.js";

// EDHREC rank 31634.
//
// Rulings:
//   [2004-10-04] The sacrifice is done as a triggered ability just after it enters.
//
// An `unless` you answer yourself, offered only with two Swamps to sacrifice
// (rule 118.3).
const ENTER_TEXT = "When this creature enters, sacrifice it unless you sacrifice two Swamps.";

export default defineCard({
  name: "Mold Demon",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus", "Demon"],
  power: 6,
  toughness: 6,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land", subtype: "Swamp" }, count: 2, text: "Sacrifice two Swamps" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

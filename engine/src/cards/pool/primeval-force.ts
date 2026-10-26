import { defineCard } from "../define.js";

// EDHREC rank 30749. Rathi Dragon's shape: an `unless` you answer yourself,
// offered only with three Forests to sacrifice (rule 118.3).

const ENTER_TEXT = "When this creature enters, sacrifice it unless you sacrifice three Forests.";

export default defineCard({
  name: "Primeval Force",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 8,
  toughness: 8,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land", subtype: "Forest" }, count: 3, text: "Sacrifice three Forests" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

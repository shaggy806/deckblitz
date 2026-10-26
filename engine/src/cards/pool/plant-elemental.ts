import { defineCard } from "../define.js";

// Portal. EDHREC rank 31786. Rogue Elephant's shape.
const TEXT = "When this creature enters, sacrifice it unless you sacrifice a Forest.";

export default defineCard({
  name: "Plant Elemental",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { subtype: "Forest" }, text: "Sacrifice a Forest" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

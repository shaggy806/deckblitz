import { defineCard } from "../define.js";

// EDHREC rank 14462.
//
// Only creatures on the battlefield gain the type (the ruling): a layer-4 static over the
// creatures you control, reading the type Xenograft chose as it entered.

export default defineCard({
  name: "Xenograft",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: "As this enchantment enters, choose a creature type.\nEach creature you control is the chosen type in addition to its other types.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      addsChosenCreatureType: true,
      text: "Each creature you control is the chosen type in addition to its other types.",
    },
  ],
});

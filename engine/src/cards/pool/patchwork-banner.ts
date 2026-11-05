import { defineCard } from "../define.js";

// EDHREC rank 203.

export default defineCard({
  name: "Patchwork Banner",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  chooseCreatureTypeOnEnter: true,
  text: "As this artifact enters, choose a creature type.\nCreatures you control of the chosen type get +1/+1.\n{T}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", ofChosenType: true },
      },
      grantPt: [1, 1],
      text: "Creatures you control of the chosen type get +1/+1.",
    },
  ],
});

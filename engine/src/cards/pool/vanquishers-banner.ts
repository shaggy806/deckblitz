import { defineCard } from "../define.js";

// EDHREC rank 383.

export default defineCard({
  name: "Vanquisher's Banner",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  chooseCreatureTypeOnEnter: true,
  text: "As this artifact enters, choose a creature type.\nCreatures you control of the chosen type get +1/+1.\nWhenever you cast a creature spell of the chosen type, draw a card.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", ofChosenType: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you cast a creature spell of the chosen type, draw a card.",
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

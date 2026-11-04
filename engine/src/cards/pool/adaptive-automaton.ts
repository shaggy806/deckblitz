import { defineCard } from "../define.js";

// EDHREC rank 1777.
//
// Rulings:
//   Even though Adaptive Automaton is a Construct, other Construct creatures you control won't get
//     +1/+1 unless you chose Construct as Adaptive Automaton entered.
//   The choice of creature type is made as Adaptive Automaton enters. Players can't take any actions
//     between the time the choice is made and the time the appropriate creatures begin to get +1/+1.
//   You must choose an existing creature type.
//
// Metallic Mimic's choice and "is the chosen type", Morophon's lord line.
const CHOOSE = "As this creature enters, choose a creature type.";
const TYPE = "This creature is the chosen type in addition to its other types.";
const LORD = "Other creatures you control of the chosen type get +1/+1.";

export default defineCard({
  name: "Adaptive Automaton",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: `${CHOOSE}\n${TYPE}\n${LORD}`,
  chooseCreatureTypeOnEnter: true,
  static: [
    { affects: { scope: "self" }, addsChosenCreatureType: true, text: TYPE },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", ofChosenType: true },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: LORD,
    },
  ],
});

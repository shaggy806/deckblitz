import { defineCard } from "../define.js";

// EDHREC rank 954.
//
// Rulings:
//   [2017-02-09] The choice of creature type is made as Metallic Mimic enters the battlefield.
//     Players can't respond to this choice. Metallic Mimic's second ability starts applying
//     immediately.
//   [2017-02-09] Creatures of the chosen type that enter the battlefield at the same time as
//     Metallic Mimic won't enter with an additional +1/+1 counter.
//   [2017-02-09] You must choose an existing creature type. "Artifact" and "Vehicle" aren't
//     creature types.
//   [2017-02-09] Even though Metallic Mimic is a Shapeshifter, other Shapeshifter creatures you
//     control won't get a +1/+1 counter unless you chose Shapeshifter as Metallic Mimic entered
//     the battlefield. If you do, that creature must be entering the battlefield as a Shapeshifter
//     to get a +1/+1 counter. It won't get a +1/+1 counter if it enters the battlefield as a copy
//     of a non-Shapeshifter creature.
//
// "Each other creature you control of the chosen type enters with an
// additional +1/+1 counter on it": the entering replacement's filter reads
// the type chosen as this entered (`ofChosenType`, the static's permanent as
// its source); a creature entering beside it isn't "other" to one it doesn't
// yet see.

const CHOOSE = "As this creature enters, choose a creature type.";
const TYPE = "This creature is the chosen type in addition to its other types.";
const COUNTER =
  "Each other creature you control of the chosen type enters with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Metallic Mimic",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 1,
  text: `${CHOOSE}\n${TYPE}\n${COUNTER}`,
  chooseCreatureTypeOnEnter: true,
  static: [
    { affects: { scope: "self" }, addsChosenCreatureType: true, text: TYPE },
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you", ofChosenType: true },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: COUNTER,
    },
  ],
});

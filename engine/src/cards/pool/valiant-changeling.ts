import { defineCard } from "../define.js";

// EDHREC rank 11020.
//
// - "{1} less for each creature type among creatures you control": the
//   different creature types among them, a changeling every one (rule
//   702.73a). "This effect can't reduce the amount of mana this spell costs
//   by more than {5}": the lesser of that and 5 (`leastOf`), so a cost
//   increase past {5} generic still leaves something to pay (rule 601.2f).
const REDUCTION_TEXT =
  "This spell costs {1} less to cast for each creature type among creatures you control. This effect can't reduce the amount of mana this spell costs by more than {5}.";

export default defineCard({
  name: "Valiant Changeling",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  keywords: ["changeling", "double-strike"],
  text: `${REDUCTION_TEXT}\nChangeling (This card is every creature type.)\nDouble strike`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      leastOf: [
        {
          aggregate: "distinct",
          of: { subtypesOf: "creature" },
          filter: { type: "creature", controlledBy: "you" },
        },
        5,
      ],
    },
  },
});

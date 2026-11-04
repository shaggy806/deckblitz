import { defineCard } from "../define.js";

// EDHREC rank 617. The type is chosen as it enters, and the counters are then
// counted with that type, not counting this artifact or anything entering with
// it (rule 614.12). The count is fixed there; the anthem then reads however
// many fellowship counters it has, whoever put them on.

const CHOOSE = "As this artifact enters, choose a creature type.";
const ENTER = "This artifact enters with a fellowship counter on it for each creature you control of the chosen type.";
const ANTHEM = "Creatures you control of the chosen type get +1/+1 for each fellowship counter on this artifact.";

export default defineCard({
  name: "Banner of Kinship",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  chooseCreatureTypeOnEnter: true,
  text: `${CHOOSE} ${ENTER}\n${ANTHEM}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "fellowship", amount: { countOf: { type: "creature", controlledBy: "you", ofChosenType: true } } },
      },
      text: ENTER,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ofChosenType: true } },
      grantPtPerCount: { countersOnSource: "fellowship", pt: [1, 1] },
      text: ANTHEM,
    },
  ],
});

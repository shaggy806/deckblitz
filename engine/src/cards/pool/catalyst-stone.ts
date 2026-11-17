import { defineCard } from "../define.js";

// EDHREC rank 13106.
//
// A flashback cost is the alternative cost a spell cast with flashback pays
// (rule 702.34a), so these change the total cost of such a cast (601.2f):
// the card's own flashback or one another card grants (Snapcaster Mage's),
// never jump-start's, cast from the graveyard the same way (702.133a).

const YOURS = "Flashback costs you pay cost {2} less.";
const THEIRS = "Flashback costs your opponents pay cost {2} more.";

export default defineCard({
  name: "Catalyst Stone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${YOURS}\n${THEIRS}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 2, when: { caster: "you", via: "flashback" } },
      text: YOURS,
    },
    {
      affects: { scope: "self" },
      costModification: { applies: {}, increaseGeneric: 2, when: { caster: "opponent", via: "flashback" } },
      text: THEIRS,
    },
  ],
});

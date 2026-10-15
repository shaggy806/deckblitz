import { defineCard } from "../define.js";

// EDHREC rank 10140. Defend the Campus's destroy mode beside Earthbending
// Lesson's earthbend.
const DESTROY_TEXT = "Destroy target creature with power 4 or greater.";
const EARTHBEND_TEXT =
  "Earthbend 3. (Target land you control becomes a 0/0 creature with haste that's still a land. Put three +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)";

export default defineCard({
  name: "Sandbenders' Storm",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${DESTROY_TEXT}\n• ${EARTHBEND_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DESTROY_TEXT,
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: EARTHBEND_TEXT,
        targets: ["land-you-control"],
        effect: { kind: "earthbend", target: 0, amount: 3 },
      },
    ],
  },
});

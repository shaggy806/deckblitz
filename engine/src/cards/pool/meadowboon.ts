import { defineCard } from "../define.js";

// EDHREC rank 20618. Morningtide.
//
// Evoke (rule 702.74) as Nevermaker; the leaves trigger targets a player and
// counts their creatures as it resolves (Requisition Raid's shape).
const LEAVES_TEXT =
  "When this creature leaves the battlefield, put a +1/+1 counter on each creature target player controls.";

export default defineCard({
  name: "Meadowboon",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  evoke: { cost: "{3}{W}" },
  text: `${LEAVES_TEXT}\nEvoke {3}{W} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        controlledByTarget: 0,
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});

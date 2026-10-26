import { defineCard } from "../define.js";

// EDHREC rank 29489. Morningtide.
//
// Reinforce X (rule 702.77a) from the hand, as Wren's Run Hydra's.
const REINFORCE_TEXT =
  "Reinforce X—{X}{W}{W} ({X}{W}{W}, Discard this card: Put X +1/+1 counters on target creature.)";

export default defineCard({
  name: "Swell of Courage",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Creatures you control get +2/+2 until end of turn.\n${REINFORCE_TEXT}`,
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 2,
    duration: "end-of-turn",
  },
  activated: [
    {
      cost: { mana: "{X}{W}{W}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
      resolve: null,
      text: REINFORCE_TEXT,
    },
  ],
});

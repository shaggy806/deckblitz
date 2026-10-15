import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 10454.

export default defineCard({
  name: "Claws Out",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Affinity for Cats (This spell costs {1} less to cast for each Cat you control.)\nCreatures you control get +2/+2 until end of turn.",
  selfCostReduction: affinity({ subtype: "Cat" }),
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 2,
    duration: "end-of-turn",
  },
});

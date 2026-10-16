import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// Bloomburrow (BLB). EDHREC rank 13083. Affinity for Lizards (rule 702.41a).
export default defineCard({
  name: "Scales of Shale",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Affinity for Lizards (This spell costs {1} less to cast for each Lizard you control.)\nTarget creature gets +2/+0 and gains lifelink and indestructible until end of turn.",
  selfCostReduction: affinity({ subtype: "Lizard" }),
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});

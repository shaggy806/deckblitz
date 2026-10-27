import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 20127.
//
// Entwine whose cost is sacrificing two lands rather than mana (Constant Mists'
// buyback shape). Entwined, both modes' destructions are one resolution: the
// first mode's creatures are gone before the second reads power.

export default defineCard({
  name: "Solar Tide",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  kicker: {
    cost: "",
    keyword: "entwine",
    also: { text: "Sacrifice two lands", sacrifice: { filter: { type: "land" }, count: 2 } },
  },
  text: "Choose one —\n• Destroy all creatures with power 2 or less.\n• Destroy all creatures with power 3 or greater.\nEntwine—Sacrifice two lands. (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy all creatures with power 2 or less.",
        effect: { kind: "destroy-all", filter: { type: "creature", power: { op: "lte", n: 2 } } },
      },
      {
        text: "Destroy all creatures with power 3 or greater.",
        effect: { kind: "destroy-all", filter: { type: "creature", power: { op: "gte", n: 3 } } },
      },
    ],
    kickedModes: 2,
  },
});

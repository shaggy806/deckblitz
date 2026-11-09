import { defineCard } from "../define.js";

// EDHREC rank 2114. The price depends on the target, so it's fixed once the
// target is chosen (rule 601.2f), and an equip it can't afford on one creature
// is still offered for a more colorful one.
const STATIC_TEXT = "Equipped creature gets +2/+2 and has hexproof from monocolored.";
const EQUIP_TEXT = "Equip {4}. This ability costs {1} less to activate for each color of the creature it targets.";

export default defineCard({
  name: "Dragonfire Blade",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${EQUIP_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      hexproofFrom: {
        filter: {
          multicolored: false,
          anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
        },
      },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      targetCostReduction: { filter: {}, reduceGeneric: "target-colors" },
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
    },
  ],
});

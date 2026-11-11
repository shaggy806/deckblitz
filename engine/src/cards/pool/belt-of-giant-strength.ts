import { defineCard } from "../define.js";

// EDHREC rank 7187. The equip's price is read off the creature it targets and
// fixed once that target is chosen (rule 601.2f): free on a 10-power creature,
// and offered only for the creatures it's affordable on.
const STATIC_TEXT = "Equipped creature has base power and toughness 10/10.";
const EQUIP_TEXT = "Equip {10}. This ability costs {X} less to activate, where X is the power of the creature it targets.";

export default defineCard({
  name: "Belt of Giant Strength",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${EQUIP_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 10, toughness: 10 },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{10}", tap: false },
      targets: ["creature-you-control"],
      targetCostReduction: { filter: {}, reduceGeneric: "target-power" },
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
    },
  ],
});

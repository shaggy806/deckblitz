import { defineCard } from "../define.js";

// The equip's price is read off the creature it targets, so it's fixed once
// the target is chosen (rule 601.2f).
const ETB_TEXT = "When this Equipment enters, it deals 3 damage to any target and you gain 3 life.";
const STATIC_TEXT = "Equipped creature gets +2/+1.";
const EQUIP_TEXT = "Equip {3}. This ability costs {1} less to activate for each +1/+1 counter on the creature it targets.";

export default defineCard({
  name: "Warrior's Blades",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ETB_TEXT}\n${STATIC_TEXT}\n${EQUIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: STATIC_TEXT }],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      targetCostReduction: { filter: {}, reduceGeneric: "target-+1/+1-counters" },
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
    },
  ],
});

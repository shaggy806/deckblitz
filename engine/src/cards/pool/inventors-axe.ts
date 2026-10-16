import { defineCard } from "../define.js";

// EDHREC rank 16322.
//
// Two enters triggers: the energy, and the attach (Baseball Bat's shape) —
// it enters unattached, so it may be cast with no creature, and an illegal
// target leaves it unattached (the rulings). Equip—Pay {E}{E} is an equip
// ability with an energy cost, at sorcery speed (rule 702.6a).
const ENERGY_TEXT = "When this Equipment enters, you get {E}{E} (two energy counters).";
const ATTACH_TEXT = "When this Equipment enters, attach it to target creature you control.";
const EQUIP_TEXT = "Equip—Pay {E}{E}.";

export default defineCard({
  name: "Inventor's Axe",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENERGY_TEXT}\n${ATTACH_TEXT}\nEquipped creature gets +2/+0.\n${EQUIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENERGY_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2 },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
    },
  ],
});

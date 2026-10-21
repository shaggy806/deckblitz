import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8996.
//
// Rulings:
//   [2019-10-04] The equipped creature has vigilance even if Mace of the Valiant has no charge
//     counters on it.

const PT_TEXT =
  "Equipped creature gets +1/+1 for each charge counter on this Equipment and has vigilance. (Attacking doesn't cause it to tap.)";
const CHARGE_TEXT = "Whenever a creature you control enters, put a charge counter on this Equipment.";

export default defineCard({
  name: "Mace of the Valiant",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PT_TEXT}\n${CHARGE_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "charge", pt: [1, 1] },
      grantKeywords: ["vigilance"],
      text: PT_TEXT,
    },
  ],
  activated: [equip("{3}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
});

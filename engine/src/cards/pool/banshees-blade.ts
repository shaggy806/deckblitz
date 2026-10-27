import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Mirrodin (MRD). EDHREC rank 16206.
//
// Rulings:
//   [2004-12-01] The counters stay on Banshee's Blade even if it becomes unattached, or moves from
//     one creature to another.
//
// "Deals combat damage" names no recipient, so the trigger fires once per
// combat damage event however many things the creature damaged (a trampler
// and its blocker) — `deals-damage` with no `to`.

const PUMP_TEXT = "Equipped creature gets +1/+1 for each charge counter on this Equipment.";
const COUNTER_TEXT = "Whenever equipped creature deals combat damage, put a charge counter on this Equipment.";

export default defineCard({
  name: "Banshee's Blade",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${COUNTER_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "charge", pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

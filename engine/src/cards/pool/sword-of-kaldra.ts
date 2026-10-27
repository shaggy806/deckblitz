import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Mirrodin (MRD). EDHREC rank 8899.
//
// Rulings:
//   [2004-10-04] You exile the creature that gets damaged.
//
// Any damage, combat or not (Pit Spawn's trigger, read off the equipped
// creature); one trigger per creature dealt damage.

const EXILE_TEXT = "Whenever equipped creature deals damage to a creature, exile that creature. (Exile it only if it's still on the battlefield.)";

export default defineCard({
  name: "Sword of Kaldra",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +5/+5.\n${EXILE_TEXT}\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [5, 5], text: "Equipped creature gets +5/+5." }],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "creature" },
      targets: [],
      effect: { kind: "exile", target: "trigger-recipient" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  activated: [equip("{4}")],
});

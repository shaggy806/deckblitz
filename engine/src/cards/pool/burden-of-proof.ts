import { defineCard } from "../define.js";

// EDHREC rank 23447.
//
// Rulings:
//   [2024-02-02] Once a Detective has been blocked, attaching Burden of Proof to a creature
//     blocking it won't cause that Detective to become unblocked.
//
// Clout of the Dominus's shape: each half is a static on the enchanted
// creature gated on what it is now — a Detective this Aura's controller
// controls, or not. "Can't block Detectives" is "can block only
// non-Detectives", checked as blocks are declared (so a block already made
// stands, the ruling).

const TEXT =
  "Enchanted creature gets +2/+2 as long as it's a Detective you control. Otherwise, it has base power and toughness 1/1 and can't block Detectives.";
const IS_YOUR_DETECTIVE = {
  kind: "source",
  filter: { attachedTo: { subtype: "Detective", controlledBy: "you" } },
} as const;

export default defineCard({
  name: "Burden of Proof",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: IS_YOUR_DETECTIVE,
      grantPt: [2, 2],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "not", of: IS_YOUR_DETECTIVE },
      setBasePt: { power: 1, toughness: 1 },
      canBlockOnly: { notSubtypes: ["Detective"] },
      text: TEXT,
    },
  ],
});

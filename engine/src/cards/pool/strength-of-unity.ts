import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29895.
//
// Rulings:
//   [2021-06-18] The basic land types are Plains, Island, Swamp, Mountain, and Forest. Land types
//     other than basic land types (such as Desert) don't contribute to domain abilities.
//   [2021-06-18] Domain abilities count the number of basic land types among lands you control,
//     not how many lands you control or how many of any type.
//
// Domain as Magnigoth Treefolk writes it: one +1/+1 per basic land type among
// lands the Aura's controller controls, each a static gated on that type.
const TEXT = "Domain — Enchanted creature gets +1/+1 for each basic land type among lands you control.";

const BASIC_TYPES = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;

export default defineCard({
  name: "Strength of Unity",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: BASIC_TYPES.map((subtype) => ({
    affects: { scope: "attached" as const },
    condition: { kind: "controls" as const, filter: { type: "land" as const, subtype, controlledBy: "you" as const }, atLeast: 1 },
    grantPt: [1, 1] as const,
    text: TEXT,
  })),
});

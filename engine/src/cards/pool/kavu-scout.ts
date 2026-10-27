import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29400.
//
// Rulings:
//   [2021-06-18] Domain abilities count the number of basic land types among lands you control,
//     not how many lands you control or how many of any type.
//   [2021-06-18] The basic land types are Plains, Island, Swamp, Mountain, and Forest. Land types
//     other than basic land types (such as Desert) don't contribute to domain abilities.
//
// Domain as Magnigoth Treefolk writes it: one +1/+0 per basic land type, each
// a static gated on controlling a land of that type, so the five together
// count the basic land types among your lands.
const TEXT = "Domain — This creature gets +1/+0 for each basic land type among lands you control.";

const BASIC_TYPES = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;

export default defineCard({
  name: "Kavu Scout",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Scout"],
  power: 0,
  toughness: 2,
  text: TEXT,
  static: BASIC_TYPES.map((subtype) => ({
    affects: { scope: "self" as const },
    condition: { kind: "controls" as const, filter: { type: "land" as const, subtype, controlledBy: "you" as const }, atLeast: 1 },
    grantPt: [1, 0] as const,
    text: TEXT,
  })),
});

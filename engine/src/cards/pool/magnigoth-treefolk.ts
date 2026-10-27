import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 17021.
//
// Rulings:
//   [2021-06-18] Domain abilities count the number of basic land types among lands you control,
//     not how many lands you control or how many of any type.
//
// One static per basic land type: while you control a land of that type, this
// creature has that landwalk.

const TEXT =
  "Domain — For each basic land type among lands you control, this creature has landwalk of that type. (It can't be blocked as long as defending player controls a land of that type.)";

const WALKS = [
  ["Plains", "plainswalk"],
  ["Island", "islandwalk"],
  ["Swamp", "swampwalk"],
  ["Mountain", "mountainwalk"],
  ["Forest", "forestwalk"],
] as const;

const statics: StaticAbility[] = WALKS.map(([landType, walk]) => ({
  affects: { scope: "self" },
  condition: { kind: "controls", filter: { type: "land", subtype: landType, controlledBy: "you" }, atLeast: 1 },
  grantKeywords: [walk],
  text: TEXT,
}));

export default defineCard({
  name: "Magnigoth Treefolk",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 2,
  toughness: 6,
  text: TEXT,
  static: statics,
});

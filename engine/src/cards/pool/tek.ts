import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28503.
//
// Five independent "as long as you control a <basic land type>" statics
// (Flinthoof Boar's shape), one per clause.
const TEXT =
  "This creature gets +0/+2 as long as you control a Plains, has flying as long as you control an Island, gets +2/+0 as long as you control a Swamp, has first strike as long as you control a Mountain, and has trample as long as you control a Forest.";

const controls = (subtype: string) => ({ kind: "controls" as const, filter: { subtype }, atLeast: 1 });

export default defineCard({
  name: "Tek",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    { affects: { scope: "self" }, condition: controls("Plains"), grantPt: [0, 2], text: TEXT },
    { affects: { scope: "self" }, condition: controls("Island"), grantKeywords: ["flying"], text: TEXT },
    { affects: { scope: "self" }, condition: controls("Swamp"), grantPt: [2, 0], text: TEXT },
    { affects: { scope: "self" }, condition: controls("Mountain"), grantKeywords: ["first-strike"], text: TEXT },
    { affects: { scope: "self" }, condition: controls("Forest"), grantKeywords: ["trample"], text: TEXT },
  ],
});

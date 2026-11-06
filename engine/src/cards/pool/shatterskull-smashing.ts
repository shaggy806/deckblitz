import { defineCard } from "../define.js";

// A modal double-faced card (sorcery // land): its back face, Shatterskull,
// the Hammer Pass, is a land you play instead. The total divided is read
// from the X it's cast with — twice X at 6 or more, which is what's divided
// (its ruling), not X doubled after — and split as it's cast, at least 1 to
// each target (rule 601.2d), so X 1 allows only one. A target gone illegal
// loses its share (its ruling).
const TEXT =
  "Shatterskull Smashing deals X damage divided as you choose among up to two target creatures and/or planeswalkers. If X is 6 or more, Shatterskull Smashing deals twice X damage divided as you choose among them instead.";

export default defineCard({
  name: "Shatterskull Smashing",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      max: 2,
    },
  ],
  divided: {
    total: { ifCondition: { kind: "x", compare: { op: "gte", n: 6 } }, then: { product: ["x", 2] }, else: "x" },
    slot: 0,
  },
  effect: { kind: "damage-divided", from: 0 },
  faces: ["Shatterskull Smashing", "Shatterskull, the Hammer Pass"],
});

import { defineCard } from "../define.js";

// EDHREC rank 27199. The first target always gets the first half; a second,
// different creature is optional (the rulings).
export default defineCard({
  name: "Rally Maneuver",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+0 and gains first strike until end of turn. Up to one other target creature gets +0/+2 and gains lifelink until end of turn.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 0, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});

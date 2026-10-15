import { defineCard } from "../define.js";

// EDHREC rank 14799.
//
// "Cast for its warp cost" is the permanent's entry: cast from the hand with
// warp (`castVia: "warp"`), not a later cast of it from exile.

export default defineCard({
  name: "Full Bore",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control gets +3/+2 until end of turn. If that creature was cast for its warp cost, it also gains trample and haste until end of turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { castVia: "warp" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});

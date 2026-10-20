import { defineCard } from "../define.js";

// "That many" is how many creatures this exiled (tokens too); the target
// player — not you — may search, and finding fewer is allowed (a hidden
// zone, rule 701.23b).
const TEXT =
  "Exile all attacking creatures target player controls. That player may search their library for that many basic land cards, put those cards onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Settle the Wreckage",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature", attacking: true, controlledBy: "you" }, controlledByTarget: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for that many basic land cards?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "battlefield",
          min: 0,
          max: { thisWay: "exiled" },
          enterTapped: true,
        },
      },
    ],
  },
});

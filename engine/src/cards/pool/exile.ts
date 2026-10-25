import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 18478.
//
// Swords to Plowshares' shape: the toughness is read off the exiled creature's
// last-known information (rule 608.2h).

export default defineCard({
  name: "Exile",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target nonwhite attacking creature. You gain life equal to its toughness.",
  targets: [{ kind: "permanent", filter: { type: "creature", notColors: ["W"], attacking: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "gain-life", amount: { toughnessOf: 0 } },
    ],
  },
});

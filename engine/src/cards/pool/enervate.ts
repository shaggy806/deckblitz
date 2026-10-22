import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 15236.

export default defineCard({
  name: "Enervate",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap target artifact, creature, or land.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});

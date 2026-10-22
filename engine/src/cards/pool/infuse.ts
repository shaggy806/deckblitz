import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 18937.
//
// Rulings:
//   [2004-10-04] You may target any artifact, creature, or land, not just a tapped one. If the
//     targeted permanent is already untapped as Infuse resolves, Infuse won't affect it, but
//     you'll still draw a card at the beginning of the next turn's upkeep.

export default defineCard({
  name: "Infuse",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Untap target artifact, creature, or land.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});

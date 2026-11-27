import { defineCard } from "../define.js";

const FACES = ["Bound // Determined", "Bound", "Determined"];

// The left half of Bound // Determined (see bound-determined.ts). The
// sacrifice is part of the effect, not a cost, and not optional; the colors
// are the creature's as it last existed on the battlefield (`colorsOf` of the
// sacrificed one, 608.2h), so a colorless one returns nothing (the rulings).
// The cards are chosen as it resolves, the sacrificed creature among them.
export default defineCard({
  name: "Bound",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "Sacrifice a creature. Return up to X cards from your graveyard to your hand, where X is the number of colors that creature was. Exile this card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      {
        kind: "return-from-graveyard",
        filter: {},
        destination: "hand",
        count: { colorsOf: { thisWay: "sacrificed" } },
        upTo: true,
      },
    ],
  },
  exileOnResolve: true,
  faces: FACES,
  split: true,
});

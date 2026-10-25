import { defineCard } from "../define.js";

// Mirage. EDHREC rank 14026.
//
// Rulings:
//   [2004-10-04] You have to show which creature cards you put on top of your library, but not the
//     order you put them there.
//
// Each target goes on top in the order the caster chose them (`for-each-target`), so the
// last one chosen ends on top — the order is the caster's.

export default defineCard({
  name: "Bone Harvest",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put any number of target creature cards from your graveyard on top of your library.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "put-on-library", target: 0, position: "top" } },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});

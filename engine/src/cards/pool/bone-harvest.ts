import { defineCard } from "../define.js";

// Mirage. EDHREC rank 14026.
//
// Rulings:
//   [2004-10-04] You have to show which creature cards you put on top of your library, but not the
//     order you put them there.
//
// The cards go on top together (one leave from the graveyard), in the order their owner —
// the caster — chooses as it resolves (rule 401.4, `put-on-libraries`).

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
      { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
      { kind: "delayed-trigger", at: { step: "upkeep" }, effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});

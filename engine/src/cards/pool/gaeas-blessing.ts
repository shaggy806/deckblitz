import { defineCard } from "../define.js";

// EDHREC rank 5512.
//
// Rulings (2018-04-27):
//   If Gaea's Blessing has no legal target cards in a graveyard, either
//   because its targets became illegal or because you didn't choose any, the
//   target player shuffles their library.
//
// The spell is Witness the Future's: the cards are the target player's, a
// player gone illegal shuffles nothing (the cards stay put), and the draw
// happens whenever the spell resolves at all. The mill trigger is
// Narcomoeba's: it works from the graveyard the card was put into, only for a
// move from the library, and the card's controller there is its owner.

const MILL_TEXT =
  "When this card is put into your graveyard from your library, shuffle your graveyard into your library.";

export default defineCard({
  name: "Gaea's Blessing",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Target player shuffles up to three target cards from their graveyard into their library.\nDraw a card.\n${MILL_TEXT}`,
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 3, sameController: { slot: 0 } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target-legal", index: 0 },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 1,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 1, position: "top" },
            },
            { kind: "shuffle-library", target: 0 },
          ],
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "put-into-graveyard", who: "self", from: "library" },
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you" },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Magic 2010 (M10). EDHREC rank 17369.
//
// Rulings:
//   [2009-10-01] You don't choose the exiled cards until Mirror of Fate's ability resolves. It
//     doesn't matter how they wound up in the exile zone.
//   [2009-10-01] Exiled cards are face up by default; they're face down only if the effect that
//     exiled them said so. For example, the cards from your library that Mirror of Fate exiles
//     are exiled face up.
//   [2009-10-01] You choose the order that the chosen cards are put on top of your library. You
//     don't have to show anyone else that order.
//
// The cards are chosen first and wait in exile (`destination: "stay"`); then the library is
// exiled — with none chosen too (`thenAlways`) — and the chosen cards go on top together, their
// owner arranging them (`put-on-libraries`, rule 401.4).

const TEXT =
  "{T}, Sacrifice this artifact: Choose up to seven face-up exiled cards you own. Exile all the cards from your library, then put the chosen cards on top of your library.";

export default defineCard({
  name: "Mirror of Fate",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exile",
        filter: { ownedBy: "you", faceDown: false },
        min: 0,
        max: 7,
        destination: "stay",
        leftover: "stay",
        prompt: "Choose up to seven face-up exiled cards you own to put on top of your library",
        thenAlways: true,
        then: {
          kind: "sequence",
          effects: [
            { kind: "exile-from-library", whose: "you", allBut: 0 },
            { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

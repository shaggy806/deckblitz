import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 9278.
//
// Rulings:
//   [2017-07-14] You (not your opponent) choose which pile to put into your hand and which to put
//     into your graveyard.
//   [2017-07-14] In multiplayer games, you choose an opponent to separate the cards when the
//     ability resolves. This doesn't target that opponent. Because the cards are revealed, all
//     players may see the cards and offer opinions.
//   [2017-07-14] To determine the total cost of a Sphinx spell, start with the mana cost or
//     alternative cost you're paying, add any cost increases, then apply any cost reductions. The
//     mana value of the creature remains unchanged, no matter what the total cost to cast it was.
//   [2017-07-14] A pile can have no cards in it. In this case, you'll choose whether to put all
//     the revealed cards into your hand or into your graveyard.
//   [2017-07-14] Unesh's cost-reduction ability doesn't reduce the cost to cast itself.

const REDUCE = "Sphinx spells you cast cost {2} less to cast.";
const PILES =
  "Whenever Unesh or another Sphinx you control enters, reveal the top four cards of your library. An opponent separates those cards into two piles. Put one pile into your hand and the other into your graveyard.";

export default defineCard({
  name: "Unesh, Criosphinx Sovereign",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${REDUCE}\n${PILES}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Sphinx" }, reduceGeneric: 2, when: { caster: "you" } },
      text: REDUCE,
    },
  ],
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Sphinx" } },
      targets: [],
      effect: {
        kind: "separate-into-piles",
        objects: { libraryTop: 4, reveal: true },
        separator: "an-opponent",
        chooser: "you",
        chosen: "hand",
        rest: "graveyard",
      },
      resolve: null,
      text: PILES,
    }),
  ],
});

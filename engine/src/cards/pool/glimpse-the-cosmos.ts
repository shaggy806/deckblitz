import { defineCard } from "../define.js";

// EDHREC rank 15611.
//
// Rulings:
//   [2021-02-05] Glimpse the Cosmos has mana value 2, no matter what you actually paid to cast it.
//   [2021-02-05] If you cast Glimpse the Cosmos from your graveyard using a different permission,
//     the last ability won't apply. You'll pay whatever cost that permission stipulates, and
//     you'll follow that permission's instructions regarding exiling Glimpse the Cosmos, if any.
//   [2021-02-05] Casting Glimpse the Cosmos from your graveyard using the last ability doesn't
//     change when you can cast it.
//
// Not flashback: its own graveyard permission (`mayPlaySelf`), for {U} rather
// than its mana cost while its owner controls a Giant, exiled instead of put
// into a graveyard only when cast this way (`exileAfter`).
const LOOK_TEXT =
  "Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";
const GRAVEYARD_TEXT =
  "As long as you control a Giant, you may cast this card from your graveyard by paying {U} rather than paying its mana cost. If you cast this card this way and it would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Glimpse the Cosmos",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${LOOK_TEXT}\n${GRAVEYARD_TEXT}`,
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-any-order",
  },
  mayPlaySelf: {
    from: ["graveyard"],
    byPaying: "{U}",
    if: { kind: "controls", filter: { subtype: "Giant" }, atLeast: 1 },
    exileAfter: true,
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 3432. "Its owner shuffles it into their library": the card, found
// in the graveyard it went to, into its owner's library, then that library
// shuffled (a filter of just this card, so no other card goes).
const SHUFFLE_TEXT = "When this artifact is put into a graveyard from the battlefield, its owner shuffles it into their library.";

export default defineCard({
  name: "Lembas",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `When this artifact enters, scry 1, then draw a card.\n{2}, {T}, Sacrifice this artifact: You gain 3 life.\n${SHUFFLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "When this artifact enters, scry 1, then draw a card.",
    },
    {
      trigger: { on: "put-into-graveyard", who: "self", from: "battlefield" },
      fromGraveyard: true,
      targets: [],
      effect: {
        kind: "shuffle-graveyard-into-library",
        target: { ownerOf: "source" },
        filter: { isSource: true },
      },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: You gain 3 life.",
    },
  ],
});

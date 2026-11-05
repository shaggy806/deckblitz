import { defineCard } from "../define.js";

// "Return Journey to the Oracle to its owner's hand" — the resolving spell
// itself goes to its owner's hand rather than the graveyard (rule 608.2n).
export default defineCard({
  name: "Journey to the Oracle",
  art: "https://cards.scryfall.io/art_crop/back/d/7/d7148d24-373e-4485-860b-c3429c2337f2.jpg",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You may put any number of land cards from your hand onto the battlefield. Then if you control eight or more lands, you may discard a card. If you do, return Journey to the Oracle to its owner's hand.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "stay",
      },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 8 },
        then: {
          kind: "may",
          prompt: "Discard a card to return Journey to the Oracle to your hand?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "discarded" },
                then: { kind: "return-to-hand", target: "source", from: "stack" },
              },
            ],
          },
        },
      },
    ],
  },
  faces: ["Jadzi, Oracle of Arcavios", "Journey to the Oracle"],
});

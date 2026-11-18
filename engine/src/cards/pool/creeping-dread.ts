import { defineCard } from "../define.js";

// EDHREC rank 14527.
//
// Each player chooses in turn order from the active player, the chosen cards
// staying face down in hand, then all are discarded at once (the ruling;
// rule 101.4 — a `discard` over several players). Then each opponent is
// asked about the card they discarded this way against the types of the
// card you discarded (`{ typesOf }`: card types only, rule 205.2a — not
// supertypes or subtypes, the ruling). Two shared types still lose 3 life
// once; if you discarded nothing, nothing shares a type with it and nobody
// loses life (the rulings). A double-faced card is its front face in the
// graveyard (rule 712.8a).
const TEXT =
  "At the beginning of your upkeep, each player discards a card. Each opponent who discarded a card that shares a card type with the card you discarded loses 3 life. (Players reveal the discarded cards simultaneously.)";

export default defineCard({
  name: "Creeping Dread",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-player", amount: 1 },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: {
                kind: "this-way",
                what: "discarded",
                who: "that-player",
                filter: { sharesCardTypeWith: { typesOf: { thisWay: "discarded", who: "you" } } },
              },
              then: { kind: "lose-life", amount: 3, who: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

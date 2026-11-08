import { defineCard } from "../define.js";

// Its rulings: chapters II and III read every card this Saga exiled, should it
// be several (a copied chapter). II: one creature among them, and you lose the
// mana value of them all. III: one creature among them, and you may put all the
// permanent cards among them onto the battlefield; the rest go to their owners'
// hands.
export default defineCard({
  name: "The Creation of Avacyn",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    "I — Search your library for a card, exile it face down, then shuffle.\n" +
    "II — Turn the exiled card face up. If it's a creature card, you lose life equal to its mana value.\n" +
    "III — You may put the exiled card onto the battlefield if it's a creature card. If you don't put it onto the battlefield, put it into its owner's hand.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "search-library", filter: {}, destination: "exile-face-down", linked: true, min: 1, max: 1 },
      resolve: null,
      text: "I — Search your library for a card, exile it face down, then shuffle.",
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "turn-exiled-face-up" },
          {
            kind: "conditional",
            condition: { kind: "exiled-with-source", atLeast: 1, now: true, filter: { type: "creature" } },
            then: { kind: "lose-life", amount: { aggregate: "sum", of: "mana-value", filter: {}, in: "exiled-with-source" } },
          },
        ],
      },
      resolve: null,
      text: "II — Turn the exiled card face up. If it's a creature card, you lose life equal to its mana value.",
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "exiled-with-source", atLeast: 1, now: true, filter: { type: "creature" } },
            then: {
              kind: "may",
              prompt: "Put the exiled card onto the battlefield?",
              effect: {
                kind: "return-exiled-by-source",
                linked: "battlefield",
                under: "you",
                filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
              },
            },
          },
          { kind: "return-exiled-by-source", linked: "hand" },
        ],
      },
      resolve: null,
      text: "III — You may put the exiled card onto the battlefield if it's a creature card. If you don't put it onto the battlefield, put it into its owner's hand.",
    },
  ],
});

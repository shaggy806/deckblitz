import { defineCard } from "../define.js";

export default defineCard({
  name: "Aclazotz, Deepest Betrayal",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bat", "God"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: "Flying, lifelink\nWhenever Aclazotz attacks, each opponent discards a card. For each opponent who can't, you draw a card.\nWhenever an opponent discards a land card, create a 1/1 black Bat creature token with flying.\nWhen Aclazotz dies, return it to the battlefield tapped and transformed under its owner's control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", who: "that-player", atMost: 0 },
              then: { kind: "draw", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever Aclazotz attacks, each opponent discards a card. For each opponent who can't, you draw a card.",
    },
    {
      trigger: { on: "discards", who: "opponent", filter: { type: "land" }, perCard: true },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 1 },
      resolve: null,
      text: "Whenever an opponent discards a land card, create a 1/1 black Bat creature token with flying.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, transformed: true },
      resolve: null,
      text: "When Aclazotz dies, return it to the battlefield tapped and transformed under its owner's control.",
    },
  ],
  faces: ["Aclazotz, Deepest Betrayal", "Temple of the Dead"],
  transform: true,
});

import { defineCard } from "../define.js";

const LOOT_TEXT =
  "{1}, {T}: Draw a card, then discard a card. When you discard a creature card this way, target creature you control can't be blocked this turn.";

export default defineCard({
  name: "Evie Frye",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  pairing: { kind: "partner-with", name: "Jacob Frye" },
  text: `Partner with Jacob Frye (When this creature enters, target player may put Jacob into their hand from their library, then shuffle.)\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { type: "creature" } },
            then: {
              kind: "reflexive-trigger",
              targets: ["creature-you-control"],
              effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
              text: "When you discard a creature card this way, target creature you control can't be blocked this turn.",
            },
          },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Search your library for a card named Jacob Frye?",
        effect: {
          kind: "search-library",
          filter: { name: "Jacob Frye" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Jacob Frye, reveal it, put it into their hand, then shuffle.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 8434.
// Makes Blood → use "Blood Token".
//
// Partner with (rule 702.124j): the pair's search trigger, as the other
// partner-with cards author it.
const PARTNER_TEXT =
  "Partner with Laurine, the Diversion (When this creature enters, target player may put Laurine into their hand from their library, then shuffle.)";
const DIES_TEXT = "Whenever a creature an opponent controls dies, you gain 1 life and create a Blood token.";

export default defineCard({
  name: "Kamber, the Plunderer",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 3,
  toughness: 4,
  keywords: ["lifelink"],
  pairing: { kind: "partner-with", name: "Laurine, the Diversion" },
  text: `${PARTNER_TEXT}\nLifelink\n${DIES_TEXT} (It's an artifact with "{1}, {T}, Discard a card, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Laurine, the Diversion?",
        effect: {
          kind: "search-library",
          filter: { name: "Laurine, the Diversion" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Laurine, the Diversion, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "create-token", token: "Blood Token", count: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

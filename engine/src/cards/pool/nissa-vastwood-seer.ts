import { defineCard } from "../define.js";

// EDHREC rank 6788. Transforms into Nissa, Sage Animist.
//
// Rulings:
//   [2015-06-22] Nissa, Vastwood Seer is exiled as a result of her second triggered ability. If
//     she enters the battlefield while you control seven or more lands, she won't automatically
//     be exiled and transform.
//   [2015-06-22] A Magic Origins planeswalker that enters the battlefield because of the ability
//     of its front face will enter with loyalty counters as normal.
//
// Sorin of House Markov's shape: an intervening "if" (rule 603.4) on a
// landfall trigger, and a flicker that brings her back back face up with the
// Sage Animist's printed loyalty.
const SEARCH_TEXT =
  "When Nissa enters, you may search your library for a basic Forest card, reveal it, put it into your hand, " +
  "then shuffle.";
const FLIP_TEXT =
  "Whenever a land you control enters, if you control seven or more lands, exile Nissa, then return her to the " +
  "battlefield transformed under her owner's control.";

export default defineCard({
  name: "Nissa, Vastwood Seer",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 2,
  text: `${SEARCH_TEXT}\n${FLIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic Forest card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", subtype: "Forest" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7 },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Nissa, Vastwood Seer", "Nissa, Sage Animist"],
  transform: true,
});

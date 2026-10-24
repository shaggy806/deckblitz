import { defineCard } from "../define.js";

// EDHREC rank 15271.
// Makes Thopter → use "Thopter Token".
//
// The +1's "until end of turn, whenever …" is a delayed triggered ability
// (rule 603.7c), belonging to no permanent: it triggers once for each
// creature you control that deals combat damage to a player, one loyalty
// counter each, however much damage (the ruling), and nothing that happens
// to Dovin ends it — though a Dovin that has left is a new object it can't
// put counters on (rule 400.7). The −7 takes all of a library of fewer than three cards (the
// ruling).
const PLUS_TEXT =
  "+1: Until end of turn, whenever a creature you control deals combat damage to a player, put a loyalty counter on Dovin.";
const THOPTER_TEXT = "−1: Create a 1/1 colorless Thopter artifact creature token with flying. You gain 1 life.";
const LOOK_TEXT =
  "−7: Look at the top ten cards of your library. Put three of them into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Dovin, Grand Arbiter",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dovin"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${THOPTER_TEXT}\n${LOOK_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } } },
        effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
        text: "Whenever a creature you control deals combat damage to a player, put a loyalty counter on Dovin.",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Thopter Token", count: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: THOPTER_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 10,
        min: 3,
        max: 3,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});

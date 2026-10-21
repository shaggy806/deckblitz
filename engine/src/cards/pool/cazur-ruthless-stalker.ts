import { defineCard } from "../define.js";

// EDHREC rank 8369. Partner with's enters trigger is Blaring Recruiter's
// shape: the targeted player's own "may" search of their own library.

export default defineCard({
  name: "Cazur, Ruthless Stalker",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  pairing: { kind: "partner-with", name: "Ukkima, Stalking Shadow" },
  text: "Partner with Ukkima, Stalking Shadow (When this creature enters, target player may put Ukkima into their hand from their library, then shuffle.)\nWhenever a creature you control deals combat damage to a player, put a +1/+1 counter on that creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Ukkima, Stalking Shadow?",
        effect: {
          kind: "search-library",
          filter: { name: "Ukkima, Stalking Shadow" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Ukkima, Stalking Shadow, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control deals combat damage to a player, put a +1/+1 counter on that creature.",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Nikara, Lair Scavenger",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  pairing: { kind: "partner-with", name: "Yannik, Scavenging Sentinel" },
  text: "Partner with Yannik, Scavenging Sentinel (When this creature enters, target player may put Yannik into their hand from their library, then shuffle.)\nMenace\nWhenever another creature you control leaves the battlefield, if it had one or more counters on it, you draw a card and you lose 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        // "… **may** search": that player's choice, so declining neither
        // searches nor shuffles their library.
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Yannik, Scavenging Sentinel?",
        effect: {
          kind: "search-library",
          filter: { name: "Yannik, Scavenging Sentinel" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Yannik, Scavenging Sentinel, reveal it, put it into their hand, then shuffle.",
    },
    {
      // "If it had one or more counters on it" reads the creature as it last
      // existed on the battlefield (its rulings) — the trigger filter's view
      // of a departed permanent, as Leader's Talent's.
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever another creature you control leaves the battlefield, if it had one or more counters on it, you draw a card and you lose 1 life.",
    },
  ],
});

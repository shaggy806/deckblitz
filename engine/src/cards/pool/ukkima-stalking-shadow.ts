import { defineCard } from "../define.js";

// Commander 2020. "Use Ukkima's power as it last existed on the battlefield"
// (its ruling): `powerOf: "source"` on a leaves trigger reads the departed
// permanent's last-known information.

const LEAVES = "When Ukkima leaves the battlefield, it deals X damage to target player and you gain X life, where X is its power.";

export default defineCard({
  name: "Ukkima, Stalking Shadow",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Whale", "Wolf"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner-with", name: "Cazur, Ruthless Stalker" },
  text: `Partner with Cazur, Ruthless Stalker (When this creature enters, target player may put Cazur into their hand from their library, then shuffle.)\nUkkima can't be blocked.\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Cazur, Ruthless Stalker?",
        effect: {
          kind: "search-library",
          filter: { name: "Cazur, Ruthless Stalker" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Cazur, Ruthless Stalker, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          { kind: "gain-life", amount: { powerOf: "source" } },
        ],
      },
      resolve: null,
      text: LEAVES,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "Ukkima can't be blocked.",
    },
  ],
});

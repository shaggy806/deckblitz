import { defineCard } from "../define.js";

const DUALCAST_TEXT = "Dualcast — The second spell you cast each turn costs {2} less to cast.";

export default defineCard({
  name: "Alisaie Leveilleur",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  pairing: { kind: "partner-with", name: "Alphinaud Leveilleur" },
  text: `Partner with Alphinaud Leveilleur (When this creature enters, target player may put Alphinaud Leveilleur into their hand from their library, then shuffle.)\nFirst strike\n${DUALCAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        // "… **may** search": that player's choice (`each-player-may`), so
        // declining neither searches nor shuffles their library.
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Alphinaud Leveilleur?",
        effect: {
          kind: "search-library",
          filter: { name: "Alphinaud Leveilleur" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Alphinaud Leveilleur, reveal it, put it into their hand, then shuffle.",
    },
  ],
  static: [
    {
      // Spells cast before she entered count (the ruling): one spell cast
      // this turn so far makes the next one the second.
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 1, atMost: 1 },
      costModification: { applies: {}, caster: "you", reduceGeneric: 2 },
      text: DUALCAST_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Bebop, Skull & Crossbones",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Boar", "Mutant"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  pairing: { kind: "partner-with", name: "Rocksteady, Mutant Marauder" },
  text:
    "Partner with Rocksteady, Mutant Marauder (When this creature enters, target player may put Rocksteady into their hand from their library, then shuffle.)\n" +
    "Deathtouch\n" +
    "Whenever Bebop deals combat damage to a player, you may draw X cards, where X is the number of counters on Bebop. If you do, you lose X life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Search your library for a card named Rocksteady, Mutant Marauder?",
        effect: {
          kind: "search-library",
          filter: { name: "Rocksteady, Mutant Marauder" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Rocksteady, Mutant Marauder, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card for each counter on Bebop, then lose that much life?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { countersOn: "source" } },
            { kind: "lose-life", who: "you", amount: { countersOn: "source" } },
          ],
        },
      },
      resolve: null,
      text: "Whenever Bebop deals combat damage to a player, you may draw X cards, where X is the number of counters on Bebop. If you do, you lose X life.",
    },
  ],
});

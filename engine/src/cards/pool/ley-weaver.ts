import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 14010.
//
// Rulings:
//   [2018-06-08] A nonlegendary creature can't be your commander, even if it has a "partner with"
//     ability.
//
// Lore Weaver's partner trigger; Garruk Wildspeaker's two distinct land targets.

export default defineCard({
  name: "Ley Weaver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner-with", name: "Lore Weaver" },
  text: "Partner with Lore Weaver (When this creature enters, target player may put Lore Weaver into their hand from their library, then shuffle.)\n{T}: Untap two target lands.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land", { kind: "other", of: "land", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: "{T}: Untap two target lands.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Lore Weaver?",
        effect: {
          kind: "search-library",
          filter: { name: "Lore Weaver" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Lore Weaver, reveal it, put it into their hand, then shuffle.",
    },
  ],
});

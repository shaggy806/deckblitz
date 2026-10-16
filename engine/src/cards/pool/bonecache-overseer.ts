import { defineCard } from "../define.js";

// EDHREC rank 9284. Bloomburrow.
//
// Essence Anchor's "a card left your graveyard this turn", counted to three —
// each card each time it leaves, for anywhere (the ruling) — or Elanor
// Gardner's "you've sacrificed a Food this turn", any Food artifact, read as
// it was when sacrificed.
const TEXT =
  "{T}, Pay 1 life: Draw a card. Activate only if three or more cards left your graveyard this turn or if you've sacrificed a Food this turn.";

export default defineCard({
  name: "Bonecache Overseer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warlock"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1 },
      condition: {
        kind: "any",
        of: [
          { kind: "turn-stat", stat: "cards-left-graveyard", who: "you", atLeast: 3 },
          { kind: "turn-history", what: "sacrificed", who: "you", filter: { subtype: "Food" } },
        ],
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

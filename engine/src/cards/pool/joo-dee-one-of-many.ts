import { defineCard } from "../define.js";

// EDHREC rank 11579.
//
// Rulings:
//   [2025-10-02] If you control no creatures other than Joo Dee and no artifacts as the ability
//     resolves, you'll need to sacrifice either Joo Dee or the token copy.
//   [2025-10-02] The sacrifice part of Joo Dee's ability happens as part of the resolution of the
//     ability. Players cannot do anything between creating the copy and sacrificing an artifact or
//     creature.
//
// The sacrifice is its controller's choice among every artifact and creature
// they control as it comes — the copy just made and Joo Dee included.

const ABILITY_TEXT =
  "{B}, {T}: Surveil 1. Create a token that's a copy of this creature, then sacrifice an artifact or creature. Activate only as a sorcery.";

export default defineCard({
  name: "Joo Dee, One of Many",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 2,
  text: `${ABILITY_TEXT} (To surveil 1, look at the top card of your library. You may put it into your graveyard.)`,
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 1 },
          { kind: "create-token-copy", of: "source", count: 1 },
          { kind: "sacrifice", who: "you", filter: { typesAnyOf: ["artifact", "creature"] }, count: 1 },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
      sorcerySpeed: true,
    },
  ],
});

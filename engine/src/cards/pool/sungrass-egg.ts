import { defineCard } from "../define.js";

// EDHREC rank 24023.
//
// The 2008 ruling calling this a mana ability predates the change to rule
// 605.1a: an ability whose effect moves a card from a library (the draw) is
// no longer a mana ability, so it uses the stack (Chromatic Sphere's 2026
// ruling) — `isManaAbility` rejects an effect that isn't only add-mana.

export default defineCard({
  name: "Sungrass Egg",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Sacrifice this artifact: Add {G}{W}. Draw a card. (Activate only as an instant.)",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: { all: ["G", "W"] }, amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Add {G}{W}. Draw a card.",
    },
  ],
});

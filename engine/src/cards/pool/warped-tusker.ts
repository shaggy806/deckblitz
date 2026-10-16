import { defineCard } from "../define.js";

// EDHREC rank 13236.
// Makes Eldrazi Spawn → use "Eldrazi Spawn Token".
//
// Rulings:
//   [2024-06-07] The triggered ability will resolve before Warped Tusker or its cycling ability
//     does, as appropriate. If Warped Tusker or its cycling ability are countered or otherwise
//     leave the stack in response to that triggered ability, the triggered ability will still
//     resolve as normal.
//
// Drownyard Lurker's shape: a `this-cast` and a `this-cycled` trigger with the
// same effect.
const SPAWN_TEXT =
  'When you cast or cycle Warped Tusker, create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Warped Tusker",
  manaCost: "{7}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Boar", "Beast"],
  power: 6,
  toughness: 8,
  keywords: ["reach"],
  cycling: { cost: "{2}{G}" },
  text: `Reach\n${SPAWN_TEXT}\nCycling {2}{G} ({2}{G}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: SPAWN_TEXT,
    },
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: SPAWN_TEXT,
    },
  ],
});

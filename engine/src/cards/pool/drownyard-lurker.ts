import { defineCard } from "../define.js";

// EDHREC rank 13181.
// Makes Eldrazi Spawn → use "Eldrazi Spawn Token".
//
// Rulings:
//   [2024-06-07] Drownyard Lurker's triggered ability will resolve before either Drownyard Lurker
//     or its cycling ability does, as appropriate. If Drownyard Lurker or its cycling ability are
//     countered or otherwise leave the stack in response to that triggered ability, the triggered
//     ability will still resolve as normal.
//
// "When you cast or cycle" is one ability with two trigger events, written as a
// `this-cast` and a `this-cycled` trigger with the same effect: each goes on
// the stack above the spell or the cycling ability, and resolves first.
const SPAWN_TEXT =
  'When you cast or cycle Drownyard Lurker, create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Drownyard Lurker",
  manaCost: "{7}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Trilobite"],
  power: 7,
  toughness: 7,
  keywords: ["vigilance"],
  cycling: { cost: "{2}{U}" },
  text: `Vigilance\n${SPAWN_TEXT}\nCycling {2}{U} ({2}{U}, Discard this card: Draw a card.)`,
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

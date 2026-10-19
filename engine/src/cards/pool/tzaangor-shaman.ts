import { defineCard } from "../define.js";

// EDHREC rank 15540.
//
// Rulings:
//   [2022-10-07] If Tzaangor Shaman deals combat damage to a player more than one time in a turn,
//     perhaps because it has gained double strike, its delayed triggered ability will trigger that
//     many times when you cast your next instant or sorcery spell this turn.
//
// Twinferno's delayed trigger, set up once per combat damage event: each one
// waits for the next instant or sorcery spell this turn.

const ELIXIR_TEXT =
  "Sorcerous Elixir — Whenever this creature deals combat damage to a player, copy the next instant or sorcery spell you cast this turn when you cast it. You may choose new targets for the copy.";

export default defineCard({
  name: "Tzaangor Shaman",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Mutant", "Shaman"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ELIXIR_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "Copy that spell. You may choose new targets for the copy.",
      },
      resolve: null,
      text: ELIXIR_TEXT,
    },
  ],
});

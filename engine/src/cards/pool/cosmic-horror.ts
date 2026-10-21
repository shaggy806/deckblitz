import { defineCard } from "../define.js";

// EDHREC rank 28687.
//
// Rulings:
//   [2004-10-04] If you choose not to pay Cosmic Horror's upkeep cost, it deals 7 damage to you
//     only if it's actually destroyed. If it regenerates or an effect has given it indestructible,
//     it deals no damage.
//
// "If this creature is destroyed this way" is the `destroyed` this-way gate,
// which a regeneration shield or indestructible leaves unmet. The damage is
// dealt by the Horror as it last existed (rule 608.2h).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, destroy this creature unless you pay {3}{B}{B}{B}. If this creature is destroyed this way, it deals 7 damage to you.";

export default defineCard({
  name: "Cosmic Horror",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 7,
  toughness: 7,
  keywords: ["first-strike"],
  text: `First strike\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}{B}{B}{B}", text: "Pay {3}{B}{B}{B}" }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "destroyed", atLeast: 1 },
              then: { kind: "damage", amount: 7, who: "you" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

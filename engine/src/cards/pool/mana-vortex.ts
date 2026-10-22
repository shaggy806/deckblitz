import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 20589.
//
// Rulings:
//   When you cast Mana Vortex, its first ability triggers and goes on the stack on top of the Mana
//     Vortex spell. The triggered ability resolves first. When it resolves, you either sacrifice a
//     land or you counter Mana Vortex.
//   Mana Vortex's third ability is a "state trigger." Once a state trigger triggers, it won't
//     trigger again as long as the ability is on the stack. If the ability is countered and the
//     trigger condition is still true, it will immediately trigger again.

const CAST = "When you cast this spell, counter it unless you sacrifice a land.";
const UPKEEP = "At the beginning of each player's upkeep, that player sacrifices a land of their choice.";
const NO_LANDS = "When there are no lands on the battlefield, sacrifice this enchantment.";
const ANY_LAND = { type: "land" } as const;

export default defineCard({
  name: "Mana Vortex",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${CAST}\n${UPKEEP}\n${NO_LANDS}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: ANY_LAND, text: "Sacrifice a land" }],
        otherwise: { kind: "counter", target: "source" },
      },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "sacrifice", who: "active-player", filter: ANY_LAND, count: 1 },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: {
        on: "state",
        state: {
          kind: "all",
          of: [
            { kind: "not", of: { kind: "controls", filter: ANY_LAND, atLeast: 1 } },
            { kind: "not", of: { kind: "opponent-controls", filter: ANY_LAND, atLeast: 1 } },
          ],
        },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: NO_LANDS,
    },
  ],
});

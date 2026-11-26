import { defineCard } from "../define.js";

// EDHREC rank 20245.
// Rulings:
//   The ability still gives a poison counter even if Sabertooth Cobra leaves the battlefield
//     before the next upkeep.
//
// Any damage to a player, combat or not. "Unless they pay {2} before that
// step" is the damaged player's special action (rule 116.2c,
// `pay-delayed-deadline`): any time they have priority until their next
// upkeep begins, and paid, the delayed ability never triggers.

const TEXT =
  "Whenever this creature deals damage to a player, that player gets a poison counter. The player gets another poison counter at the beginning of their next upkeep unless they pay {2} before that step. (A player with ten or more poison counters loses the game.)";

export default defineCard({
  name: "Sabertooth Cobra",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-player" },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep", whose: "trigger-player" },
            unlessPaid: { by: "trigger-player", cost: "{2}" },
            effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "that-player" },
            text: "The player gets another poison counter unless they paid {2} before this step.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

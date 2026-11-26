import { defineCard } from "../define.js";

// EDHREC rank 28092.
// Rulings:
//   After Glass Asp's triggered ability resolves, the affected player has the ability to perform
//     a special action of paying {2}. This action may be performed any time the player has
//     priority, and it doesn't use the stack. It may be performed only once. Once that player's
//     next draw step begins, the player no longer has the ability to perform this action.
//
// The special action is `pay-delayed-deadline` (rule 116.2c).

const TEXT =
  "Whenever this creature deals combat damage to a player, that player loses 2 life at the beginning of their next draw step unless they pay {2} before that step.";

export default defineCard({
  name: "Glass Asp",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "draw", whose: "trigger-player" },
        unlessPaid: { by: "trigger-player", cost: "{2}" },
        effect: { kind: "lose-life", amount: 2, who: "that-player" },
        text: "That player loses 2 life unless they paid {2} before this step.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

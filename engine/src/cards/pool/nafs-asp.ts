import { defineCard } from "../define.js";

// EDHREC rank 29788.
// Rulings:
//   If it damages a player twice, they get to pay or take damage twice during their next draw
//     step.
//   The ability does not cause itself to trigger again. It cause loss of life, and not damage.
//   If its damage gets redirected to its controller, it will still trigger the ability.
//   The player can pay the {1} mana at any time after damage is done before the draw step of that
//     player's turn. People commonly pay during upkeep.
//
// Any damage to any player. Each trigger sets up its own delayed ability, paid
// for on its own: the special action `pay-delayed-deadline` (rule 116.2c).

const TEXT =
  "Whenever this creature deals damage to a player, that player loses 1 life at the beginning of their next draw step unless they pay {1} before that draw step.";

export default defineCard({
  name: "Nafs Asp",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "draw", whose: "trigger-player" },
        unlessPaid: { by: "trigger-player", cost: "{1}" },
        effect: { kind: "lose-life", amount: 1, who: "that-player" },
        text: "That player loses 1 life unless they paid {1} before this draw step.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

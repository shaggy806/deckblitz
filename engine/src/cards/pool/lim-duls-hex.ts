import { defineCard } from "../define.js";

// Ice Age. `unless` naming the player a `for-each-player` is on. "{B} or {3}" is
// two mana payments, one nested in the other's `otherwise`: a player offered
// either, the damage only after declining both.

const TEXT =
  "At the beginning of your upkeep, for each player, this enchantment deals 1 damage to that player unless they pay {B} or {3}.";

export default defineCard({
  name: "Lim-Dûl's Hex",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "unless",
          chooser: "that-player",
          options: [{ pay: "{B}", text: "Pay {B}" }],
          otherwise: {
            kind: "unless",
            chooser: "that-player",
            options: [{ pay: "{3}", text: "Pay {3}" }],
            otherwise: { kind: "damage", amount: 1, who: "that-player" },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

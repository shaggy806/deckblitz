import { defineCard } from "../define.js";

// Rulings:
//   In a multiplayer game, if Captive Audience's owner leaves the game, Captive Audience leaves the
//     game with them. If its controller leaves the game, it's exiled (assuming that player wasn't
//     also its owner).
//   If all three modes have been chosen, its triggered ability is removed from the stack with no
//     effect, but it remains on the battlefield.
//   Once Captive Audience is controlled by your opponent, its ability triggers during that player's
//     upkeep and that player makes all choices for it. That player is affected by its first two
//     modes, and that player's opponents create the tokens for its last mode.
//   You may choose its first mode even if your life total is already 4. Similarly, you may choose
//     its second mode even if you have no cards in hand.
const ENTERS = "This enchantment enters under the control of an opponent of your choice.";
const UPKEEP =
  "At the beginning of your upkeep, choose one that hasn't been chosen —\n• Your life total becomes 4.\n• Discard your hand.\n• Each opponent creates five 2/2 black Zombie creature tokens.";

export default defineCard({
  name: "Captive Audience",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${ENTERS}\n${UPKEEP}`,
  choosePlayerOnEnter: "opponent",
  entersUnderChosenPlayer: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Your life total becomes 4.", effect: { kind: "set-life-total", who: "you", amount: 4 } },
          { text: "Discard your hand.", effect: { kind: "discard-hand", who: "you" } },
          {
            text: "Each opponent creates five 2/2 black Zombie creature tokens.",
            effect: { kind: "create-token", token: "Zombie Token", count: 5, who: "each-opponent" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});

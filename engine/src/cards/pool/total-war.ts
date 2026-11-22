import { defineCard } from "../define.js";

// EDHREC rank 20185.
//
// Rulings:
//   Destroys creatures as a triggered ability on the declaration of attackers.
//
// "That player" is the attacking player, the active player (rule 508.1).
// "Didn't attack" is that declaration's (`attackedThisCombat: false`): a
// creature that attacked in an earlier combat this turn is destroyed, one
// declared and since removed from combat still attacked (rule 506.4).
// "Hasn't controlled continuously since the beginning of the turn" is
// `controlledSinceTurnBegan`.

const TEXT =
  "Whenever a player attacks with one or more creatures, destroy all untapped non-Wall creatures that player controls that didn't attack, except for creatures the player hasn't controlled continuously since the beginning of the turn.";

export default defineCard({
  name: "Total War",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "any" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: {
          type: "creature",
          notSubtypes: ["Wall"],
          tapped: false,
          controlledBy: "active-player",
          controlledSinceTurnBegan: true,
          attackedThisCombat: false,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

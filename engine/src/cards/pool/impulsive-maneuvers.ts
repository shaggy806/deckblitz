import { defineCard } from "../define.js";

// EDHREC rank 10797.
//
// Ruling: you flip a coin for each creature that attacks, not once per attack.

const TEXT =
  "Whenever a creature attacks, flip a coin. If you win the flip, the next time that creature would deal combat damage this turn, it deals double that damage instead. If you lose the flip, the next time that creature would deal combat damage this turn, prevent that damage.";

// Each a one-shot shield on that creature's next combat damage this turn
// (rules 614.1a, 615.8): all it deals at once — a trampler's to its blocker
// and the player alike — is one event, so the whole of it is doubled or
// prevented, and the shield is spent. With double strike that's the first-
// strike damage. A creature that has left the battlefield since is a new
// object (rule 400.7) the shield doesn't follow.
export default defineCard({
  name: "Impulsive Maneuvers",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any" },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: {
          kind: "replacement-effect",
          replacement: { event: "would-deal-damage", combat: true, instead: { modify: { times: 2 } } },
          duration: "end-of-turn",
          next: true,
          fromObject: "trigger-object",
        },
        lost: {
          kind: "replacement-effect",
          replacement: { event: "would-deal-damage", combat: true, instead: { prevent: true } },
          duration: "end-of-turn",
          next: true,
          fromObject: "trigger-object",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

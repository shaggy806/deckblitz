import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 18208.
//
// Rulings:
//   [2004-10-04] The controller of the ability chooses one of their opponents. If this card
//     changes controllers before the ability resolves, you still pick an opponent of the player
//     who controlled it when it was activated.
//   [2004-10-04] If you activate this multiple times in a row so the stack has more than one of
//     this ability on it, the abilities will still resolve even if Goblin Festival leaves the
//     battlefield or leaves your control before they resolve. For example, if activate the ability
//     twice, and after the first flip you lose control of it because you lost the toss, or it
//     leaves the battlefield, then you still flip for the second ability.
//
// The give-away is Rainbow Vale's: `choose-opponent` asks the ability's
// controller (the activating player), and that opponent gains control of the
// source for good. A Festival that has left the battlefield is a new object
// and isn't given away; the flip still happens.

const TEXT =
  "{2}: This enchantment deals 1 damage to any target. Flip a coin. If you lose the flip, choose one of your opponents. That player gains control of this enchantment.";

export default defineCard({
  name: "Goblin Festival",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          {
            kind: "flip-coin",
            lost: {
              kind: "choose-opponent",
              then: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

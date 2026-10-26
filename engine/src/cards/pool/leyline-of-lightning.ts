import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 13275.
//
// The target is chosen as the trigger goes on the stack; {1} is paid once at
// most as it resolves (the ruling: not several times for more damage).

const TEXT =
  "Whenever you cast a spell, you may pay {1}. If you do, this enchantment deals 1 damage to target player or planeswalker.";

export default defineCard({
  name: "Leyline of Lightning",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `If this card is in your opening hand, you may begin the game with it on the battlefield.\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have Leyline of Lightning deal 1 damage?",
        cost: "{1}",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

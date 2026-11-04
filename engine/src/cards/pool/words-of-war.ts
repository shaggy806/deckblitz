import { defineCard } from "../define.js";

// Ruling:
//   If multiple Words have been used prior to drawing a card, you choose which one to apply
//   (and use up) each time you draw a card.
//
// "Any target" makes this a targeted ability (rule 115.1b): the target is chosen
// as it's activated, and carried until the draw it replaces.
const TEXT = "{1}: The next time you would draw a card this turn, this enchantment deals 2 damage to any target instead.";

export default defineCard({
  name: "Words of War",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        nextDrawInstead: {
          effect: { kind: "damage", amount: 2, target: 0 },
          text: "~ deals 2 damage to any target instead.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 11799.
// The targeted player's hand is counted as the ability resolves (the ruling) —
// `{ cardsInHand: "each" }` on a `damage` to a target player is that player's
// hand (Storm Seeker). Any player may be targeted, not only the dead
// creature's controller.

const TEXT = "Whenever a creature dies, you may have this enchantment deal damage to target player equal to the number of cards in that player's hand.";

export default defineCard({
  name: "Vicious Shadows",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have Vicious Shadows deal damage to the target player equal to the number of cards in their hand?",
        effect: { kind: "damage", target: 0, amount: { cardsInHand: "each" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

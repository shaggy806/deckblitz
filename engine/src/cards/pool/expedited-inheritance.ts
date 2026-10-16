import { defineCard } from "../define.js";

// EDHREC rank 11839.
//
// "Its controller" is the damaged creature's controller as the damage is
// dealt — the `trigger-player` of a `dealt-damage` trigger (Repercussion).
// The choice is theirs and so is the exile: an `each-player-may` asking
// them, inside which "you" is that player — their library, their
// permission, and "until the end of their next turn" counted from their
// turns. "That many" is the damage dealt. The permission follows the normal
// timing and costs (the ruling).
const TEXT =
  "Whenever a creature is dealt damage, its controller may exile that many cards from the top of their library. They may play those cards until the end of their next turn.";

export default defineCard({
  name: "Expedited Inheritance",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        prompt: "Exile that many cards from the top of your library? You may play them until the end of your next turn.",
        effect: { kind: "impulse-exile", amount: { triggerValue: true }, duration: "your-next-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

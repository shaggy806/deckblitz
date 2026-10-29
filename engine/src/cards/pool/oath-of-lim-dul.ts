import { defineCard } from "../define.js";

// EDHREC rank 21531.
// One choice per 1 life lost: discard a card, or sacrifice another permanent.

const LOSS_TEXT =
  "Whenever you lose life, for each 1 life you lost, sacrifice a permanent other than this enchantment unless you discard a card.";

export default defineCard({
  name: "Oath of Lim-Dûl",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${LOSS_TEXT} (Damage dealt to you causes you to lose life.)\n{B}{B}: Draw a card.`,
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{B}{B}: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "loses-life", who: "you" },
      targets: [],
      effect: {
        kind: "repeat",
        times: { triggerValue: true },
        effect: {
          kind: "unless",
          chooser: "you",
          options: [{ discard: 1, text: "Discard a card" }],
          otherwise: { kind: "sacrifice", who: "you", filter: {}, count: 1, exceptSource: true },
        },
      },
      resolve: null,
      text: LOSS_TEXT,
    },
  ],
});

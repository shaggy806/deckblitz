import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, you may sacrifice another enchantment. If you do, search your library for a creature card with mana value equal to 1 plus the sacrificed enchantment's mana value, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Enigmatic Incarnation",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // Vivien on the Hunt's shape: one sacrifice, one find.
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "enchantment" }, exceptSource: true, text: "Sacrifice another enchantment" }],
        ifDid: {
          kind: "search-library",
          filter: {
            type: "creature",
            manaValue: { op: "eq", n: { amount: { sum: [{ manaValueOf: "sacrificed" }, 1] } } },
          },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

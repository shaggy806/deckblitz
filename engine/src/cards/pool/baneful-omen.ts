import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, you may reveal the top card of your library. If you do, each opponent loses life equal to that card's mana value.";

export default defineCard({
  name: "Baneful Omen",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // reveal-top hands the revealed card to `then` as target 0; with an
      // empty library nothing is revealed and the mana value reads 0.
      effect: {
        kind: "may",
        prompt: "Reveal the top card of your library?",
        effect: {
          kind: "reveal-top",
          then: { kind: "lose-life", who: "each-opponent", amount: { manaValueOf: 0 } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

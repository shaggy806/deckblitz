import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.";

export default defineCard({
  name: "White Rhystic Study",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

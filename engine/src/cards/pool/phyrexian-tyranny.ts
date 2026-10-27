import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 8234.
//
// Ruling: it triggers once for each card drawn (the `draws` trigger fires per
// card); the drawer is the trigger object's controller.

const TEXT = "Whenever a player draws a card, that player loses 2 life unless they pay {2}.";

export default defineCard({
  name: "Phyrexian Tyranny",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "any" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

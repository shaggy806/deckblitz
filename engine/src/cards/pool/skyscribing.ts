import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 9631.
export default defineCard({
  name: "Skyscribing",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player draws X cards.\nForecast — {2}{U}, Reveal this card from your hand: Each player draws a card. (Activate only during your upkeep and only once each turn.)",
  effect: { kind: "draw", amount: "x", who: "each-player" },
  activated: [
    forecast({
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "each-player" },
      resolve: null,
      text: "Forecast — {2}{U}, Reveal this card from your hand: Each player draws a card. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});

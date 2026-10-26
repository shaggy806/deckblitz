import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// EDHREC rank 17585.
export default defineCard({
  name: "Spirit en-Dal",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nForecast — {1}{W}, Reveal this creature from your hand: Target creature gains shadow until end of turn. (Activate only during your upkeep and only once each turn.)",
  activated: [
    forecast({
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "shadow", duration: "end-of-turn" },
      resolve: null,
      text: "Forecast — {1}{W}, Reveal this creature from your hand: Target creature gains shadow until end of turn. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});

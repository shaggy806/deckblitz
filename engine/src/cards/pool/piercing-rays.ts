import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// EDHREC rank 21845.
export default defineCard({
  name: "Piercing Rays",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target tapped creature.\nForecast — {2}{W}, Reveal this card from your hand: Tap target untapped creature. (Activate this ability only during your upkeep and only once each turn.)",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "exile", target: 0 },
  activated: [
    forecast({
      cost: { mana: "{2}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { tapped: false, type: "creature" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Forecast — {2}{W}, Reveal this card from your hand: Tap target untapped creature. (Activate this ability only during your upkeep and only once each turn.)",
    }),
  ],
});

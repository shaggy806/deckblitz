import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 30867.
export default defineCard({
  name: "Steeling Stance",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +1/+1 until end of turn.\nForecast — {W}, Reveal this card from your hand: Target creature gets +1/+1 until end of turn. (Activate only during your upkeep and only once each turn.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
  activated: [
    forecast({
      cost: { mana: "{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Forecast — {W}, Reveal this card from your hand: Target creature gets +1/+1 until end of turn. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});

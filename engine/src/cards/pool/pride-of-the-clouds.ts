import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 16089.
export default defineCard({
  name: "Pride of the Clouds",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature gets +1/+1 for each other creature on the battlefield with flying.\nForecast — {2}{W}{U}, Reveal this creature from your hand: Create a 1/1 white and blue Bird creature token with flying. (Activate only during your upkeep and only once each turn.)",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", keyword: "flying" }, pt: [1, 1], excludeSelf: true },
      text: "This creature gets +1/+1 for each other creature on the battlefield with flying.",
    },
  ],
  activated: [
    forecast({
      cost: { mana: "{2}{W}{U}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token (White-Blue)", count: 1 },
      resolve: null,
      text: "Forecast — {2}{W}{U}, Reveal this creature from your hand: Create a 1/1 white and blue Bird creature token with flying. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});

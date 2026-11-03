import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

const LINK = "Whenever this creature deals damage, you gain that much life.";
const FORECAST =
  "Forecast — {1}{W}, Reveal this card from your hand: Whenever target creature deals damage this turn, you gain that much life. (Activate only during your upkeep and only once each turn.)";

export default defineCard({
  name: "Paladin of Prahv",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  text: `${LINK}\n${FORECAST}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: LINK,
    },
  ],
  activated: [
    forecast({
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "deals-damage", who: "self" }, watching: 0 },
        effect: { kind: "gain-life", amount: { triggerValue: true } },
        text: "Whenever target creature deals damage this turn, you gain that much life.",
      },
      resolve: null,
      text: FORECAST,
    }),
  ],
});

import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 25583.
export default defineCard({
  name: "Plumes of Peace",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.\nForecast — {W}{U}, Reveal this card from your hand: Tap target creature. (Activate only during your upkeep and only once each turn.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
  activated: [
    forecast({
      cost: { mana: "{W}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Forecast — {W}{U}, Reveal this card from your hand: Tap target creature. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});

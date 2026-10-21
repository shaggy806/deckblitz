import { defineCard } from "../define.js";

const STATIC_TEXT =
  "Enchanted creature has indestructible and is goaded. (It attacks each combat if able and attacks a player other than you if able.)";
const EXILE_TEXT = "{1}{W}: Exile enchanted creature.";

export default defineCard({
  name: "Redemption Arc",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["indestructible"], goads: true, text: STATIC_TEXT }],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});

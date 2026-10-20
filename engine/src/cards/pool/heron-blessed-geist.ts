import { defineCard } from "../define.js";

const GRAVE_TEXT =
  "{3}{W}, Exile this card from your graveyard: Create two 1/1 white Spirit creature tokens with flying. Activate only if you control an enchantment and only as a sorcery.";

export default defineCard({
  name: "Heron-Blessed Geist",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${GRAVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 2 },
      resolve: null,
      text: GRAVE_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});

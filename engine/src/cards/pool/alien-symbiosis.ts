import { defineCard } from "../define.js";

const PUMP = "Enchanted creature gets +1/+1, has menace, and is a Symbiote in addition to its other types.";
const GRAVEYARD =
  "You may cast this card from your graveyard by discarding a card in addition to paying its other costs.";

export default defineCard({
  name: "Alien Symbiosis",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${GRAVEYARD}`,
  targets: ["creature"],
  castSelfFromGraveyard: { discard: 1 },
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["menace"],
      addSubtypes: ["Symbiote"],
      text: PUMP,
    },
  ],
});

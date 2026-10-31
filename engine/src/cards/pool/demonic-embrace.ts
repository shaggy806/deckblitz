import { defineCard } from "../define.js";

const BUFF_TEXT = "Enchanted creature gets +3/+1, has flying, and is a Demon in addition to its other types.";
const CAST_TEXT =
  "You may cast this card from your graveyard by paying 3 life and discarding a card in addition to paying its other costs.";

// Its own graveyard permission, with two extra costs (`castSelfFromGraveyard`):
// 3 life, and a card discarded as the cost is paid. Another permission to
// cast it from the graveyard doesn't add them (its ruling), and the timing
// is an Aura's as ever.
export default defineCard({
  name: "Demonic Embrace",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BUFF_TEXT}\n${CAST_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 1],
      grantKeywords: ["flying"],
      addSubtypes: ["Demon"],
      text: BUFF_TEXT,
    },
  ],
  castSelfFromGraveyard: { payLife: 3, discard: 1 },
});

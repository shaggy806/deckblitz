import { defineCard } from "../define.js";
import { auraSwap } from "../helpers.js";

// Planar Chaos. EDHREC rank 20320.
//
// Aura swap (rule 702.65): the Aura card from your hand enters attached to the
// creature this enchants — not cast, so it targets nothing — and this returns
// to your hand. One that can't legally enchant that creature stays in hand, and
// then this stays too (702.65b).
export default defineCard({
  name: "Arcanum Wings",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text:
    "Enchant creature\n" +
    "Enchanted creature has flying.\n" +
    "Aura swap {2}{U} ({2}{U}: Exchange this Aura with an Aura card in your hand.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
  ],
  activated: [auraSwap("{2}{U}")],
});

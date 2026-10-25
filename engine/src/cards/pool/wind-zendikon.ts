import { defineCard } from "../define.js";

// Worldwake (WWK). Nissa's Zendikon's shape; the land's colour (blue) is
// set in layer 5 (`setColors`).

const ANIMATE_TEXT = "Enchanted land is a 2/2 blue Elemental creature with flying. It's still a land.";
const DIES_TEXT = "When enchanted land dies, return that card to its owner's hand.";

export default defineCard({
  name: "Wind Zendikon",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ANIMATE_TEXT}\n${DIES_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Elemental"],
      setColors: ["U"],
      setBasePt: { power: 2, toughness: 2 },
      grantKeywords: ["flying"],
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

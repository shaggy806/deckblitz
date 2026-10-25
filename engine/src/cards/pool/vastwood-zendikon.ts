import { defineCard } from "../define.js";

// Worldwake (WWK). Nissa's Zendikon's shape; the land's colour (green) is
// set in layer 5 (`setColors`).

const ANIMATE_TEXT = "Enchanted land is a 6/4 green Elemental creature. It's still a land.";
const DIES_TEXT = "When enchanted land dies, return that card to its owner's hand.";

export default defineCard({
  name: "Vastwood Zendikon",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ANIMATE_TEXT}\n${DIES_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Elemental"],
      setColors: ["G"],
      setBasePt: { power: 6, toughness: 4 },
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

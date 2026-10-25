import { defineCard } from "../define.js";

// Worldwake (WWK). Nissa's Zendikon's shape; the land's colour (red) is
// set in layer 5 (`setColors`).

const ANIMATE_TEXT = "Enchanted land is a 4/2 red Beast creature with trample. It's still a land.";
const DIES_TEXT = "When enchanted land dies, return that card to its owner's hand.";

export default defineCard({
  name: "Crusher Zendikon",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ANIMATE_TEXT}\n${DIES_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Beast"],
      setColors: ["R"],
      setBasePt: { power: 4, toughness: 2 },
      grantKeywords: ["trample"],
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

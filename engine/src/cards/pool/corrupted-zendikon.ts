import { defineCard } from "../define.js";

// Worldwake (WWK). Nissa's Zendikon's shape; the land's colour (black) is
// set in layer 5 (`setColors`).

const ANIMATE_TEXT = "Enchanted land is a 3/3 black Ooze creature. It's still a land.";
const DIES_TEXT = "When enchanted land dies, return that card to its owner's hand.";

export default defineCard({
  name: "Corrupted Zendikon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ANIMATE_TEXT}\n${DIES_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Ooze"],
      setColors: ["B"],

      setBasePt: { power: 3, toughness: 3 },
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

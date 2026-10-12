import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 15501. Marvel Super Heroes. Sheltered by Ghosts' granted ward.

const STATIC_TEXT = "Enchanted creature gets +4/+4 and has trample and ward {1}.";

export default defineCard({
  name: "Super Strength",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text:
    `Enchant creature\n${STATIC_TEXT} (Whenever enchanted creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      grantKeywords: ["trample"],
      grantsTriggered: [ward({ mana: "{1}" })],
      text: STATIC_TEXT,
    },
  ],
});

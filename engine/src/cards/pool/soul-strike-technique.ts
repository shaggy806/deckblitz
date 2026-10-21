import { defineCard } from "../define.js";

const STATIC_TEXT = "Enchanted creature gets +1/+1 and has vigilance.";
const DIES_TEXT =
  "When enchanted creature dies, manifest the top card of your library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

// The manifest is this Aura's controller's, from their own library.
export default defineCard({
  name: "Soul-Strike Technique",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

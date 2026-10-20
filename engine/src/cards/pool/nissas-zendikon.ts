import { defineCard } from "../define.js";

// EDHREC rank 21035.
//
// The land keeps its abilities (the ruling) and gets a base 4/4 in layer 7b,
// so counters and pumps apply on top. "Return that card" is the land card
// the dies trigger is about.

const ANIMATE_TEXT = "Enchanted land is a 4/4 Elemental creature with reach and haste. It's still a land.";
const DIES_TEXT = "When enchanted land dies, return that card to its owner's hand.";

export default defineCard({
  name: "Nissa's Zendikon",
  manaCost: "{3}{G}",
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
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["reach", "haste"],
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

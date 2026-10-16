import { defineCard } from "../define.js";

// EDHREC rank 18274.
//
// Puppet Crafting's static (a layer-4 addition and a layer-7b base P/T, so
// later P/T-setting effects overwrite it — the ruling), and Audacity's
// "put into a graveyard from the battlefield" trigger, which a Glyph that
// never resolved (put into the graveyard from the stack) doesn't fire.
const STATIC_TEXT =
  "Enchanted artifact is a Golem creature with base power and toughness 5/4 in addition to its other types.";
const DISCOVER_TEXT = "When this Aura is put into a graveyard from the battlefield, discover 3.";

export default defineCard({
  name: "Zoetic Glyph",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${STATIC_TEXT}\n${DISCOVER_TEXT}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Golem"],
      setBasePt: { power: 5, toughness: 4 },
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "discover", amount: 3 },
      resolve: null,
      text: DISCOVER_TEXT,
    },
  ],
});

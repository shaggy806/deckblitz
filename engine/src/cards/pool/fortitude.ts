import { defineCard } from "../define.js";

const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

// Urza's Saga.
export default defineCard({
  name: "Fortitude",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nSacrifice a Forest: Regenerate enchanted creature.\n${RETURN_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Forest" } } },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "Sacrifice a Forest: Regenerate enchanted creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});

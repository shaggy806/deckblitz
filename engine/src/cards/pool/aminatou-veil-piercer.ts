import { defineCard } from "../define.js";

const MIRACLE_TEXT = "Each enchantment card in your hand has miracle. Its miracle cost is equal to its mana cost reduced by {4}.";

export default defineCard({
  name: "Aminatou, Veil Piercer",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 4,
  text: `At the beginning of your upkeep, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\n${MIRACLE_TEXT} (You may cast a card for its miracle cost when you draw it if it's the first card you drew this turn.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: "At the beginning of your upkeep, surveil 2.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToHand: { filter: { type: "enchantment" }, keywordValues: [{ keyword: "miracle", cost: { manaCostLess: 4 } }] },
      text: MIRACLE_TEXT,
    },
  ],
});

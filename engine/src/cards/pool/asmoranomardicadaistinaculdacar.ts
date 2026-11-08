import { defineCard } from "../define.js";

// No mana cost, so the alternative cost is the only way to cast it (rule
// 118.6a), and only while its condition holds.

const COOKBOOK_TEXT =
  "When Asmoranomardicadaistinaculdacar enters, you may search your library for a card named The Underworld Cookbook, reveal it, put it into your hand, then shuffle.";
const SACRIFICE_TEXT = "Sacrifice two Foods: Target creature deals 6 damage to itself.";

export default defineCard({
  name: "Asmoranomardicadaistinaculdacar",
  colors: ["B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `As long as you've discarded a card this turn, you may pay {B/R} to cast this spell.\n${COOKBOOK_TEXT}\n${SACRIFICE_TEXT}`,
  alternativeCost: { mana: "{B/R}", condition: { kind: "turn-history", what: "discarded" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named The Underworld Cookbook?",
        effect: {
          kind: "search-library",
          filter: { name: "The Underworld Cookbook" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: COOKBOOK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Food" }, count: 2 } },
      targets: ["creature"],
      effect: { kind: "damage", amount: 6, target: 0, from: 0 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});

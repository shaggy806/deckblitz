import { defineCard } from "../define.js";

// EDHREC rank 745. Rulings (2019-10-04): it's just a green Elk — it keeps its
// supertypes but loses its other card types and creature types (setTypes,
// rule 205.1a); a permanent only temporarily a creature stays a creature.

const STATIC_TEXT =
  "Enchanted creature loses all abilities and is a green Elk creature with base power and toughness 3/3. (It loses all other card types and creature types.)";

export default defineCard({
  name: "Kenrith's Transformation",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nWhen this Aura enters, draw a card.\n${STATIC_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setTypes: ["creature"],
      setSubtypes: ["Elk"],
      setColors: ["G"],
      setBasePt: { power: 3, toughness: 3 },
      text: STATIC_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

const SACRIFICE_TEXT =
  "Sacrifice this Aura: Enchanted creature and other creatures that share a creature type with it gain flying until end of turn.";

// Crown of Vigor's shape, granting flying.
export default defineCard({
  name: "Crown of Ascension",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has flying.\n${SACRIFICE_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["flying"], text: "Enchanted creature has flying." }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", sharesCreatureTypeWith: "attached" },
        keyword: "flying",
        duration: "end-of-turn",
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

const SACRIFICE_TEXT =
  "Sacrifice this Aura: Enchanted creature and other creatures that share a creature type with it gain protection from black and from red until end of turn.";

export default defineCard({
  name: "Crown of Awe",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has protection from black and from red.\n${SACRIFICE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { colors: ["B", "R"] },
      text: "Enchanted creature has protection from black and from red.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-protection",
        filter: { type: "creature", sharesCreatureTypeWith: "attached" },
        from: { colors: ["B", "R"] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});

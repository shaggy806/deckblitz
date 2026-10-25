import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 23270.
//
// Rulings:
//   [2015-06-22] Creatures sacrificed to regenerate before combat damage won't deal combat damage;
//     the regeneration must be set up before the creature would be destroyed.
//
// The granted ability is the enchanted creature's own, so "two other
// creatures" are two besides it (`otherOnly`), Zopandrel's cost shape.
const PT_TEXT =
  'Enchanted creature gets +2/+2 and has flying and "Sacrifice two other creatures: Regenerate this creature."';
const REGEN_TEXT = "Sacrifice two other creatures: Regenerate this creature.";

export default defineCard({
  name: "Consecrated by Blood",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PT_TEXT} (The next time the creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      grantsActivated: [
        {
          cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" }, count: 2 } },
          otherOnly: true,
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: REGEN_TEXT,
        },
      ],
      text: PT_TEXT,
    },
  ],
});

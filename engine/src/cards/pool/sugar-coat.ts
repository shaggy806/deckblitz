import { defineCard } from "../define.js";

// EDHREC rank 13914.
//
// Imprisoned in the Moon's shape: an artifact and nothing else (setTypes — its creature
// types go with the creature type, rule 205.1a), its artifact types replaced by Food,
// colourless, with no abilities but the Food one from the same static (613.7). Still
// a legal attachment: it's a Food.
//
// Rulings:
//   [2024-07-26] A creature enchanted with Sugar Coat stops being a creature. Equipment attached
//     to that creature become unattached. Auras attached to that creature will be put into their
//     owner's graveyard (unless they could also enchant a Food artifact).
//   [2024-07-26] The enchanted permanent still retains its name, mana cost, and mana value. It
//     isn't a token unless it already was one.
//   [2024-11-08] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.

const FOOD_TEXT = "{2}, {T}, Sacrifice this artifact: You gain 3 life.";

export default defineCard({
  name: "Sugar Coat",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: 'Flash\nEnchant creature or Food\nEnchanted permanent is a colorless Food artifact with "{2}, {T}, Sacrifice this artifact: You gain 3 life" and loses all other card types and abilities.',
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Food" }] } }],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["artifact"],
      setSubtypes: ["Food"],
      setColors: [],
      loseAllAbilities: true,
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true, sacrifice: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 3 },
          resolve: null,
          text: FOOD_TEXT,
        },
      ],
      text: 'Enchanted permanent is a colorless Food artifact with "{2}, {T}, Sacrifice this artifact: You gain 3 life" and loses all other card types and abilities.',
    },
  ],
});
